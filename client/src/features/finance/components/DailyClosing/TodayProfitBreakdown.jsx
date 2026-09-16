import React from 'react';
import { Layers, PieChart, TrendingUp, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/common/Typography';

export default function TodayProfitBreakdown({
  productBreakdown = [],
  financialSummary = {},
}) {
  const {
    grossRevenue = null,
    totalExpenses = null,
    netEstimatedProfit = null,
  } = financialSummary;

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '—';
    return `Rs. ${Number(val).toLocaleString()}`;
  };

  const formatUnits = (val, unit) => {
    if (val === null || val === undefined) return '—';
    return `${Number(val).toLocaleString()} ${unit || ''}`;
  };

  return (
    <Card className="border border-slate-200/90 shadow-sm bg-white rounded-2xl">
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold border border-purple-100">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <Typography variant="h4" className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                Today's P&amp;L &amp; Product Breakdown
              </Typography>
              <Typography variant="caption" color="muted">
                Product sales volume, revenue contribution, and estimated profitability.
              </Typography>
            </div>
          </div>

          <Badge variant="indigo" className="text-[10px] font-bold px-2.5 py-0.5 self-start sm:self-auto">
            Product Performance
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 space-y-4 text-xs">
        {/* Product Table / Flex Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <th className="pb-2 pl-2">Product Category</th>
                <th className="pb-2 px-2 text-right">Units Sold</th>
                <th className="pb-2 px-2 text-right">Gross Revenue</th>
                <th className="pb-2 px-2 text-right">Est. Cost / COGS</th>
                <th className="pb-2 pr-2 text-right">Est. Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productBreakdown && productBreakdown.length > 0 ? (
                productBreakdown.map((item) => (
                  <tr
                    key={item.id || item.name}
                    className="hover:bg-slate-50/70 transition"
                  >
                    <td className="py-2.5 pl-2 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs">
                          {item.category === 'Milk'
                            ? '🥛'
                            : item.category === 'Dahi'
                            ? '🥣'
                            : item.category === 'Ghee'
                            ? '🧈'
                            : item.category === 'Butter'
                            ? '🧈'
                            : '🧃'}
                        </span>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-semibold text-slate-700 tabular">
                      {formatUnits(item.unitsSold, item.unit)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-black text-slate-900 tabular">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-semibold text-slate-500 tabular">
                      {formatCurrency(item.estimatedCost)}
                    </td>
                    <td className="py-2.5 pr-2 text-right font-black text-emerald-700 tabular">
                      {formatCurrency(item.profit)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">
                    <Typography variant="caption" color="muted">
                      No product sales recorded yet today.
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
