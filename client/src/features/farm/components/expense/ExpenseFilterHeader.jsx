import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExpenseFilterHeader() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
      
      <div className="flex-1 w-full sm:max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search farm expenses..." 
          className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center w-full sm:w-auto">
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto font-medium"
          onClick={() => navigate('/farm/expenses/new')}
        >
          <Plus className="mr-2 h-4 w-4" /> Record Farm Expense
        </Button>
      </div>

    </div>
  );
}
