import React, { useState } from "react";
import {
  Key,
  Users,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

export default function StaffCredentialsSection({
  formData,
  onChange,
  onRegeneratePassword,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">
            <Key className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-slate-800 font-display uppercase tracking-wider">
            3. System Access &amp; Email Credentials Delivery
          </h2>
        </div>
        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          Owner Provisioning
        </span>
      </div>

      <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="createLoginAccount"
              checked={formData.createLoginAccount}
              onChange={onChange}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Enable Portal Login Account for {formData.role}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Creates an enterprise user account and grants access based on
                role permissions.
              </span>
            </div>
          </label>

          {formData.createLoginAccount && (
            <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                name="sendEmailCredentials"
                checked={formData.sendEmailCredentials}
                onChange={onChange}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Send className="w-3 h-3 text-emerald-600" />
                Send credentials via email
              </span>
            </label>
          )}
        </div>

        {formData.createLoginAccount && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/70 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Portal Username / Login ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={onChange}
                  placeholder="e.g. tariq_mgr"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Temporary Password
                </label>
                <button
                  type="button"
                  onClick={onRegeneratePassword}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Generate New
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  placeholder="Enter or generate password"
                  className="w-full pl-8 pr-16 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#00a86b] focus:border-[#00a86b] transition font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {formData.sendEmailCredentials && (
              <div className="col-span-full p-2.5 bg-emerald-50/80 border border-emerald-200/90 rounded-lg flex items-center gap-2 text-[11px] text-emerald-800 font-medium">
                <span>
                  Upon saving, an automated welcome email with login portal URL,
                  username, and temporary password will be delivered to{" "}
                  <strong>{formData.email || "(enter email above)"}</strong>.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
