import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import AnimalDetail from "../components/animals/AnimalDetail";

export default function AnimalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <AnimalDetail
      animalId={id}
      onBack={() => navigate(-1)}
      onClose={() => navigate("/farm/animals")}
    />
  );
}
