import React from 'react';
import { Bell, Clock, AlertTriangle, PackageCheck, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/common/Typography';

export default function NotificationsTab({ data = {}, onChange }) {
  const handleToggle = (field, checked) => {
    if (onChange) {
      onChange(field, checked);
    }
  };

  const notificationItems = [
    {
      id: 'dailyClosingReminder',
      title: 'Daily Closing Reminder',
      description: 'Send daily closing reminder alerts to cashier and manager at 10:00 PM',
      icon: Clock,
      color: '#00a86b',
    },
    {
      id: 'customerCreditLimitAlert',
      title: 'Customer Credit Limit Alert',
      description: 'Trigger alert when customer khata reaches 90% of credit limit',
      icon: AlertTriangle,
      color: '#f59e0b',
    },
    {
      id: 'lowMilkStockWarning',
      title: 'Low Milk Stock Warning',
      description: 'Alert when morning/evening bulk milk level falls below threshold',
      icon: PackageCheck,
      color: '#2563eb',
    },
    {
      id: 'deliveryDispatchNotification',
      title: 'Delivery Dispatch Notification',
      description: 'Notify riders automatically when morning/evening route sheet is generated',
      icon: Send,
      color: '#7c3aed',
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-slate-200/80 shadow-2xs">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 font-display">
                Automated System &amp; Operational Alerts
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure automated threshold triggers, dispatch prompts, and shift reminder banners
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 divide-y divide-slate-100">
          {notificationItems.map((item) => {
            const Icon = item.icon;
            const isChecked = Boolean(data[item.id]);

            return (
              <div
                key={item.id}
                className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${item.color}15`, color: item.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <Label
                      htmlFor={item.id}
                      className="text-xs font-bold text-slate-900 cursor-pointer block leading-tight"
                    >
                      {item.title}
                    </Label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <Checkbox
                    id={item.id}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleToggle(item.id, checked === true)}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
