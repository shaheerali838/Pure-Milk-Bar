import React from 'react';
import { Shield, AlertTriangle, Users, Lock, ChevronRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/common/Typography';

export default function RolesTab() {
  const sampleRoles = [
    {
      name: 'Farm Owner & Administrator',
      code: 'ADMIN',
      badge: 'Full Access',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Unrestricted access to all modules, financial P&L, closing records, and settings.',
    },
    {
      name: 'Store & Farm Manager',
      code: 'MANAGER',
      badge: 'Management',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Operations, cattle inventory, milk processing, daily closing, and rider dispatch.',
    },
    {
      name: 'Accountant & Finance Lead',
      code: 'ACCOUNTANT',
      badge: 'Financials',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      description: 'Customer khata ledger, payment collection receipts, expense log, and staff payroll slips.',
    },
    {
      name: 'Counter Sales Cashier',
      code: 'CASHIER',
      badge: 'POS Only',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Point of Sale billing, customer lookups, cash drawer reconciliation, and receipt printing.',
    },
    {
      name: 'Delivery Rider & Courier',
      code: 'RIDER',
      badge: 'Logistics',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Assigned doorstep route delivery, cash on delivery log, and morning/evening run sheets.',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Warning Alert */}
      <div className="flex items-start gap-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs space-y-0.5">
          <p className="font-bold text-amber-900">
            Changing role permissions affects all users with that role immediately.
          </p>
          <p className="text-amber-800/80 text-[11px]">
            Security policies and fine-grained access control matrices are centrally audited. Review active roles before updating authorizations.
          </p>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-2xs">
        <CardHeader className="p-3.5 pb-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 font-display leading-tight">
                Access Control &amp; System Roles
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Preset authority tiers for farm employees, counter operators, and finance managers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 pt-1 divide-y divide-slate-100">
          {sampleRoles.map((role) => (
            <div
              key={role.code}
              className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/50 px-2 rounded-xl transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {role.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${role.badgeColor}`}>
                    {role.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 max-w-xl">
                  {role.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {role.code}
                </span>
              </div>
            </div>
          ))}

          {/* Future Users & Roles link card */}
          <div className="pt-4 mt-2">
            <div className="p-3.5 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>
                  Custom permission matrix &amp; user role assignment available in the upcoming <strong>Users &amp; Roles</strong> management module.
                </span>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 shrink-0">
                System Default Policy Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
