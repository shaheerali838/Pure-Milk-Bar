import React, { useState } from 'react';
import { Search, Edit, Trash2, CheckCircle2, AlertTriangle, Eye, Activity, Filter } from 'lucide-react';
import { useAnimalContext } from '../../../../context/AnimalContext';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default function AnimalTable({ onSelectAnimal }) {
  const { animals, deleteAnimal } = useAnimalContext();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filteredAnimals = animals.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (a.name || '').toLowerCase().includes(q) ||
      (a.tag || '').toLowerCase().includes(q) ||
      (a.species || '').toLowerCase().includes(q);
    
    const matchesFilter = filterType === 'All' 
      ? true 
      : filterType === 'Cow' 
        ? (a.species || '').toLowerCase().includes('cow') 
        : (a.species || '').toLowerCase().includes('buffalo');

    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id) => {
    deleteAnimal(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Search and Filter Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-80 bg-slate-50 border border-slate-200 rounded-full px-3.5 h-[38px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by tag, name or breed..."
            className="bg-transparent border-none outline-none text-[13px] text-slate-700 w-full placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto hide-scrollbar">
          {['All', 'Cow', 'Buffalo'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterType(opt)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors duration-200 ${
                filterType === opt
                  ? 'bg-emerald-600 text-white shadow-sm border border-emerald-600'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-b-slate-100">
              <TableHead className="font-bold text-slate-600 h-11 text-xs">Profile</TableHead>
              <TableHead className="font-bold text-slate-600 h-11 text-xs">Type & Breed</TableHead>
              <TableHead className="font-bold text-slate-600 h-11 text-xs">Lactation State</TableHead>
              <TableHead className="font-bold text-slate-600 h-11 text-xs">Morning Yield</TableHead>
              <TableHead className="font-bold text-slate-600 h-11 text-xs">Evening Yield</TableHead>
              <TableHead className="font-bold text-slate-600 h-11 text-xs">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-600 h-11 text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnimals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Filter className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-[13px] font-medium">No animals found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAnimals.map((animal) => (
                <TableRow key={animal.id} className="group border-b-slate-50 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                        {animal.image ? (
                          <img src={animal.image} alt="animal" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-xs">
                            {animal.tag.slice(0, 3)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {animal.tag}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          {animal.name || 'Unnamed'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-3">
                    <div>
                      <p className="text-[13px] font-bold text-slate-700">{animal.species}</p>
                      <p className="text-xs text-slate-500">{animal.breed || 'Unknown'}</p>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">
                      {animal.lactationStatus || 'Milking'}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[13px] font-bold text-slate-700">
                        {animal.morningYield || '0 L'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[13px] font-bold text-slate-700">
                        {animal.eveningYield || '0 L'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    {animal.healthStatus === 'SICK' ? (
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 flex items-center gap-1 w-fit rounded-full px-2 py-0.5">
                        <AlertTriangle className="w-3 h-3" /> <span className="font-bold text-[10px] uppercase">Sick</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 flex items-center gap-1 w-fit rounded-full px-2 py-0.5">
                        <CheckCircle2 className="w-3 h-3" /> <span className="font-bold text-[10px] uppercase">Healthy</span>
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    {confirmDeleteId === animal.id ? (
                      <div className="flex justify-end items-center gap-2 animate-in fade-in slide-in-from-right-2">
                        <button
                          onClick={() => handleDelete(animal.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full hover:bg-slate-200 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onSelectAnimal && onSelectAnimal(animal.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectAnimal && onSelectAnimal(animal.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Animal"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(animal.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Animal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
