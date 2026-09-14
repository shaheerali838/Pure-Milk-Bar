import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Password input component with eye toggle button and emerald green focus styling.
 */
const PasswordInput = ({
  id = 'password',
  label = 'Password',
  value,
  onChange,
  placeholder = '••••••••',
  error = '',
  required = false,
  disabled = false,
  autoComplete = 'current-password',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          <Lock className="h-4 w-4" aria-hidden="true" />
        </div>

        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`block w-full rounded-lg border bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-400'
          } ${
            disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed opacity-75' : ''
          }`}
          {...props}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 h-full w-9 p-0 text-slate-400 hover:text-slate-600 hover:bg-transparent focus:text-emerald-600 focus:outline-none transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
