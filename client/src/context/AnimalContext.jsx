import React, { createContext, useContext, useState, useEffect } from 'react';

const AnimalContext = createContext();

const STORAGE_KEY = 'pure_milk_bar_animals_register_v4';

const defaultAnimals = [
  {
    id: 1,
    tag: 'COW-A',
    species: 'Cow (Sahiwal)',
    lactationStatus: 'Milking',
    acquisitionDate: '2024-01-15',
    morningYield: '8.5 L',
    eveningYield: '7.2 L',
    totalDailyYield: '15.7 L',
    history: [
      { date: '18 Aug', morning: 8.2, evening: 7.0 },
      { date: '19 Aug', morning: 8.8, evening: 7.3 },
      { date: '20 Aug', morning: 8.0, evening: 6.8 },
      { date: '21 Aug', morning: 9.1, evening: 7.5 },
      { date: '22 Aug', morning: 8.5, evening: 7.2 },
      { date: '23 Aug', morning: 8.9, evening: 7.4 },
      { date: '24 Aug', morning: 8.5, evening: 7.2 },
    ]
  },
  {
    id: 2,
    tag: 'COW-B',
    species: 'Cow (Cholistani)',
    lactationStatus: 'Milking',
    acquisitionDate: '2024-02-10',
    morningYield: '9.0 L',
    eveningYield: '8.5 L',
    totalDailyYield: '17.5 L',
    history: [
      { date: '18 Aug', morning: 8.5, evening: 7.5 },
      { date: '19 Aug', morning: 9.0, evening: 7.8 },
      { date: '20 Aug', morning: 9.2, evening: 8.1 },
      { date: '21 Aug', morning: 8.8, evening: 7.9 },
      { date: '22 Aug', morning: 9.0, evening: 8.0 },
      { date: '23 Aug', morning: 9.3, evening: 8.2 },
      { date: '24 Aug', morning: 9.0, evening: 8.5 },
    ]
  },
  {
    id: 3,
    tag: 'BUF-A',
    species: 'Buffalo (Nili Ravi)',
    lactationStatus: 'Milking',
    acquisitionDate: '2023-11-20',
    morningYield: '6.5 L',
    eveningYield: '6.0 L',
    totalDailyYield: '12.5 L',
    history: [
      { date: '18 Aug', morning: 6.0, evening: 5.8 },
      { date: '19 Aug', morning: 6.2, evening: 6.0 },
      { date: '20 Aug', morning: 6.5, evening: 6.1 },
      { date: '21 Aug', morning: 6.3, evening: 5.9 },
      { date: '22 Aug', morning: 6.6, evening: 6.0 },
      { date: '23 Aug', morning: 6.4, evening: 6.2 },
      { date: '24 Aug', morning: 6.5, evening: 6.0 },
    ]
  },
  {
    id: 4,
    tag: 'BUF-B',
    species: 'Buffalo (Nili Ravi)',
    lactationStatus: 'Milking',
    acquisitionDate: '2023-12-05',
    morningYield: '7.0 L',
    eveningYield: '6.5 L',
    totalDailyYield: '13.5 L',
    history: [
      { date: '18 Aug', morning: 6.8, evening: 6.2 },
      { date: '19 Aug', morning: 7.1, evening: 6.4 },
      { date: '20 Aug', morning: 7.0, evening: 6.5 },
      { date: '21 Aug', morning: 6.9, evening: 6.3 },
      { date: '22 Aug', morning: 7.2, evening: 6.6 },
      { date: '23 Aug', morning: 7.0, evening: 6.5 },
      { date: '24 Aug', morning: 7.0, evening: 6.5 },
    ]
  },
  {
    id: 5,
    tag: 'BUF-C',
    species: 'Buffalo (Kundi)',
    lactationStatus: 'Milking',
    acquisitionDate: '2024-03-01',
    morningYield: '5.5 L',
    eveningYield: '5.0 L',
    totalDailyYield: '10.5 L',
    history: [
      { date: '18 Aug', morning: 5.2, evening: 4.8 },
      { date: '19 Aug', morning: 5.4, evening: 5.0 },
      { date: '20 Aug', morning: 5.6, evening: 5.1 },
      { date: '21 Aug', morning: 5.3, evening: 4.9 },
      { date: '22 Aug', morning: 5.5, evening: 5.0 },
      { date: '23 Aug', morning: 5.7, evening: 5.2 },
      { date: '24 Aug', morning: 5.5, evening: 5.0 },
    ]
  },
  {
    id: 6,
    tag: 'COW-D',
    species: 'Cow (Sahiwal)',
    lactationStatus: 'Milking',
    acquisitionDate: '2024-04-12',
    morningYield: '7.5 L',
    eveningYield: '7.0 L',
    totalDailyYield: '14.5 L',
    history: [
      { date: '18 Aug', morning: 7.2, evening: 6.8 },
      { date: '19 Aug', morning: 7.6, evening: 7.1 },
      { date: '20 Aug', morning: 7.4, evening: 6.9 },
      { date: '21 Aug', morning: 7.5, evening: 7.0 },
      { date: '22 Aug', morning: 7.7, evening: 7.2 },
      { date: '23 Aug', morning: 7.3, evening: 6.9 },
      { date: '24 Aug', morning: 7.5, evening: 7.0 },
    ]
  }
];

export function AnimalProvider({ children }) {
  // Load animals from localStorage (default to defaultAnimals)
  const [animals, setAnimals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return defaultAnimals;
    } catch (err) {
      return defaultAnimals;
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

  // Generate default 7-day history for new/edited animals
  const generateHistory = (mYield, eYield) => {
    const dates = ['18 Aug', '19 Aug', '20 Aug', '21 Aug', '22 Aug', '23 Aug', '24 Aug'];
    return dates.map((date) => {
      const mVar = (Math.random() * 0.6 - 0.3);
      const eVar = (Math.random() * 0.6 - 0.3);
      return {
        date,
        morning: Math.max(0, parseFloat((mYield + mVar).toFixed(1))),
        evening: Math.max(0, parseFloat((eYield + eVar).toFixed(1))),
      };
    });
  };

  // Register new animal
  const addAnimal = (formData) => {
    const morning = parseFloat(formData.morningYield || 0);
    const evening = parseFloat(formData.eveningYield || 0);
    const total = (morning + evening).toFixed(1);

    const isBuff = formData.species && formData.species.toLowerCase().includes("buffalo");
    const prefix = isBuff ? "BUF" : "COW";
    const autoTag = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const finalTag = formData.tag && formData.tag.trim() !== "" ? formData.tag.trim() : autoTag;
    const finalName = formData.name && formData.name.trim() !== "" ? formData.name.trim() : finalTag;

    const priceVal = formData.purchasePrice ? `Rs ${parseFloat(formData.purchasePrice).toLocaleString()}` : 'Rs 200,000';
    const expVal = formData.expectedYield ? `${parseFloat(formData.expectedYield).toFixed(1)} L` : `${(morning + evening || 15.0).toFixed(1)} L`;

    const newAnimal = {
      id: Date.now(),
      tag: finalTag,
      name: finalName,
      species: formData.species || 'Cow (Sahiwal)',
      lactationStatus: formData.lactationStatus || 'Milking',
      acquisitionDate: formData.acquisitionDate || new Date().toISOString().split('T')[0],
      purchasePrice: priceVal,
      expectedYield: expVal,
      morningYield: morning.toFixed(1) + ' L',
      eveningYield: evening.toFixed(1) + ' L',
      totalDailyYield: total + ' L',
      healthStatus: formData.healthStatus || 'Healthy & Vaccinated',
      history: generateHistory(morning, evening),
    };

    setAnimals((prev) => [newAnimal, ...prev]);
  };

  // Update existing animal
  const updateAnimal = (id, formData) => {
    const morning = parseFloat(formData.morningYield || 0);
    const evening = parseFloat(formData.eveningYield || 0);
    const total = (morning + evening).toFixed(1);

    setAnimals((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            tag: formData.tag && formData.tag.trim() !== "" ? formData.tag.trim() : a.tag,
            name: formData.name && formData.name.trim() !== "" ? formData.name.trim() : a.name,
            species: formData.species || a.species,
            lactationStatus: formData.lactationStatus || a.lactationStatus,
            acquisitionDate: formData.acquisitionDate || a.acquisitionDate,
            purchasePrice: formData.purchasePrice ? `Rs ${parseFloat(formData.purchasePrice).toLocaleString()}` : a.purchasePrice,
            expectedYield: formData.expectedYield ? `${parseFloat(formData.expectedYield).toFixed(1)} L` : a.expectedYield,
            morningYield: morning.toFixed(1) + ' L',
            eveningYield: evening.toFixed(1) + ' L',
            totalDailyYield: total + ' L',
            healthStatus: formData.healthStatus || a.healthStatus,
            history: generateHistory(morning, evening),
          };
        }
        return a;
      })
    );
  };


  // Save milking shift entries to update animal yields
  const saveMilkingShift = (shiftName, shiftDate, shiftEntries) => {
    setAnimals((prev) =>
      prev.map((animal) => {
        const enteredVal = shiftEntries[animal.tag];
        if (enteredVal !== undefined && enteredVal !== "" && !isNaN(parseFloat(enteredVal))) {
          const numVal = parseFloat(enteredVal);
          let currentMorning = parseFloat(animal.morningYield || 0);
          let currentEvening = parseFloat(animal.eveningYield || 0);

          if (shiftName === "Morning") {
            currentMorning = numVal;
          } else {
            currentEvening = numVal;
          }

          const total = (currentMorning + currentEvening).toFixed(1);

          const updatedHistory = (animal.history || []).map((h) => {
            if (h.date === '24 Aug') {
              return {
                ...h,
                morning: shiftName === 'Morning' ? numVal : h.morning,
                evening: shiftName === 'Evening' ? numVal : h.evening,
              };
            }
            return h;
          });

          return {
            ...animal,
            morningYield: currentMorning.toFixed(1) + ' L',
            eveningYield: currentEvening.toFixed(1) + ' L',
            totalDailyYield: total + ' L',
            history: updatedHistory,
          };
        }
        return animal;
      })
    );
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



