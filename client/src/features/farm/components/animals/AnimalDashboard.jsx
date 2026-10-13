import React from "react";
import AnimalCardOverflow from "./AnimalCardOverflow";

export default function AnimalDashboard({ selectedDate }) {
  return (
    <div className="bg-slate-50">
      <div>
        <AnimalCardOverflow selectedDate={selectedDate} />
      </div>
    </div>
  );
}

export { AnimalDashboard as AnimalsDashboard };
