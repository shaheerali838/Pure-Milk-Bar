import React from "react";
import AnimalDashboard from "../components/animals/AnimalDashboard";  

export default function AnimalsHerd() {
  return (
    <div className="flex flex-col gap-2">
      <AnimalDashboard />
    </div>
  );
}
