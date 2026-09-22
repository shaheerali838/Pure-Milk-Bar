import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import farmService from '@/services/farmService';

const AnimalContext = createContext();

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

      const normalizedLogs = logList.map((log) => ({
        ...log,
        id: log._id || log.id || `LOG-${Date.now()}`,
        animalTag: log.animalTag || log.tag || log.animal?.tag || log.animalId?.tagNumber || log.animalId?.tag || 'COW-01',
        shift: log.shift ? (log.shift.charAt(0).toUpperCase() + log.shift.slice(1).toLowerCase()) : 'Morning',
        yieldLiters: parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0,
        yield: parseFloat(log.yieldLiters || log.quantityLiters || log.yield) || 0,
        date: log.date ? log.date.split('T')[0] : new Date().toISOString().split('T')[0],
      }));

      // Normalize animal records
      const normalized = animalList.map((a) => {
        const morning = parseFloat(a.morningYield || a.avgMorningYield || 0);
        const evening = parseFloat(a.eveningYield || a.avgEveningYield || 0);
        const total = (morning + evening).toFixed(1);

        return {
          ...a,
          id: a._id || a.id,
          tag: a.tag || a.tagNumber,
          species: a.species || a.breed || 'Cow',
          lactationStatus: a.lactationStatus || a.status || 'Milking',
          morningYield: `${morning.toFixed(1)} L`,
          eveningYield: `${evening.toFixed(1)} L`,
          totalDailyYield: `${total} L`,
          history: a.history || [],
        };
      });

      setAnimals(normalized);
      setMilkingLogs(normalizedLogs);
    } catch (err) {
      console.error('Failed to fetch farm data from API:', err);
      setError(err.message || 'Failed to load herd animals');
      setAnimals([]);
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
      };

      const created = await farmService.createAnimal(payload);
      const normalized = {
        ...created,
        id: created._id || created.id || Date.now(),
        tag: created.tagNumber || payload.tagNumber,
        species: created.species,
        lactationStatus: created.lactationStage || 'Milking',
        morningYield: `${morning.toFixed(1)} L`,
        eveningYield: `${evening.toFixed(1)} L`,
        totalDailyYield: `${(morning + evening).toFixed(1)} L`,
        history: [],
      };

      setAnimals((prev) => [normalized, ...prev]);
      return normalized;
    } catch (err) {
      console.error('Failed to create animal via API:', err);
      throw err;
    }
  };

  // Update Animal via API
  const updateAnimal = async (id, formData) => {
    try {
      const morning = parseFloat(formData.morningYield || 0);
      const evening = parseFloat(formData.eveningYield || 0);

      await farmService.updateAnimal(id, formData);
      setAnimals((prev) =>
        prev.map((a) => {
          if ((a._id || a.id) === id) {
            return {
              ...a,
              ...formData,
              morningYield: `${morning.toFixed(1)} L`,
              eveningYield: `${evening.toFixed(1)} L`,
              totalDailyYield: `${(morning + evening).toFixed(1)} L`,
            };
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
      await farmService.deleteAnimal(id);
      setAnimals((prev) => prev.filter((a) => (a._id || a.id) !== id));
    } catch (err) {
      console.error('Failed to delete animal via API:', err);
      throw err;
    }
  };

  // Save Milking Shift to backend
  const saveMilkingShift = async (shiftName, arg2, arg3) => {
    try {
      const shiftDate = typeof arg2 === 'string' ? arg2 : typeof arg3 === 'string' ? arg3 : new Date().toISOString().split('T')[0];
      const shiftEntries = (typeof arg2 === 'object' && arg2 !== null) ? arg2 : (typeof arg3 === 'object' && arg3 !== null) ? arg3 : {};

      const promises = Object.entries(shiftEntries).map(([tag, yieldVal]) => {
        const val = parseFloat(yieldVal);
        if (isNaN(val) || val <= 0) return null;
        const animal = animals.find((a) => a.tag === tag);
        return farmService.createMilkingLog({
          animalId: animal?._id || animal?.id,
          animalTag: tag,
          shift: (shiftName || 'Morning').toUpperCase(),
          date: shiftDate || new Date().toISOString().split('T')[0],
          yieldLiters: val,
        });
      });

      await Promise.allSettled(promises.filter(Boolean));
      fetchAnimalsAndLogs();
    } catch (err) {
      console.error('Failed to save milking shift:', err);
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
