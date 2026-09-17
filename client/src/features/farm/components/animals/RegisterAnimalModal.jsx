import React from "react";
import AnimalAdd from "./AnimalAdd";

export default function RegisterAnimalModal({ isOpen, onClose, onRegister }) {
  if (isOpen !== undefined && !isOpen) return null;

  return (
    <AnimalAdd
      onBack={onClose}
      onClose={onClose}
      onSuccess={onClose}
    />
  );
}

export { AnimalAdd };
