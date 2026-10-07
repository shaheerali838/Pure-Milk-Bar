import React from 'react';
import { useNavigate } from 'react-router-dom';
import POSDoorstepOrdersModal from '@/features/pos/components/POSDoorstepOrdersModal';

export default function DoorstepOrdersPage() {
  const navigate = useNavigate();

  return (
    <POSDoorstepOrdersModal
      embedded
      mode="monthly"
      isOpen
      onClose={() => navigate('/customer-hub/daily-deliveries')}
    />
  );
}
