import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import farmService from '@/services/farmService';

const AnimalContext = createContext();
const STORAGE_KEY_ANIMALS = 'pure_milk_bar_animals';

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
    history: history.length ? history : animal.history || [],
  };
};

const getStoredAnimals = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ANIMALS);
    return stored ? JSON.parse(stored) : [];
  } catch (_) {
    return [];
  }
};

export function AnimalProvider({ children }) {
  const [animals, setAnimals] = useState(getStoredAnimals);
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
        history[key].push({
          date: log.date || log.createdAt,
          morning: log.shift === 'MORNING' ? Number(log.yieldLiters) || 0 : 0,
          evening: log.shift === 'EVENING' ? Number(log.yieldLiters) || 0 : 0,
        });
        return history;
      }, {});

      const normalized = animalList.map((animal) =>
        normalizeAnimal(animal, historyByAnimal[String(animal._id || animal.id || animal.tagNumber)] || [])
      );

      setAnimals(normalized);
      setMilkingLogs(logList);
    } catch (err) {
      console.error('Failed to fetch farm data from API:', err);
      setError(err.message || 'Failed to load herd animals');
      setAnimals(getStoredAnimals());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnimalsAndLogs();
  }, [fetchAnimalsAndLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANIMALS, JSON.stringify(animals));
    } catch (_) {}
  }, [animals]);

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

      let created;
      try {
        created = await farmService.createAnimal(payload);
      } catch (err) {
        created = { ...payload, id: `local-${Date.now()}` };
        console.warn('Animal API unavailable, saving locally:', err.message);
      }
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
      const morning = parseFloat(formData.morningYield || 0);
      const evening = parseFloat(formData.eveningYield || 0);

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
      await farmService.deleteAnimal(id);
      setAnimals((prev) => prev.filter((a) => (a._id || a.id) !== id));
    } catch (err) {
      console.error('Failed to delete animal via API:', err);
      throw err;
    }
  };

  // Save Milking Shift to backend
  const saveMilkingShift = async (shiftName, shiftDate, shiftEntries) => {
    try {
      const promises = Object.entries(shiftEntries).map(([tag, yieldVal]) => {
        const val = parseFloat(yieldVal);
        if (isNaN(val) || val <= 0) return null;
        const animal = animals.find((a) => a.tag === tag);
        return farmService.createMilkingLog({
          animalId: animal?._id || animal?.id,
          animalTag: tag,
          shift: shiftName.toUpperCase(),
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
