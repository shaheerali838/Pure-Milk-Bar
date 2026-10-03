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
  const morning = parseFloat(animal.morningYield || animal.avgMorningYield || 0);
  const evening = parseFloat(animal.eveningYield || animal.avgEveningYield || 0);

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
    if (!dateStr) return;

    const rawShift = item.shift || (item.morning > 0 ? 'Morning' : (item.evening > 0 ? 'Evening' : 'Morning'));
    const normShift = rawShift.charAt(0).toUpperCase() + rawShift.slice(1).toLowerCase();
    const qty = Number(item.quantityLiters ?? item.yieldLiters ?? item.yield ?? (normShift === 'Evening' ? item.evening : item.morning) ?? 0) || 0;
    const key = `${dateStr}-${normShift.toLowerCase()}`;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      allEntries.push({
        id: item._id || item.id || `INTAKE-${dateStr}-${normShift}-${Math.random().toString(36).substr(2, 5)}`,
        date: dateStr,
        shift: normShift,
        quantityLiters: qty,
        yieldLiters: qty,
        morning: normShift === 'Morning' ? qty : 0,
        evening: normShift === 'Evening' ? qty : 0,
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

  // Format and preserve animal registration date
  const regDate = animal.acquisitionDate 
    ? (typeof animal.acquisitionDate === 'string' && animal.acquisitionDate.includes('T') ? animal.acquisitionDate.split('T')[0] : String(animal.acquisitionDate).slice(0, 10))
    : (animal.createdAt ? (typeof animal.createdAt === 'string' && animal.createdAt.includes('T') ? animal.createdAt.split('T')[0] : String(animal.createdAt).slice(0, 10)) : '');

  return {
    ...animal,
    id: animal._id || animal.id,
    _id: animal._id || animal.id,
    tag: animal.tag || animal.tagNumber,
    tagNumber: animal.tagNumber || animal.tag,
    species: animal.species || animal.breed || 'Cow',
    lactationStatus: animal.lactationStatus || animal.status || 'Milking',
    morningYield: `${morning.toFixed(1)} L`,
    eveningYield: `${evening.toFixed(1)} L`,
    totalDailyYield: `${(morning + evening).toFixed(1)} L`,
    acquisitionDate: regDate,
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

      const normalizedLogs = logList.map((log) => ({
        ...log,
        id: log._id || log.id || `LOG-${Date.now()}`,
        animalTag: log.animalTag || log.tag || log.animal?.tag || log.animalId?.tagNumber || log.animalId?.tag || 'COW-01',
        shift: log.shift ? (log.shift.charAt(0).toUpperCase() + log.shift.slice(1).toLowerCase()) : 'Morning',
        yieldLiters: parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0,
        yield: parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0,
        date: log.date ? log.date.split('T')[0] : new Date().toISOString().split('T')[0],
      }));

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

      const animalType = (formData.species || formData.type || 'Cow').toUpperCase() === 'BUFFALO' ? 'BUFFALO' : 'COW';
      const payload = {
        tagNumber: formData.tag?.trim() || `TAG-${Date.now().toString().slice(-4)}`,
        name: formData.name?.trim() || '',
        type: animalType,
        species: formData.species || (animalType === 'BUFFALO' ? 'Buffalo' : 'Cow'),
        breed: formData.breed || formData.species || 'Sahiwal',
        lactationStage: formData.lactationStatus || 'EARLY',
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        expectedDailyYield: morning + evening,
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
      await farmService.updateAnimal(id, formData);
      setAnimals((prev) =>
        prev.map((a) => {
          if (String(a._id || a.id) === String(id)) {
            const existingHistory = a.intakeHistory || [];
            return normalizeAnimal({ ...a, ...formData, tagNumber: formData.tag || a.tagNumber }, existingHistory);
          }
          return a;
        })
      );
      broadcastSync('pure_milk_bar_milking_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
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

      // Append into animal intakeHistory in Context API state (never overwrite previous data)
      setAnimals((prev) =>
        prev.map((animal) => {
          if (String(animal.id) === String(animalId) || String(animal._id) === String(animalId) || animal.tag === animalId) {
            const currentHistory = Array.isArray(animal.intakeHistory) ? animal.intakeHistory : [];
            const filteredHistory = currentHistory.filter((h) => {
              const hDate = h.date ? (typeof h.date === 'string' && h.date.includes('T') ? h.date.split('T')[0] : String(h.date).slice(0, 10)) : '';
              const hShift = (h.shift || '').toLowerCase();
              return !(hDate === dateStr && hShift === normShift.toLowerCase());
            });
            const updatedHistory = [newIntake, ...filteredHistory];
            return {
              ...animal,
              morningYield: normShift.toUpperCase() === 'MORNING' ? `${val.toFixed(1)} L` : animal.morningYield,
              eveningYield: normShift.toUpperCase() === 'EVENING' ? `${val.toFixed(1)} L` : animal.eveningYield,
              intakeHistory: updatedHistory,
              history: updatedHistory,
            };
          }
          return animal;
        })
      );

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

      // Append new intake records to animals in Context API (preserving previous history)
      const normShift = shiftName ? (shiftName.charAt(0).toUpperCase() + shiftName.slice(1).toLowerCase()) : 'Morning';
      setAnimals((prev) =>
        prev.map((animal) => {
          const val = parseFloat(shiftEntries[animal.tag] || shiftEntries[animal.tagNumber]);
          if (!isNaN(val) && val > 0) {
            const newIntake = {
              id: `INTAKE-${shiftDate}-${normShift}-${animal.tag}`,
              date: shiftDate,
              shift: normShift,
              quantityLiters: val,
              yieldLiters: val,
              morning: normShift === 'Morning' ? val : 0,
              evening: normShift === 'Evening' ? val : 0,
              notes: 'Milking shift entry',
              createdAt: new Date().toISOString(),
            };
            const currentHistory = Array.isArray(animal.intakeHistory) ? animal.intakeHistory : [];
            const filteredHistory = currentHistory.filter((h) => {
              const hDate = h.date ? (typeof h.date === 'string' && h.date.includes('T') ? h.date.split('T')[0] : String(h.date).slice(0, 10)) : '';
              const hShift = (h.shift || '').toLowerCase();
              return !(hDate === shiftDate && hShift === normShift.toLowerCase());
            });
            const updatedHistory = [newIntake, ...filteredHistory];
            return {
              ...animal,
              morningYield: normShift === 'Morning' ? `${val.toFixed(1)} L` : animal.morningYield,
              eveningYield: normShift === 'Evening' ? `${val.toFixed(1)} L` : animal.eveningYield,
              intakeHistory: updatedHistory,
              history: updatedHistory,
            };
          }
          return animal;
        })
      );

      // Sync latest from DB & broadcast events
      await fetchAnimalsAndLogs();
      broadcastSync('pure_milk_bar_milking_updated');
      broadcastSync('pure_milk_bar_inventory_updated');
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
