import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Building2,
  ShoppingCart,
  Tractor,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthInput from './AuthInput';
import PasswordInput from './PasswordInput';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/config/rbac.config';

const QUICK_ROLES = [
  {
    role: ROLES.ADMIN,
    title: 'Owner / Admin',
    desc: 'Full ERP & Financial Access',
    email: 'admin@puremilkbar.com',
    password: 'admin123',
    icon: Crown,
    color: 'text-amber-600',
    bg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200/80',
    badge: 'Supreme Access',
    badgeBg: 'bg-amber-100 text-amber-800',
    targetPath: '/dashboard',
  },
  {
    role: ROLES.MANAGER,
    title: 'Branch Manager',
    desc: 'Operations & Procurement',
    email: 'manager@puremilkbar.com',
    password: 'manager123',
    icon: Building2,
    color: 'text-blue-600',
    bg: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200/80',
    badge: 'Operations',
    badgeBg: 'bg-blue-100 text-blue-800',
    targetPath: '/dashboard',
  },
  {
    role: ROLES.CASHIER,
    title: 'POS Cashier',
    desc: 'Counter Sales & Billing',
    email: 'cashier@puremilkbar.com',
    password: 'cashier123',
    icon: ShoppingCart,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200/80',
    badge: 'Point of Sale',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    targetPath: '/pos',
  },
  {
    role: ROLES.FARM_SUPERVISOR,
    title: 'Farm Supervisor',
    desc: 'Milking & Dahi Processing',
    email: 'farm@puremilkbar.com',
    password: 'farm123',
    icon: Tractor,
    color: 'text-purple-600',
    bg: 'bg-purple-50 hover:bg-purple-100/80 border-purple-200/80',
    badge: 'Production Hub',
    badgeBg: 'bg-purple-100 text-purple-800',
    targetPath: '/farm',
  },
];

const LoginForm = ({
  initialEmail = '',
  externalError = '',
}) => {
  const { login, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(initialEmail || 'admin@puremilkbar.com');
  const [password, setPassword] = useState('admin@123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Destination route after login
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address or username is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 5) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res?.success) {
        setSuccessMessage(`Welcome back, ${res.user.name}! Redirecting...`);
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 400);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (quickItem) => {
    setEmail(quickItem.email);
    setPassword(quickItem.password);
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await login(quickItem.email, quickItem.password, rememberMe);
      if (res?.success) {
        setSuccessMessage(`Signed in as ${quickItem.title}! Redirecting...`);
        setTimeout(() => {
          navigate(quickItem.targetPath, { replace: true });
        }, 400);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Quick login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDevelopment = Boolean(import.meta.env.DEV || import.meta.env.MODE === 'development');

  return (
    <div className="space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Quick Test Logins Grid (Only visible in Development) */}
      {isDevelopment && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Quick Role Switcher (Dev Mode)
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Click to sign in instantly
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {QUICK_ROLES.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleQuickLogin(item)}
                    disabled={isLoading}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs active:scale-98 ${item.bg}`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className={`p-1 rounded-lg bg-white shadow-2xs ${item.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${item.badgeBg}`}>
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <div className="relative bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Or sign in manually
            </div>
          </div>
        </>
      )}

      {/* If already authenticated notice */}
      {isAuthenticated && user && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {user.avatar || 'SA'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[11px] text-emerald-700 truncate">{user.email || user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-semibold"
            >
              Go to ERP
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
              className="h-7 px-2.5 text-xs text-slate-600 border-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {displayError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-2.5 text-rose-800 text-xs shadow-2xs animate-in fade-in-50"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 text-xs font-medium">{displayError}</div>
          </div>
        )}

        {successMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 p-2.5 text-emerald-900 text-xs shadow-2xs animate-in fade-in-50"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 text-xs font-medium">{successMessage}</div>
          </div>
        )}

        <AuthInput
          id="email"
          label="Email Address / Username"
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          placeholder="admin@puremilkbar.com or admin"
          icon={Mail}
          error={errors.email}
          required
          disabled={isLoading}
          autoComplete="username"
        />

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
          }}
          placeholder="••••••••"
          error={errors.password}
          required
          disabled={isLoading}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between pt-0.5 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
            />
            <span className="text-xs font-medium text-slate-600">Keep me logged in</span>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 text-xs sm:text-sm font-bold bg-[#00a86b] hover:bg-[#008f5b] text-white rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In to Pure Milk Bar</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Enterprise Operations Hub &bull; Pure Milk Bar ERP</span>
      </div>
    </div>
  );
};

export default LoginForm;
