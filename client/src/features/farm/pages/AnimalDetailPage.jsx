import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAnimalContext } from '../../../context/AnimalContext';
import { ArrowLeft, Edit, Trash2, Beef, X } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function AnimalDetailPage() {
  const { animals = [], updateAnimal, deleteAnimal } = useAnimalContext();
  const navigate = useNavigate();
  const { id } = useParams();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const animal = animals.find(
    (a) => String(a.id) === String(id) || String(a.tag).toLowerCase() === String(id).toLowerCase()
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/farm/animals');
    }
  };

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    tag: '',
    name: '',
    species: 'Cow (Sahiwal)',
    lactationStatus: 'Milking',
    acquisitionDate: '',
    morningYield: '',
    eveningYield: '',
    expectedYield: '',
    purchasePrice: '',
    healthStatus: 'Healthy & Vaccinated',
  });

  useEffect(() => {
    if (animal) {
      setEditFormData({
        tag: animal.tag || '',
        name: animal.name || '',
        species: animal.species || 'Cow (Sahiwal)',
        lactationStatus: animal.lactationStatus || 'Milking',
        acquisitionDate: animal.acquisitionDate || new Date().toISOString().split('T')[0],
        morningYield: animal.morningYield ? String(animal.morningYield).replace(' L', '') : '',
        eveningYield: animal.eveningYield ? String(animal.eveningYield).replace(' L', '') : '',
        expectedYield: animal.expectedYield ? String(animal.expectedYield).replace(' L', '') : '',
        purchasePrice: animal.purchasePrice ? String(animal.purchasePrice).replace(/[^0-9.]/g, '') : '',
        healthStatus: animal.healthStatus || 'Healthy & Vaccinated',
      });
    }
  }, [animal]);

  if (!animal) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-slate-700">Animal record not found</h2>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteAnimal(animal.id);
    handleBack();
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (updateAnimal) {
      updateAnimal(animal.id, editFormData);
    }
    setIsEditOpen(false);
  };

  const statusBadgeColor = {
    'Milking': 'bg-emerald-100 text-emerald-800',
    'Dry/Gestating': 'bg-amber-100 text-amber-800',
    'Calf': 'bg-blue-100 text-blue-800',
  }[animal.lactationStatus] || 'bg-slate-100 text-slate-700';

  const chartData = animal.history && animal.history.length > 0 ? animal.history : [
    { date: '18 Aug', morning: 8.2, evening: 7.0 },
    { date: '19 Aug', morning: 8.8, evening: 7.3 },
    { date: '20 Aug', morning: 8.0, evening: 6.8 },
    { date: '21 Aug', morning: 9.1, evening: 7.5 },
    { date: '22 Aug', morning: 8.5, evening: 7.2 },
    { date: '23 Aug', morning: 8.9, evening: 7.4 },
    { date: '24 Aug', morning: 8.5, evening: 7.2 },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="p-2 h-auto rounded-full hover:bg-slate-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Beef className="w-6 h-6 text-emerald-600" />
              Animal Details
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Tag: <span className="font-semibold text-slate-700">{animal.tag}</span>
              {animal.name && animal.name !== animal.tag && (
                <span className="ml-1 text-slate-400">({animal.name})</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tag # & Name
                </p>
                <p className="text-lg font-bold text-slate-900 font-mono">
                  {animal.tag}
                  {animal.name && animal.name !== animal.tag && (
                    <span className="ml-2 font-sans font-medium text-slate-600 text-base">
                      ({animal.name})
                    </span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Species & Breed
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                  {animal.species || 'Cow (Sahiwal)'}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Lactation Status
                </p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeColor}`}>
                  {animal.lactationStatus || 'Milking'}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Acquisition Date
                </p>
                <p className="text-lg text-slate-700">
                  {animal.acquisitionDate
                    ? new Date(animal.acquisitionDate).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Health Status
                </p>
                <p className="text-base text-slate-700">
                  {animal.healthStatus || 'Healthy & Vaccinated'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Total Daily Yield
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {animal.totalDailyYield || '0.0 L'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <span>
                    Morning: <strong className="text-emerald-700">{animal.morningYield || '0.0 L'}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Evening: <strong className="text-emerald-700">{animal.eveningYield || '0.0 L'}</strong>
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Expected Daily Yield
                </p>
                <p className="text-base text-slate-700 font-semibold">
                  {animal.expectedYield || '15.0 L'}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Purchase Price
                </p>
                <p className="text-base text-slate-700 font-semibold">
                  {animal.purchasePrice || 'Rs 200,000'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                7-Day Milking Performance
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                  Morning Yield
                </span>
                <span className="flex items-center gap-1.5 text-teal-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span>
                  Evening Yield
                </span>
              </div>
            </div>

            <div className="border border-slate-200/70 rounded-2xl p-4 bg-slate-50/50 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="morningGradDetail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009966" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#009966" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="eveningGradDetail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: "#CBD5E1" }}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val} L`}
                    domain={[0, 14]}
                    ticks={[0, 3, 6, 9, 12]}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      `${val} L`,
                      name === "morning" ? "Morning" : "Evening",
                    ]}
                    contentStyle={{
                      backgroundColor: "#FFF",
                      borderRadius: "12px",
                      borderColor: "#E2E8F0",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="morning"
                    stroke="#009966"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#morningGradDetail)"
                  />
                  <Area
                    type="monotone"
                    dataKey="evening"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#eveningGradDetail)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-8 border-t border-slate-100 mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center space-x-2 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteOpen(true)}
              className="h-11 px-6 bg-rose-500 hover:bg-rose-600 shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all h-11 px-8 cursor-pointer"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          </div>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Edit Animal Details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tag #
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.tag}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, tag: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Name / Identifier (Optional)
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Species
                  </label>
                  <select
                    value={editFormData.species}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, species: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  >
                    <option value="Cow (Sahiwal)">Cow (Sahiwal)</option>
                    <option value="Cow (Cholistani)">Cow (Cholistani)</option>
                    <option value="Buffalo (Nili Ravi)">Buffalo (Nili Ravi)</option>
                    <option value="Buffalo (Kundi)">Buffalo (Kundi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lactation Status
                  </label>
                  <select
                    value={editFormData.lactationStatus}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, lactationStatus: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  >
                    <option value="Milking">Milking</option>
                    <option value="Dry/Gestating">Dry/Gestating</option>
                    <option value="Calf">Calf</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Acquisition Date
                </label>
                <input
                  type="date"
                  required
                  value={editFormData.acquisitionDate}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, acquisitionDate: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Morning (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={editFormData.morningYield}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, morningYield: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Evening (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="0.0"
                    value={editFormData.eveningYield}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, eveningYield: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Delete Livestock Record
              </h2>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <p className="text-slate-600 text-base leading-relaxed font-normal">
                Are you sure you want to remove animal <strong className="text-slate-900">{animal.tag}</strong> from the farm register? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-2.5 rounded-full bg-[#E11D48] hover:bg-[#D91B42] text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  Delete Animal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
