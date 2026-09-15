import React from "react";
import AnimalCardOverflow from "./AnimalCardOverflow";

export default function AnimalDashboard() {
  return (
    <div className="bg-slate-50">
      <div className="max-w-7xl">
        <AnimalCardOverflow />
      </div>
    </div>
  );
}

export { AnimalDashboard as AnimalsDashboard };
