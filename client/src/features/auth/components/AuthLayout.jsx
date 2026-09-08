import React from 'react';
import { Milk, ShieldCheck, Store, Truck, Sparkles } from 'lucide-react';

/**
 * AuthLayout component.
 * Provides a split-screen layout with a dark emerald hero panel on the left
 * and a centered white card on the right.
 */
const AuthLayout = ({
  children,
  title = 'Welcome Back',
  subtitle = 'Sign in to access your Pure Milk Bar dashboard',
}) => {
  const features = [
    {
      icon: Store,
      title: 'Real-Time Dairy POS',
      description: 'Instant milk collection entries, fat/SNF pricing, and counter billing.',
    },
    {
      icon: Truck,
      title: 'Farm-to-Door Delivery',
      description: 'Automated daily route management and milk subscription dispatching.',
    },
    {
      icon: ShieldCheck,
      title: 'Audit-Ready Ledgers',
      description: 'Streamlined farmer payouts, credit accounts, and tamper-proof security.',
    },
  ];

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Left Branded Hero Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 text-white flex-col justify-between p-12 xl:p-16">
        {/* Subtle Ambient Background Gradients & Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-900 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
            <Milk className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">
              Pure Milk Bar
            </h1>
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Management Platform
            </span>
          </div>
        </div>

        {/* Hero Content & Feature List */}
        <div className="relative z-10 my-auto max-w-lg space-y-8 py-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Dairy POS & Logistics</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Streamline your dairy business from farm to counter.
            </h2>
            <p className="text-base text-slate-300 font-normal leading-relaxed">
              Complete control over milk collection, subscription billing, customer balances, and real-time inventory management.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4 pt-2">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="flex items-start gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900/90 border border-slate-800 text-emerald-400 group-hover:border-emerald-500/50 group-hover:bg-emerald-950/40 transition-colors">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Trust Stat */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational across 500+ fresh milk hubs</span>
          </div>
          <span>v2.4 Enterprise</span>
        </div>
      </div>

      {/* Right Form Panel (Mobile & Desktop) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative bg-slate-50/50">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Header (Visible only on mobile/tablet) */}
          <div className="flex flex-col items-center text-center lg:hidden mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-md shadow-emerald-600/20 mb-3">
              <Milk className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Pure Milk Bar
            </h1>
            <p className="text-xs font-medium text-emerald-600">
              Dairy Operations & POS System
            </p>
          </div>

          {/* Form Card Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-10 transition-all duration-300">
            {/* Header Title & Subtitle inside Card */}
            <div className="mb-6 space-y-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-slate-500 font-normal">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Main Form Content */}
            {children}
          </div>

          {/* Footer note / Support link */}
          <p className="text-center text-xs text-slate-500">
            Need help accessing your account?{' '}
            <a
              href="#support"
              onClick={(e) => e.preventDefault()}
              className="font-medium text-emerald-600 hover:text-emerald-700 underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
