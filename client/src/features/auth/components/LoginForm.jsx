import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, AlertCircle, Loader2, ArrowRight, ShieldCheck, UserCheck, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthInput from './AuthInput';
import PasswordInput from './PasswordInput';
import { useAuth } from '@/context/AuthContext';

const LoginForm = ({
  initialEmail = '',
  externalError = '',
}) => {
  const { login, loginWithDemo, demoAccounts, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(initialEmail || 'admin@puremilkbar.com');
  const [password, setPassword] = useState('admin@123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN');
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

  const handleRoleSelect = (account) => {
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword(account.password);
    setErrorMessage('');
    setErrors({});
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
        }, 500);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loginWithDemo(role);
      if (res?.success) {
        setSuccessMessage(`Signed in as ${res.user.roleLabel}! Redirecting...`);
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 400);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to sign in with demo role.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = externalError || errorMessage;

  return (
    <div className="space-y-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* If already authenticated notice */}
      {isAuthenticated && user && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {user.avatar || 'SA'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-emerald-700 truncate">{user.roleLabel || user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="h-6.5 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              Go to ERP
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
              className="h-6.5 px-2 text-[11px] text-slate-600 border-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Quick 1-Click Role Selectors */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-600">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Quick Demo Accounts:
          </span>
          <span className="text-[9.5px] text-slate-400">Click to autofill</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {demoAccounts.map((acc) => {
            const isSelected = selectedRole === acc.role;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleRoleSelect(acc)}
                className={`px-2 py-1.5 rounded-xl text-left border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500 text-emerald-950 shadow-2xs font-semibold'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-[11px] truncate">{acc.role === 'ADMIN' ? '👑 Admin' : acc.role === 'MANAGER' ? '🏢 Manager' : acc.role === 'CASHIER' ? '💳 Cashier' : '🐄 Supervisor'}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                </div>
                <span className="text-[9.5px] text-slate-500 truncate">{acc.email}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
        {displayError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-2 text-rose-800 text-xs shadow-2xs animate-in fade-in-50"
          >
            <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 text-[11.5px] font-medium">{displayError}</div>
          </div>
        )}

        {successMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 p-2 text-emerald-900 text-xs shadow-2xs animate-in fade-in-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 text-[11.5px] font-medium">{successMessage}</div>
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
            <span className="text-[11.5px] font-medium text-slate-600">Keep me logged in</span>
          </label>

          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault();
              alert('Password reset link has been dispatched to administrator verification channel.');
            }}
            className="text-[11.5px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-9.5 text-xs sm:text-sm font-bold bg-[#00a86b] hover:bg-[#008f5b] text-white rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign in to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-0.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        <span>TLS 1.3 encrypted secure enterprise portal</span>
      </div>
    </div>
  );
};

export default LoginForm;
