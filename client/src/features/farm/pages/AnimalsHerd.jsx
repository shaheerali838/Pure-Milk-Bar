import React, { useState, useEffect } from "react";
import AnimalDashboard from "../components/animals/AnimalDashboard";
import DateHeader from "@/components/common/DateHeader";
import { useGlobalDate } from "@/context/GlobalDateContext";
import { getTodayDateStr } from "@/utils/dateUtils";

export default function AnimalsHerd() {
  const { globalDate, setGlobalDate } = useGlobalDate();
  const todayStr = getTodayDateStr();

  const [selectedDate, setSelectedDate] = useState(() => globalDate || todayStr);

  useEffect(() => {
    if (globalDate) {
      setSelectedDate(globalDate);
    }
  }, [globalDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (typeof setGlobalDate === "function") {
      setGlobalDate(newDate);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <DateHeader
        date={selectedDate}
        setDate={handleDateChange}
        title="Livestock & Herd Management"
        subtitle={`Livestock registry, daily milk output benchmarks, and animal records for ${selectedDate}`}
      />
      <AnimalDashboard selectedDate={selectedDate} />
    </div>
  );
}

