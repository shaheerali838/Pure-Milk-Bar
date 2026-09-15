import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Fuel, Printer } from 'lucide-react';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import DeliveryStats from '../components/DeliveryStats';
import DropPoints from '../components/DropPoints';
import FleetAndStaff from '../components/FleetAndStaff';
import FuelLog from '../components/FuelLog';
import DeliveryDetailView from '../components/DeliveryDetailView';
import RegisterStaffView from '../components/RegisterStaffView';
import StaffDetailView from '../components/StaffDetailView';
import LogFuelView from '../components/LogFuelView';

export default function Delivery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { deliveries = [] } = useDeliveryContext();
  const { staffList = [] } = useDeliveryStaffContext();

  const tabParam = searchParams.get('tab') || 'drop-points';
  const viewParam = searchParams.get('view') || 'main';
  const idParam = searchParams.get('id');

  const [activeTab, setActiveTab] = useState(tabParam);
  const [currentView, setCurrentView] = useState(viewParam);
  const [viewingDelivery, setViewingDelivery] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);

  // Sync state with URL search params
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (viewParam !== currentView) {
      setCurrentView(viewParam);
    }
    if (viewParam === 'viewDelivery' && idParam) {
      const found = deliveries.find((d) => String(d.id) === String(idParam));
      if (found) setViewingDelivery(found);
    } else if (viewParam === 'viewStaff' && idParam) {
      const found = staffList.find((s) => String(s.id) === String(idParam));
      if (found) setViewingStaff(found);
    }
  }, [viewParam, idParam, deliveries, staffList]);

  const updateUrl = (tab, view, id = null) => {
    const params = new URLSearchParams();
    if (tab) params.set('tab', tab);
    if (view && view !== 'main') params.set('view', view);
    if (id) params.set('id', String(id));
    setSearchParams(params);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setCurrentView('main');
    setViewingDelivery(null);
    setViewingStaff(null);
    updateUrl(newTab, 'main');
  };

  const handlePrintSheet = () => {
    handleTabChange('drop-points');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Sub-views rendering (replaces modals with full components)
  if (currentView === 'viewDelivery' && viewingDelivery) {
    return (
      <DeliveryDetailView
        delivery={viewingDelivery}
        onBack={() => {
          setViewingDelivery(null);
          setCurrentView('main');
          updateUrl('drop-points', 'main');
        }}
      />
    );
  }

  if (currentView === 'registerStaff') {
    return (
      <RegisterStaffView
        onBack={() => {
          setCurrentView('main');
          updateUrl(activeTab, 'main');
        }}
        onComplete={(newStaff) => {
          setViewingStaff(newStaff);
          setCurrentView('viewStaff');
          updateUrl('fleet', 'viewStaff', newStaff.id);
        }}
      />
    );
  }

  if (currentView === 'viewStaff' && viewingStaff) {
    return (
      <StaffDetailView
        staff={viewingStaff}
        onBack={() => {
          setViewingStaff(null);
          setCurrentView('main');
          updateUrl('fleet', 'main');
        }}
        onViewDelivery={(del) => {
          setViewingDelivery(del);
          setCurrentView('viewDelivery');
          updateUrl('drop-points', 'viewDelivery', del.id);
        }}
      />
    );
  }

  if (currentView === 'logFuel') {
    return (
      <LogFuelView
        onBack={() => {
          setCurrentView('main');
          updateUrl('fuel', 'main');
        }}
        onComplete={() => {
          setCurrentView('main');
          updateUrl('fuel', 'main');
        }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {/* Page Heading */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5 no-print">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-800 leading-tight">
            Doorstep Deliveries
          </h3>
          <p className="text-xs text-slate-500">
            Manage daily milk delivery routes, fleet staff, and fuel logs
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="no-print">
        <DeliveryStats />
      </div>

      {/* Module Switcher Bar */}
      <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-1.5 no-print">
        <div className="flex flex-wrap items-center gap-1">
          {/* Drop Points (Green) */}
          <button
            type="button"
            onClick={() => handleTabChange('drop-points')}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'drop-points'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100 hover:text-emerald-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Drop Points
          </button>

          {/* Fleet & Staff (Purple) */}
          <button
            type="button"
            onClick={() => handleTabChange('fleet')}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'fleet'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-purple-50/80 text-purple-800 border-purple-200/80 hover:bg-purple-100 hover:text-purple-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Fleet & Staff
          </button>

          {/* Fuel Log (Blue) */}
          <button
            type="button"
            onClick={() => handleTabChange('fuel')}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'fuel'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-blue-50/80 text-blue-800 border-blue-200/80 hover:bg-blue-100 hover:text-blue-900'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            Fuel Log
          </button>
        </div>

        {/* Print Sheet (Orange) */}
        <div>
          <button
            type="button"
            onClick={handlePrintSheet}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white border border-amber-500 shadow-xs transition-all"
            title="Print clean daily run sheet"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Run Sheet
          </button>
        </div>
      </div>

      {/* Module Content Sections */}
      <div>
        {activeTab === 'drop-points' && (
          <DropPoints
            onBookDelivery={() => {
              navigate('/pos?category=delivery');
            }}
            onViewDelivery={(delivery) => {
              setViewingDelivery(delivery);
              setCurrentView('viewDelivery');
              updateUrl('drop-points', 'viewDelivery', delivery.id);
            }}
          />
        )}
        {activeTab === 'fleet' && (
          <FleetAndStaff
            onRegisterStaff={() => {
              setCurrentView('registerStaff');
              updateUrl('fleet', 'registerStaff');
            }}
            onViewStaff={(staff) => {
              setViewingStaff(staff);
              setCurrentView('viewStaff');
              updateUrl('fleet', 'viewStaff', staff.id);
            }}
          />
        )}
        {activeTab === 'fuel' && (
          <FuelLog
            onLogFuel={() => {
              setCurrentView('logFuel');
              updateUrl('fuel', 'logFuel');
            }}
          />
        )}
      </div>
    </div>
  );
}
