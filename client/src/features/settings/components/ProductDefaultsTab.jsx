import React from 'react';
import { Package, Info, AlertTriangle, Percent, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/common/Typography';

export default function ProductDefaultsTab({ data = {}, onChange }) {
  const handleChange = (field, value) => {
    if (onChange) {
      onChange(field, value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Information Banner */}
      <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-blue-800">
            Product definitions are managed in the Products & Pricing page. Configure defaults here.
          </p>
          <p className="text-blue-700/80 text-[11px]">
            Values configured here apply as initial baseline parameters for bulk milk reconciliation, daily variance thresholds, and loss tracking.
          </p>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-2xs">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 font-display">
                Inventory &amp; Measurement Defaults
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Default measurement units and threshold tolerances for dairy inventory tracking
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Unit */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Default Stock &amp; Sales Unit</Label>
              <Select
                value={data.defaultUnit || 'liter'}
                onValueChange={(val) => handleChange('defaultUnit', val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Default Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liter">Liters (L)</SelectItem>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Variance Tolerance */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Daily Closing Variance Tolerance</Label>
              <Select
                value={data.varianceTolerance || '±1%'}
                onValueChange={(val) => handleChange('varianceTolerance', val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Variance Tolerance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="±0.5%">±0.5% (Strict)</SelectItem>
                  <SelectItem value="±1%">±1% (Standard)</SelectItem>
                  <SelectItem value="±2%">±2% (Moderate)</SelectItem>
                  <SelectItem value="±5%">±5% (Relaxed)</SelectItem>
                  <SelectItem value="None">None (Zero Tolerance)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Low Stock Threshold */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Low Stock Alert Threshold (kg/L)</Label>
              <div className="relative">
                <Scale className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 50"
                  value={data.lowStockThreshold !== undefined && data.lowStockThreshold !== null ? data.lowStockThreshold : ''}
                  onChange={(e) => handleChange('lowStockThreshold', e.target.value === '' ? '' : Number(e.target.value))}
                  className="pl-9 h-9 text-xs font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400">Triggers visual warning when physical stock falls below this quantity</p>
            </div>

            {/* Wastage Allowance */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Allowable Processing Wastage (%)</Label>
              <div className="relative">
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  placeholder="e.g. 2.5"
                  value={data.wastageAllowance !== undefined && data.wastageAllowance !== null ? data.wastageAllowance : ''}
                  onChange={(e) => handleChange('wastageAllowance', e.target.value === '' ? '' : Number(e.target.value))}
                  className="pl-9 h-9 text-xs font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400">Normal evaporation / handling loss margin during processing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
