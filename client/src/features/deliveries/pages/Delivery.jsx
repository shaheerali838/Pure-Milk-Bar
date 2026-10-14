import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Printer } from 'lucide-react';
import { useDeliveryContext } from '@/context/DeliveryContext';
import { useDeliveryStaffContext } from '@/context/DeliveryStaffContext';
import DeliveryStats from '../components/DeliveryStats';
import DropPoints from '../components/DropPoints';
import FleetAndStaff from '../components/FleetAndStaff';
import DeliveryDetailView from '../components/DeliveryDetailView';
import RegisterStaffView from '../components/RegisterStaffView';
import StaffDetailView from '../components/StaffDetailView';

export default function Delivery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { deliveries = [] } = useDeliveryContext();
  const { staffList = [] } = useDeliveryStaffContext();

  const rawTabParam = searchParams.get('tab') || 'drop-points';
  const tabParam = rawTabParam === 'fuel' ? 'drop-points' : rawTabParam;
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
    const safeTab = newTab === 'fuel' ? 'drop-points' : newTab;
    setActiveTab(safeTab);
    setCurrentView('main');
    setViewingDelivery(null);
    setViewingStaff(null);
    updateUrl(safeTab, 'main');
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

  return (
    <div className="space-y-4">
      <div className="no-print">
        <DeliveryStats />
      </div>

      {/* Dynamic Bottom Register: Drop Points & Fleet Staff Directory */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pb-2 border-b border-slate-200 no-print">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {activeTab === 'drop-points' ? 'Drop Points & Route Registry' : 'Fleet & Delivery Staff Directory'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {activeTab === 'drop-points' ? `${deliveries.length} Drop Points` : `${staffList.length} Delivery Staff`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'drop-points'
                ? 'Manage recurring customer drop routes, schedule runs, and real-time delivery status'
                : 'Delivery riders, walking delivery team, vehicle assignments, and daily run metrics'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs Switcher: Drop Points vs Fleet & Staff */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => handleTabChange('drop-points')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'drop-points'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Drop Points</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('fleet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'fleet'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Fleet &amp; Staff</span>
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={handlePrintSheet}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Print clean daily run sheet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Run Sheet</span>
              </button>
            </div>
          </div>
        </div>

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
        </div>
      </div>
    </div>
  );
}
