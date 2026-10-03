import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import farmService from '@/services/farmService';
import { broadcastSync, subscribeToSync } from '@/utils/syncBroadcaster';

const defaultAnimalContextValue = {
  animals: [],
  milkingLogs: [],
  isLoading: false,
  error: null,
  isModalOpen: false,
  refreshAnimals: async () => {},
  addAnimal: async () => {},
  updateAnimal: async () => {},
  addAnimalIntake: async () => {},
  saveMilkingShift: async () => {},
  deleteAnimal: async () => {},
  deleteMilkingLog: async () => {},
  updateMilkingLog: async () => {},
  openModal: () => {},
  closeModal: () => {},
};

const AnimalContext = createContext(defaultAnimalContextValue);

const normalizeAnimal = (animal, history = []) => {
  const morning = parseFloat(animal.morningYield ?? animal.expectedMorningYield ?? animal.purchaseMorningYield ?? animal.avgMorningYield ?? 0);
  const evening = parseFloat(animal.eveningYield ?? animal.expectedEveningYield ?? animal.purchaseEveningYield ?? animal.avgEveningYield ?? 0);
  const expDaily = parseFloat(animal.expectedYield ?? animal.expectedDailyYield ?? animal.purchaseExpectedYield ?? (morning + evening) ?? 0);

  // Preserve all intake history records from database (animal.intakeHistory) + logs
  const dbIntakeHistory = Array.isArray(animal.intakeHistory) ? animal.intakeHistory : [];
  const existingHistory = Array.isArray(history) && history.length > 0 ? history : (Array.isArray(animal.history) ? animal.history : []);

  // Map and deduplicate all records
  const allEntries = [];
  const seenKeys = new Set();

  [...dbIntakeHistory, ...existingHistory].forEach((item) => {
    if (!item) return;
    const dateStr = item.date
      ? (typeof item.date === 'string' && item.date.includes('T') ? item.date.split('T')[0] : String(item.date).slice(0, 10))
      : '';
    const rawShift = item.shift || (item.morning > 0 ? 'Morning' : 'Evening') || 'Morning';
    const normShift = rawShift.charAt(0).toUpperCase() + rawShift.slice(1).toLowerCase();
    const qty = Number(item.quantityLiters ?? item.yieldLiters ?? item.yield ?? (normShift === 'Evening' ? item.evening : item.morning) ?? 0) || 0;
    const key = `${dateStr}-${normShift}-${qty}`;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      allEntries.push({
        id: item._id || item.id || `INTAKE-${dateStr}-${normShift}-${Math.random().toString(36).substr(2, 5)}`,
        date: dateStr,
        shift: normShift,
        quantityLiters: qty,
        yieldLiters: qty,
        morning: normShift === 'Morning' ? qty : (item.morning || 0),
        evening: normShift === 'Evening' ? qty : (item.evening || 0),
        fat: item.fat || null,
        snf: item.snf || null,
        notes: item.notes || '',
        operator: item.operator || item.operatorId?.name || '',
        createdAt: item.createdAt || (dateStr ? new Date(dateStr).toISOString() : new Date().toISOString()),
      });
    }
  });

  // Sort strictly descending: latest entry at the top
  allEntries.sort((a, b) => {
    const timeA = new Date(a.date || a.createdAt || 0).getTime();
    const timeB = new Date(b.date || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return {
    ...animal,
    id: animal._id || animal.id,
    _id: animal._id || animal.id,
    tag: animal.tag || animal.tagNumber,
    tagNumber: animal.tagNumber || animal.tag,
    species: animal.species || animal.breed || 'Cow',
    lactationStatus: animal.lactationStatus || animal.status || 'Milking',
    expectedMorningYield: morning,
    expectedEveningYield: evening,
    expectedDailyYield: expDaily,
    morningYield: `${morning.toFixed(1)} L`,
    eveningYield: `${evening.toFixed(1)} L`,
    expectedYield: `${expDaily.toFixed(1)} L`,
    totalDailyYield: `${expDaily.toFixed(1)} L`,
    image: animal.image || null,
    intakeHistory: allEntries,
    history: allEntries,
  };
};

export function AnimalProvider({ children }) {
  const [animals, setAnimals] = useState([]);
  const [milkingLogs, setMilkingLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch live herd animals and milking logs from API
  const fetchAnimalsAndLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [animalsData, logsData] = await Promise.allSettled([
        farmService.getAnimals(),
        farmService.getMilkingLogs(),
      ]);

      const animalList =
        animalsData.status === 'fulfilled'
          ? Array.isArray(animalsData.value)
            ? animalsData.value
            : animalsData.value?.animals || []
          : [];

      const logList =
        logsData.status === 'fulfilled'
          ? Array.isArray(logsData.value)
            ? logsData.value
            : logsData.value?.logs || []
          : [];

      // Group logs by multiple keys (id, _id, tag, tagNumber)
      const historyByAnimal = {};

      logList.forEach((log) => {
        const idKey = String(log.animalId?._id || log.animalId || '');
        const tagKey = String(log.animalTag || log.tag || log.animalId?.tagNumber || '').trim().toLowerCase();

        const dateStr = log.date ? log.date.split('T')[0] : (log.createdAt ? log.createdAt.split('T')[0] : 'Unknown');
        const shift = (log.shift || '').toUpperCase();
        const normShift = shift.charAt(0).toUpperCase() + shift.slice(1).toLowerCase();
        const yVal = Number(log.yieldLiters || log.quantityLiters || log.yield) || 0;

        const entry = {
          id: log._id || log.id || `LOG-${Date.now()}`,
          date: dateStr,
          shift: normShift,
          quantityLiters: yVal,
          yieldLiters: yVal,
          morning: shift === 'MORNING' ? yVal : 0,
          evening: shift === 'EVENING' ? yVal : 0,
          notes: log.notes || '',
          operator: log.operatorId?.name || '',
          createdAt: log.createdAt || log.date || new Date().toISOString(),
        };

        const keysToMap = [idKey, tagKey].filter(Boolean);
        keysToMap.forEach((k) => {
          if (!historyByAnimal[k]) historyByAnimal[k] = [];
          historyByAnimal[k].push(entry);
        });
      });

      const normalizedLogs = [];
      const seenLogKeys = new Set();

      // 1. Add records from API logList
      logList.forEach((log) => {
        const tag = log.animalTag || log.tag || log.animal?.tag || log.animalId?.tagNumber || log.animalId?.tag || 'COW-01';
        const dateStr = log.date ? (typeof log.date === 'string' && log.date.includes('T') ? log.date.split('T')[0] : String(log.date).slice(0, 10)) : new Date().toISOString().split('T')[0];
        const rawShift = log.shift || 'Morning';
        const normShift = rawShift.charAt(0).toUpperCase() + rawShift.slice(1).toLowerCase();
        const yVal = parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0;
        const key = `${tag.toUpperCase()}-${dateStr}-${normShift.toUpperCase()}`;

        if (!seenLogKeys.has(key)) {
          seenLogKeys.add(key);
          normalizedLogs.push({
            ...log,
            id: log._id || log.id || `LOG-${Date.now()}-${tag}`,
            animalTag: tag,
            shift: normShift,
            yieldLiters: yVal,
            yield: yVal,
            quantityLiters: yVal,
            date: dateStr,
          });
        }
      });

      // 2. Also incorporate intake history records from animal documents
      animalList.forEach((animal) => {
        const tag = (animal.tagNumber || animal.tag || 'COW-01').toUpperCase();
        const animalHist = Array.isArray(animal.intakeHistory) ? animal.intakeHistory : (Array.isArray(animal.history) ? animal.history : []);
        animalHist.forEach((item) => {
          if (!item) return;
          const dateStr = item.date ? (typeof item.date === 'string' && item.date.includes('T') ? item.date.split('T')[0] : String(item.date).slice(0, 10)) : '';
          const rawShift = item.shift || (item.morning > 0 ? 'Morning' : 'Evening') || 'Morning';
          const normShift = rawShift.charAt(0).toUpperCase() + rawShift.slice(1).toLowerCase();
          const yVal = Number(item.quantityLiters ?? item.yieldLiters ?? item.yield ?? (normShift === 'Evening' ? item.evening : item.morning) ?? 0) || 0;
          const key = `${tag}-${dateStr}-${normShift.toUpperCase()}`;

          if (dateStr && yVal > 0 && !seenLogKeys.has(key)) {
            seenLogKeys.add(key);
            normalizedLogs.push({
              id: item._id || item.id || `INTAKE-${tag}-${dateStr}-${normShift}`,
              animalId: animal._id || animal.id,
              animalTag: animal.tag || animal.tagNumber || tag,
              shift: normShift,
              yieldLiters: yVal,
              yield: yVal,
              quantityLiters: yVal,
              date: dateStr,
              operatorId: item.operatorId || null,
              operator: item.operator || '',
              notes: item.notes || '',
              createdAt: item.createdAt || new Date().toISOString(),
            });
          }
        });
      });

      const normalized = animalList.map((animal) => {
        const idKey = String(animal._id || animal.id || '');
        const tagKey = String(animal.tagNumber || animal.tag || '').trim().toLowerCase();
        const matchedHistory = historyByAnimal[idKey] || historyByAnimal[tagKey] || [];
        return normalizeAnimal(animal, matchedHistory);
      });

      setAnimals(normalized);
      setMilkingLogs(normalizedLogs);
    } catch (err) {
      console.error('Failed to fetch farm data from API:', err);
      setError(err.message || 'Failed to load herd animals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnimalsAndLogs();

    const unsubscribe = subscribeToSync((event) => {
      if (
        event === 'pure_milk_bar_milking_updated' ||
        event === 'pure_milk_bar_inventory_updated' ||
        event === 'pure_milk_bar_pos_sale_completed'
      ) {
        fetchAnimalsAndLogs();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchAnimalsAndLogs]);

  // Add Animal via API
  const addAnimal = async (formData) => {
    try {
      const morning = parseFloat(formData.morningYield || 0);
      const evening = parseFloat(formData.eveningYield || 0);
      const expected = parseFloat(formData.expectedYield || (morning + evening) || 0);

      const animalType = (formData.species || formData.type || 'Cow').toUpperCase() === 'BUFFALO' ? 'BUFFALO' : 'COW';
      const payload = {
        tagNumber: formData.tag?.trim() || `TAG-${Date.now().toString().slice(-4)}`,
        name: formData.name?.trim() || '',
        type: animalType,
        species: formData.species || (animalType === 'BUFFALO' ? 'Buffalo' : 'Cow'),
        breed: formData.breed || formData.species || 'Sahiwal',
        lactationStage: formData.lactationStatus || 'EARLY',
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        expectedDailyYield: expected,
        expectedMorningYield: morning,
        expectedEveningYield: evening,
        purchaseMorningYield: morning,
        purchaseEveningYield: evening,
        purchaseExpectedYield: expected,
        morningYield: morning,
        eveningYield: evening,
        healthStatus: formData.healthStatus || 'HEALTHY',
        acquisitionDate: formData.acquisitionDate || new Date().toISOString().split('T')[0],
        notes: formData.notes || '',
        image: formData.image || null,
      };

      const created = await farmService.createAnimal(payload);
      const normalized = normalizeAnimal(created || payload);

      setAnimals((prev) => [normalized, ...prev.filter((animal) => animal.tag !== normalized.tag)]);
      broadcastSync('pure_milk_bar_milking_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
      return normalized;
    } catch (err) {
      console.error('Failed to create animal via API:', err);
      throw err;
    }
  };

  // Update Animal via API (preserving intakeHistory)
  const updateAnimal = async (id, formData) => {
    try {
      const morning = parseFloat(formData.morningYield) || 0;
      const evening = parseFloat(formData.eveningYield) || 0;
      const expected = parseFloat(formData.expectedYield) || (morning + evening);
      const tag = (formData.tag || formData.tagNumber || '').trim().toUpperCase();
      const isBuff = (formData.species || '').toLowerCase().includes('buffalo');

      const payload = {
        ...formData,
        tag,
        tagNumber: tag,
        type: isBuff ? 'BUFFALO' : 'COW',
        species: formData.species || (isBuff ? 'Buffalo (Nili Ravi)' : 'Cow (Sahiwal)'),
        morningYield: morning,
        eveningYield: evening,
        expectedMorningYield: morning,
        expectedEveningYield: evening,
        expectedDailyYield: expected,
        purchaseMorningYield: morning,
        purchaseEveningYield: evening,
        purchaseExpectedYield: expected,
        purchasePrice: parseFloat(String(formData.purchasePrice).replace(/[^0-9.]/g, '')) || 0,
      };

      const res = await farmService.updateAnimal(id, payload);
      const updatedData = res?.data?.animal || res?.animal || res?.data || res || {};

      setAnimals((prev) =>
        prev.map((a) => {
          if (String(a._id || a.id) === String(id)) {
            const existingHistory = a.intakeHistory || [];
            return normalizeAnimal({ ...a, ...payload, ...updatedData }, existingHistory);
          }
          return a;
        })
      );
      broadcastSync('pure_milk_bar_milking_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
      return updatedData;
    } catch (err) {
      console.error('Failed to update animal via API:', err);
      throw err;
    }
  };

  // Add Animal Milk Intake (append to intakeHistory without overwrite)
  const addAnimalIntake = async (animalId, intakeData) => {
    try {
      const targetAnimal = animals.find(
        (a) => String(a.id) === String(animalId) || String(a._id) === String(animalId) || a.tag === animalId
      );
      const val = parseFloat(intakeData.quantityLiters ?? intakeData.yieldLiters ?? intakeData.yield ?? 0);
      const rawShift = intakeData.shift || 'Morning';
      const normShift = rawShift.charAt(0).toUpperCase() + rawShift.slice(1).toLowerCase();
      const dateStr = intakeData.date ? String(intakeData.date).slice(0, 10) : new Date().toISOString().split('T')[0];

      const newIntake = {
        id: `INTAKE-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: dateStr,
        shift: normShift,
        quantityLiters: val,
        yieldLiters: val,
        fat: intakeData.fat || null,
        snf: intakeData.snf || null,
        notes: intakeData.notes || '',
        operator: intakeData.operator || intakeData.milker || '',
        createdAt: new Date().toISOString(),
      };

      // Call API to persist to MongoDB with $push
      if (targetAnimal?._id || targetAnimal?.id) {
        await farmService.addAnimalIntake(targetAnimal._id || targetAnimal.id, {
          date: dateStr,
          shift: normShift.toUpperCase(),
          quantityLiters: val,
          yieldLiters: val,
          notes: intakeData.notes,
          operator: intakeData.operator || intakeData.milker,
        });
      }

      // Append into animal intakeHistory in Context API state (preserving purchase benchmark yields)
      setAnimals((prev) =>
        prev.map((animal) => {
          if (String(animal.id) === String(animalId) || String(animal._id) === String(animalId) || animal.tag === animalId) {
            const currentHistory = Array.isArray(animal.intakeHistory) ? animal.intakeHistory : [];
            const updatedHistory = [newIntake, ...currentHistory];
            return {
              ...animal,
              intakeHistory: updatedHistory,
              history: updatedHistory,
            };
          }
          return animal;
        })
      );

      // Optimistically add to milkingLogs
      const newLogEntry = {
        id: newIntake.id,
        _id: newIntake.id,
        animalId: targetAnimal?._id || targetAnimal?.id || animalId,
        animalTag: targetAnimal?.tag || targetAnimal?.tagNumber || animalId,
        shift: normShift,
        yieldLiters: val,
        yield: val,
        quantityLiters: val,
        date: dateStr,
        fat: intakeData.fat || null,
        snf: intakeData.snf || null,
        notes: intakeData.notes || '',
        operator: intakeData.operator || intakeData.milker || '',
        createdAt: newIntake.createdAt,
      };
      setMilkingLogs((prev) => [newLogEntry, ...(prev || [])]);
      broadcastSync('pure_milk_bar_milking_updated');
      broadcastSync('pure_milk_bar_inventory_updated');

      return newIntake;
    } catch (err) {
      console.error('Failed to add animal milk intake:', err);
      throw err;
    }
  };

  // Delete Animal via API
  const deleteAnimal = async (id) => {
    try {
      setAnimals((prev) => prev.filter((a) => String(a._id || a.id) !== String(id) && String(a.tag) !== String(id)));
      await farmService.deleteAnimal(id);
      broadcastSync('pure_milk_bar_milking_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
    } catch (err) {
      console.error('Failed to delete animal:', err);
      throw err;
    }
  };

  // Delete Milking Log via API
  const deleteMilkingLog = async (id) => {
    try {
      setMilkingLogs((prev) => prev.filter((log) => String(log._id || log.id) !== String(id)));
      await farmService.deleteMilkingLog(id);
      broadcastSync('pure_milk_bar_milking_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
    } catch (err) {
      console.error('Failed to delete milking log:', err);
      throw err;
    }
  };

  // Update Milking Log via API
  const updateMilkingLog = async (id, data) => {
    try {
      await farmService.updateMilkingLog(id, data);
      setMilkingLogs((prev) =>
        prev.map((log) => {
          if (String(log._id || log.id) === String(id)) {
            return { ...log, ...data, yieldLiters: data.yieldLiters || log.yieldLiters, yield: data.yieldLiters || log.yieldLiters };
          }
          return log;
        })
      );
      broadcastSync('pure_milk_bar_milking_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
    } catch (err) {
      console.error('Failed to update milking log via API:', err);
      throw err;
    }
  };

  // Save Milking Shift to backend with history preservation
  const saveMilkingShift = async (shiftName, arg2, arg3, operatorId = undefined) => {
    try {
      const shiftDate = typeof arg2 === 'string' ? arg2 : typeof arg3 === 'string' ? arg3 : new Date().toISOString().split('T')[0];
      const shiftEntries = (typeof arg2 === 'object' && arg2 !== null) ? arg2 : (typeof arg3 === 'object' && arg3 !== null) ? arg3 : {};

      const promises = Object.entries(shiftEntries).map(async ([tag, yieldVal]) => {
        const val = parseFloat(yieldVal);
        if (isNaN(val) || val <= 0) return null;
        const animal = animals.find((a) => a.tag === tag || a.tagNumber === tag || String(a.id) === String(tag) || String(a._id) === String(tag));
        const payload = {
          animalId: animal?._id || animal?.id || undefined,
          animalTag: tag,
          shift: (shiftName || 'Morning').toUpperCase(),
          date: shiftDate || new Date().toISOString().split('T')[0],
          yieldLiters: val,
          quantityLiters: val,
        };
        if (operatorId) payload.operatorId = operatorId;
        return farmService.createMilkingLog(payload);
      });

      const validPromises = promises.filter(Boolean);
      if (validPromises.length === 0) return [];

      const results = await Promise.allSettled(validPromises);
      const errors = results.filter((r) => r.status === 'rejected');
      if (errors.length > 0 && errors.length === validPromises.length) {
        throw new Error(errors[0].reason?.message || 'Failed to save milking logs to database');
      }

      // Append new intake records to animals in Context API (preserving purchase benchmark yields)
      const normShift = shiftName ? (shiftName.charAt(0).toUpperCase() + shiftName.slice(1).toLowerCase()) : 'Morning';
      setAnimals((prev) =>
        prev.map((animal) => {
          const val = parseFloat(shiftEntries[animal.tag] || shiftEntries[animal.tagNumber]);
          if (!isNaN(val) && val > 0) {
            const newIntake = {
              id: `INTAKE-${Date.now()}-${animal.tag}`,
              date: shiftDate,
              shift: normShift,
              quantityLiters: val,
              yieldLiters: val,
              morning: normShift === 'Morning' ? val : parseFloat(animal.expectedMorningYield ?? animal.morningYield ?? 0),
              evening: normShift === 'Evening' ? val : parseFloat(animal.expectedEveningYield ?? animal.eveningYield ?? 0),
              notes: 'Milking shift entry',
              createdAt: new Date().toISOString(),
            };
            const currentHistory = Array.isArray(animal.intakeHistory) ? animal.intakeHistory : [];
            const updatedHistory = [newIntake, ...currentHistory];
            return {
              ...animal,
              intakeHistory: updatedHistory,
              history: updatedHistory,
            };
          }
          return animal;
        })
      );

      // Optimistically prepend/update milking logs in context state for immediate dashboard reactivity
      const newLogs = Object.entries(shiftEntries)
        .filter(([_, yieldVal]) => !isNaN(parseFloat(yieldVal)) && parseFloat(yieldVal) > 0)
        .map(([tag, yieldVal]) => {
          const val = parseFloat(yieldVal);
          const animal = animals.find((a) => a.tag === tag || a.tagNumber === tag || String(a.id) === String(tag) || String(a._id) === String(tag));
          return {
            id: `LOG-${Date.now()}-${tag}-${normShift}`,
            _id: `LOG-${Date.now()}-${tag}-${normShift}`,
            animalId: animal?._id || animal?.id || tag,
            animalTag: tag,
            shift: normShift,
            yieldLiters: val,
            yield: val,
            quantityLiters: val,
            date: shiftDate,
            notes: 'Milking shift entry',
            createdAt: new Date().toISOString(),
          };
        });

      if (newLogs.length > 0) {
        setMilkingLogs((prev) => {
          const filtered = (prev || []).filter((l) => {
            const lTag = (l.animalTag || l.tag || '').toUpperCase();
            const lDate = l.date ? (typeof l.date === 'string' && l.date.includes('T') ? l.date.split('T')[0] : String(l.date).slice(0, 10)) : '';
            const lShift = (l.shift || '').toUpperCase();
            return !(lDate === shiftDate && lShift === normShift.toUpperCase() && newLogs.some(nl => nl.animalTag.toUpperCase() === lTag));
          });
          return [...newLogs, ...filtered];
        });
      }

      // Sync latest from DB & broadcast events
      broadcastSync('pure_milk_bar_milking_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
      fetchAnimalsAndLogs().catch((e) => console.warn('Background sync warning:', e));
      return results;
    } catch (err) {
      console.error('Failed to save milking shift:', err);
      throw err;
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <AnimalContext.Provider
      value={{
        animals,
        milkingLogs,
        isLoading,
        error,
        refreshAnimals: fetchAnimalsAndLogs,
        addAnimal,
        updateAnimal,
        addAnimalIntake,
        saveMilkingShift,
        deleteAnimal,
        deleteMilkingLog,
        updateMilkingLog,
        isModalOpen,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AnimalContext.Provider>
  );
}

export function useAnimalContext() {
  return useContext(AnimalContext) || defaultAnimalContextValue;
}

export default AnimalContext;
