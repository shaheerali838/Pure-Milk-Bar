import React from 'react';
import { Link } from 'react-router-dom';
import { Milk, ArrowLeft } from 'lucide-react';
import dairyCowImg from '@/assets/images/cows-green-field_335224-509.avif';

const AuthLayout = ({
  children,
  title = 'Welcome Back',
  subtitle = 'Sign in to access your Pure Milk Bar dashboard',
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative overflow-y-auto bg-slate-950 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <div className="absolute inset-0 z-0">
        <img
          src={dairyCowImg}
          alt="Full body Holstein dairy cow standing in green pasture"
          className="w-full h-full object-cover object-[center_25%] opacity-90 blur-xs scale-105 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/80" />
      </div>

      <div className="absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Left Return to Landing */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-md border border-white/10 shadow-lg transition-all hover:scale-105 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Pure Milk Bar</span>
        </Link>
      </div>

      <div className="w-full max-w-md flex flex-col items-center relative z-10 my-auto py-4">
        <div className="flex flex-col items-center text-center mb-4">
          <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-500/30 ring-1 ring-white/30 mb-2.5 hover:scale-105 transition-transform cursor-pointer">
            <Milk className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight font-sans">
            Pure Milk Bar
          </h1>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
            ERP Management Portal
          </span>
        </div>

        <div className="w-full bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl shadow-slate-950/80 border border-white/60 p-5 sm:p-7">
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

          {children}

          <p className="text-center text-xs text-slate-400 mt-4 pt-1">
            Need help accessing your account?{' '}
            <Link
              to="/#contact"
              className="font-semibold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
