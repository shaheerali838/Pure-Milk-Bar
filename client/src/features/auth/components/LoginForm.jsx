import React, { useState } from 'react';
import { Mail, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthInput from './AuthInput';
import PasswordInput from './PasswordInput';

const LoginForm = ({
  onLogin,
  initialEmail = '',
  externalError = '',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      if (typeof onLogin === 'function') {
        await onLogin(email, password, rememberMe);
      } else {
        console.log('Login stub submitted:', { email, password, rememberMe });
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = externalError || errorMessage;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {displayError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/90 p-3.5 text-rose-800 text-sm shadow-xs"
        >
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 font-medium">{displayError}</div>
        </div>
      )}

      <AuthInput
        id="email"
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
        }}
        placeholder="manager@puremilkbar.com"
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

      <div className="flex items-center justify-between pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
          />
          <span className="text-sm font-medium text-slate-600">Remember me</span>
        </label>

        <a
          href="#forgot-password"
          onClick={(e) => e.preventDefault()}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus:outline-none focus:underline transition-colors"
        >
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 text-sm font-semibold shadow-md shadow-emerald-600/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign in to Dashboard</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
