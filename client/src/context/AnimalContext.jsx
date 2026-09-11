import React, { createContext, useContext, useState, useEffect } from 'react';

const AnimalContext = createContext();

const STORAGE_KEY = 'pure_milk_bar_animals_register_v2';

export function AnimalProvider({ children }) {
  // Load animals from localStorage (default to empty array [])
  const [animals, setAnimals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Save animals to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [animals]);

  // Register new animal
  const addAnimal = (formData) => {
    const morning = parseFloat(formData.morningYield || 0);
    const evening = parseFloat(formData.eveningYield || 0);
    const total = (morning + evening).toFixed(1);

    const newAnimal = {
      id: Date.now(),
      tag: formData.tag || `COW-${Math.floor(1000 + Math.random() * 9000)}`,
      species: formData.species || 'Cow (Sahiwal)',
      lactationStatus: formData.lactationStatus || 'Milking',
      acquisitionDate: formData.acquisitionDate || new Date().toISOString().split('T')[0],
      morningYield: morning.toFixed(1) + ' L',
      eveningYield: evening.toFixed(1) + ' L',
      totalDailyYield: total + ' L',
    };

    setAnimals((prev) => [newAnimal, ...prev]);
  };

  // Delete animal by ID
  const deleteAnimal = (id) => {
    setAnimals((prev) => prev.filter((a) => a.id !== id));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <AnimalContext.Provider
      value={{
        animals,
        addAnimal,
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
