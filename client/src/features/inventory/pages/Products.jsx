import React, { useState, useEffect } from 'react';
import ProductDashboard from '../components/ProductDashboard';
import AddProduct from '../components/AddProduct';
import ProductDetailModal from '../components/ProductDetailModal';
import DateHeader from '@/components/common/DateHeader';
import { useGlobalDate } from '@/context/GlobalDateContext';

export default function Products() {
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

  // 'list' | 'add' | 'edit' | 'detail'
  const [currentView, setCurrentView] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 1. Add Product view (opens on the right side of the fixed sidebar)
  if (currentView === 'add') {
    return <AddProduct onBack={() => setCurrentView('list')} />;
  }

  // 2. Edit Product view (re-uses AddProduct form pre-filled with selectedProduct)
  if (currentView === 'edit' && selectedProduct) {
    return (
      <AddProduct
        product={selectedProduct}
        onBack={() => {
          setSelectedProduct(null);
          setCurrentView('list');
        }}
      />
    );
  }

  // 3. Product Detail view (opens on the right side of the fixed sidebar when clicking table row or eye)
  if (currentView === 'detail' && selectedProduct) {
    return (
      <ProductDetailModal
        product={selectedProduct}
        onBack={() => {
          setSelectedProduct(null);
          setCurrentView('list');
        }}
        onOpenEdit={(prod) => {
          setSelectedProduct(prod);
          setCurrentView('edit');
        }}
      />
    );
  }

  // 4. Default Products Table Dashboard
  return (
    <div className="space-y-3">
      <DateHeader date={selectedDate} setDate={handleDateChange} />
      <ProductDashboard
        onAdd={() => setCurrentView('add')}
        onDetail={(prod) => {
          setSelectedProduct(prod);
          setCurrentView('detail');
        }}
        onEdit={(prod) => {
          setSelectedProduct(prod);
          setCurrentView('edit');
        }}
      />
    </div>
  );
}
