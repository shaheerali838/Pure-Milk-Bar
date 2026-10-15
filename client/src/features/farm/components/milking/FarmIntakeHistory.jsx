import React, { useState, useMemo } from "react";
import { useAnimalContext } from "@/context/AnimalContext";
import {
  normalizeDateStr,
  sortByDateDesc,
  getPktTodayString,
} from "@/utils/dateUtils";
import FarmIntakeSummaryCards from "./FarmIntakeSummaryCards";
import FarmIntakeFilters from "./FarmIntakeFilters";
import FarmIntakeTable from "./FarmIntakeTable";
import FarmIntakeDetailModal from "./FarmIntakeDetailModal";

const getTodayDateStr = () => getPktTodayString();
const normalizeDate = (dateVal) => normalizeDateStr(dateVal);

export default function FarmIntakeHistory({ onNewIntake, onEditIntake }) {
  const {
    animals = [],
    milkingLogs = [],
    deleteMilkingLog,
    updateMilkingLog,
  } = useAnimalContext();

  const [search, setSearch] = useState("");
  const [shiftFilter, setShiftFilter] = useState("All");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [dateFilterMode, setDateFilterMode] = useState("today"); // 'today' | 'all' | 'custom'
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]);

  const todayStr = getTodayDateStr();

  // Map animals by tag for quick lookup
  const animalMap = useMemo(() => {
    const map = {};
    animals.forEach((a) => {
      if (a.tag) map[a.tag] = a;
    });
    return map;
  }, [animals]);

  // Enrich milkingLogs with animal data and expected yield variance
  const enrichedLogs = useMemo(() => {
    const mapped = milkingLogs.map((log) => {
      const animal = animalMap[log.animalTag] || {};
      const isBuff =
        (animal.species && animal.species.toLowerCase().includes("buffalo")) ||
        (log.animalTag && log.animalTag.startsWith("BUF"));

      const mVal = parseFloat(
        animal.expectedMorningYield ??
          animal.purchaseMorningYield ??
          animal.morningYield ??
          0,
      );
      const eVal = parseFloat(
        animal.expectedEveningYield ??
          animal.purchaseEveningYield ??
          animal.eveningYield ??
          0,
      );
      const expVal = parseFloat(
        animal.expectedDailyYield ??
          animal.purchaseExpectedYield ??
          animal.expectedYield ??
          mVal + eVal ??
          0,
      );

      const dailyExpected =
        expVal > 0 ? expVal : mVal + eVal > 0 ? mVal + eVal : 15.0;
      const isMorning = (log.shift || "").toLowerCase().includes("morning");
      const expectedShiftYield = isMorning
        ? mVal > 0
          ? mVal
          : parseFloat((dailyExpected / 2).toFixed(1))
        : eVal > 0
          ? eVal
          : parseFloat((dailyExpected / 2).toFixed(1));

      const actualYield = parseFloat(log.yieldLiters || log.yield) || 0;
      const variance = parseFloat(
        (actualYield - expectedShiftYield).toFixed(1),
      );

      return {
        ...log,
        animalName: animal.name || `Cattle ${log.animalTag}`,
        species: isBuff ? "Buffalo" : "Cow",
        breed: animal.species || (isBuff ? "Nili Ravi Buffalo" : "Sahiwal Cow"),
        actualYield,
        expectedShiftYield,
        dailyExpected,
        variance,
        dateStr: normalizeDate(log.date) || todayStr,
      };
    });
    return sortByDateDesc(mapped, "dateStr");
  }, [milkingLogs, animalMap, todayStr]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return enrichedLogs.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.animalTag && item.animalTag.toLowerCase().includes(q)) ||
        (item.animalName && item.animalName.toLowerCase().includes(q)) ||
        (item.breed && item.breed.toLowerCase().includes(q));

      const matchesShift =
        shiftFilter === "All"
          ? true
          : (item.shift || "").toLowerCase() === shiftFilter.toLowerCase();

      const matchesSpecies =
        speciesFilter === "All"
          ? true
          : (item.species || "").toLowerCase() === speciesFilter.toLowerCase();

      let matchesDate = true;
      if (dateFilterMode === "today") {
        matchesDate = item.dateStr === todayStr;
      } else if (dateFilterMode === "custom") {
        if (startDate && item.dateStr < startDate) matchesDate = false;
        if (endDate && item.dateStr > endDate) matchesDate = false;
      } else if (dateFilterMode === "all") {
        matchesDate = true;
      }

      return matchesSearch && matchesShift && matchesSpecies && matchesDate;
    });
  }, [
    enrichedLogs,
    search,
    shiftFilter,
    speciesFilter,
    dateFilterMode,
    todayStr,
    startDate,
    endDate,
  ]);

  // Aggregated Summary Metrics
  const totalActualMilk = useMemo(() => {
    return filteredLogs.reduce((sum, item) => sum + item.actualYield, 0);
  }, [filteredLogs]);

  const totalExpectedMilk = useMemo(() => {
    return filteredLogs.reduce((sum, item) => sum + item.expectedShiftYield, 0);
  }, [filteredLogs]);

  const totalNetVariance = totalActualMilk - totalExpectedMilk;
  const variancePercent =
    totalExpectedMilk > 0
      ? ((totalNetVariance / totalExpectedMilk) * 100).toFixed(1)
      : 0;

  const handleBulkDelete = async () => {
    if (selectedLogs.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedLogs.length} selected records?`,
      )
    ) {
      try {
        await Promise.all(selectedLogs.map((id) => deleteMilkingLog(id)));
        setSelectedLogs([]);
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Unknown error occurred";
        alert(`Failed to delete some records: ${msg}`);
      }
    }
  };

  const handleDeleteLog = async (log) => {
    if (window.confirm("Are you sure you want to delete this milking log?")) {
      try {
        await deleteMilkingLog(log.id);
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Unknown error occurred";
        alert(`Failed to delete milking log: ${msg}`);
      }
    }
  };

  const handleEditLog = async (log) => {
    if (onEditIntake) {
      onEditIntake(log);
    } else {
      const newYield = window.prompt(
        "Enter new yield (Liters) for this record:",
        log.actualYield,
      );
      if (newYield && !isNaN(parseFloat(newYield))) {
        try {
          await updateMilkingLog(log.id, {
            yieldLiters: parseFloat(newYield),
          });
        } catch (error) {
          alert("Failed to update yield");
        }
      }
    }
  };

  const hasActiveFilters = Boolean(
    search ||
    shiftFilter !== "All" ||
    speciesFilter !== "All" ||
    dateFilterMode !== "today" ||
    startDate ||
    endDate,
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Top Summary Cards */}
      <FarmIntakeSummaryCards
        totalActualMilk={totalActualMilk}
        totalExpectedMilk={totalExpectedMilk}
        totalNetVariance={totalNetVariance}
        variancePercent={variancePercent}
        recordCount={filteredLogs.length}
      />

      {/* 2. Search & Filter Bar */}
      <FarmIntakeFilters
        search={search}
        setSearch={setSearch}
        shiftFilter={shiftFilter}
        setShiftFilter={setShiftFilter}
        speciesFilter={speciesFilter}
        setSpeciesFilter={setSpeciesFilter}
        dateFilterMode={dateFilterMode}
        setDateFilterMode={setDateFilterMode}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedLogsCount={selectedLogs.length}
        onBulkDelete={handleBulkDelete}
        onNewIntake={onNewIntake}
      />

      {/* 3. Intake History Data Table */}
      <FarmIntakeTable
        filteredLogs={filteredLogs}
        selectedLogs={selectedLogs}
        setSelectedLogs={setSelectedLogs}
        hasActiveFilters={hasActiveFilters}
        onSelectRecord={(log) => setSelectedRecord(log)}
        onDeleteLog={handleDeleteLog}
        onEditLog={handleEditLog}
        onNewIntake={onNewIntake}
      />

      {/* 4. Detailed Intake Modal View */}
      <FarmIntakeDetailModal
        selectedRecord={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
