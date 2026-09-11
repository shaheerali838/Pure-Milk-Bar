import React from 'react';
import { Milk } from 'lucide-react';
import dairyCowImg from '@/assets/images/cows-green-field_335224-509.avif';

/**
 * AuthLayout component.
 * Provides a centered card layout over a dark dairy-farm background with no page scrolling.
 */
const AuthLayout = ({
  children,
  title = 'Welcome Back',
  subtitle = 'Sign in to access your Pure Milk Bar dashboard',
}) => {
  return (
    <div className="h-screen max-h-screen w-full flex flex-col justify-center items-center pt-8 pb-4 px-4 sm:px-6 relative overflow-hidden bg-slate-950 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Full-Page Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={dairyCowImg}
          alt="Full body Holstein dairy cow standing in green pasture"
          className="w-full h-full object-cover object-[center_25%] opacity-95 blur-xs scale-105 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/15 to-slate-950/45" />
      </div>

      {/* Ambient Gradient Glow Blobs & Grid Pattern */}
      <div className="absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Centered Content Container */}
      <div className="w-full max-w-md flex flex-col items-center relative z-10 my-auto py-2">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 mb-2">
            <Milk className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight font-sans">
            Pure Milk Bar
          </h1>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
            Management Platform
          </span>
        </div>

        {/* Login Form Card */}
        <div className="w-full bg-white/97 backdrop-blur-md rounded-2xl shadow-2xl shadow-slate-950/70 border border-white/60 p-5 sm:p-7">
          <div className="mb-4 space-y-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          {children}

          <p className="text-center text-xs text-slate-400 mt-5 pt-1">
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
