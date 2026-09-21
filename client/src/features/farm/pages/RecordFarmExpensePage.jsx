import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecordExpenseForm from "../components/expense/RecordExpenseForm";

export default function RecordFarmExpensePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <RecordExpenseForm
      expenseId={id}
      onClose={() => navigate("/farm/expenses")}
    />
  );
}
