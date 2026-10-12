import React, { useState, useEffect } from "react";
import AnimalDashboard from "../components/animals/AnimalDashboard";
import DateHeader from "@/components/common/DateHeader";
import { useGlobalDate } from "@/context/GlobalDateContext";

export default function AnimalsHerd() {
  const { globalDate, setGlobalDate, setToday } = useGlobalDate();

  // Strict "Starts with Today" initialization
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    if (typeof setToday === 'function') {
      setToday();
    }
  }, []);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (typeof setGlobalDate === 'function') {
      setGlobalDate(newDate);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <DateHeader date={selectedDate} setDate={handleDateChange} />
      <AnimalDashboard selectedDate={selectedDate} />
    </div>
  );
}
