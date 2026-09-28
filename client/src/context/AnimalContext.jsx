import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import farmService from '@/services/farmService';

const AnimalContext = createContext();

const normalizeAnimal = (animal, history = []) => {
  const morning = parseFloat(animal.morningYield || animal.avgMorningYield || 0);
  const evening = parseFloat(animal.eveningYield || animal.avgEveningYield || 0);

  return {
    ...animal,
    id: animal._id || animal.id,
    tag: animal.tag || animal.tagNumber,
    species: animal.species || animal.breed || 'Cow',
    lactationStatus: animal.lactationStatus || animal.status || 'Milking',
    morningYield: `${morning.toFixed(1)} L`,
    eveningYield: `${evening.toFixed(1)} L`,
    totalDailyYield: `${(morning + evening).toFixed(1)} L`,
    image: animal.image || null,
    history: history.length ? history : animal.history || [],
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

      const historyByAnimal = logList.reduce((history, log) => {
        const key = String(log.animalId?._id || log.animalId || log.animalTag || '');
        if (!key) return history;
        if (!history[key]) history[key] = [];

        const dateStr = log.date ? log.date.split('T')[0] : (log.createdAt ? log.createdAt.split('T')[0] : 'Unknown');
        const shift = (log.shift || '').toUpperCase();
        const yVal = Number(log.yieldLiters || log.quantityLiters || log.yield) || 0;

        const morningYield = shift === 'MORNING' ? yVal : 0;
        const eveningYield = shift === 'EVENING' ? yVal : 0;
        
        const existingIdx = history[key].findIndex(e => e.date === dateStr);
        if (existingIdx >= 0) {
          if (morningYield > 0) history[key][existingIdx].morning = morningYield;
          if (eveningYield > 0) history[key][existingIdx].evening = eveningYield;
        } else {
          history[key].push({
            date: dateStr,
            morning: morningYield,
            evening: eveningYield,
          });
        }
        return history;
      }, {});

      const normalizedLogs = logList.map((log) => ({
        ...log,
        id: log._id || log.id || `LOG-${Date.now()}`,
        animalTag: log.animalTag || log.tag || log.animal?.tag || log.animalId?.tagNumber || log.animalId?.tag || 'COW-01',
        shift: log.shift ? (log.shift.charAt(0).toUpperCase() + log.shift.slice(1).toLowerCase()) : 'Morning',
        yieldLiters: parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0,
        yield: parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0,
        date: log.date ? log.date.split('T')[0] : new Date().toISOString().split('T')[0],
      }));

      const normalized = animalList.map((animal) =>
        normalizeAnimal(animal, historyByAnimal[String(animal._id || animal.id || animal.tagNumber)] || [])
      );

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
      return normalized;
    } catch (err) {
      console.error('Failed to create animal via API:', err);
      throw err;
    }
  };

  // Update Animal via API
  const updateAnimal = async (id, formData) => {
    try {
      await farmService.updateAnimal(id, formData);
      setAnimals((prev) =>
        prev.map((a) => {
          if (String(a._id || a.id) === String(id)) {
            return normalizeAnimal({ ...a, ...formData, tagNumber: formData.tag || a.tagNumber });
          }
          return a;
        })
      );
    } catch (err) {
      console.error('Failed to update animal via API:', err);
      throw err;
    }
  };

  // Delete Animal via API
  const deleteAnimal = async (id) => {
    try {
      setAnimals((prev) => prev.filter((a) => String(a._id || a.id) !== String(id) && String(a.tag) !== String(id)));
      await farmService.deleteAnimal(id);
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
    } catch (err) {
      console.error('Failed to update milking log via API:', err);
      throw err;
    }
  };

  // Save Milking Shift to backend
  const saveMilkingShift = async (shiftName, arg2, arg3, operatorId = undefined) => {
    try {
      const shiftDate = typeof arg2 === 'string' ? arg2 : typeof arg3 === 'string' ? arg3 : new Date().toISOString().split('T')[0];
      const shiftEntries = (typeof arg2 === 'object' && arg2 !== null) ? arg2 : (typeof arg3 === 'object' && arg3 !== null) ? arg3 : {};

      const promises = Object.entries(shiftEntries).map(([tag, yieldVal]) => {
        const val = parseFloat(yieldVal);
        if (isNaN(val) || val <= 0) return null;
        const animal = animals.find((a) => a.tag === tag);
        const payload = {
          animalId: animal?._id || animal?.id,
          animalTag: tag,
          shift: (shiftName || 'Morning').toUpperCase(),
          date: shiftDate || new Date().toISOString().split('T')[0],
          yieldLiters: val,
        };
        if (operatorId) payload.operatorId = operatorId;
        return farmService.createMilkingLog(payload);
      });

      await Promise.allSettled(promises.filter(Boolean));
      await fetchAnimalsAndLogs();
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
  return useContext(AnimalContext);
}

export default AnimalContext;
