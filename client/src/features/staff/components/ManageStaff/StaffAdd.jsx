import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useStaffPayrollContext } from '@/context/StaffPayrollContext';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/config/rbac.config';

import { initialStaffForm, generateRandomPassword } from './form/staffFormConstants';
import StaffIdentitySection from './form/StaffIdentitySection';
import StaffContactSection from './form/StaffContactSection';
import StaffCredentialsSection from './form/StaffCredentialsSection';
import StaffSalarySection from './form/StaffSalarySection';
import StaffRoleDetailsSection from './form/StaffRoleDetailsSection';
import StaffPhotoSection from './form/StaffPhotoSection';
import StaffCredentialsSuccessModal from './form/StaffCredentialsSuccessModal';

export default function StaffAdd({ onBack, onClose, onCancel, editingStaff = null, onSuccess }) {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN || !user || (user?.role || '').toUpperCase() === 'ADMIN';

  const { addStaff, updateStaff } = useStaffPayrollContext();
  const handleBack = onBack || onClose || onCancel;
  const isEdit = Boolean(editingStaff);

  const [formData, setFormData] = useState(initialStaffForm);
  const [createdCredentialsModal, setCreatedCredentialsModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Initialize or populate editing staff
  useEffect(() => {
    if (editingStaff) {
      setFormData({
        ...initialStaffForm,
        ...editingStaff,
        id: editingStaff.id || '',
        cnic: editingStaff.cnic ? String(editingStaff.cnic).replace(/\D/g, '') : '',
        monthlySalary: editingStaff.monthlySalary ? String(editingStaff.monthlySalary) : '',
        createLoginAccount: Boolean(editingStaff.userAccountId),
        username: editingStaff.userAccountId?.username || '',
        password: '',
        sendEmailCredentials: true,
      });
    } else {
      setFormData({
        ...initialStaffForm,
        password: generateRandomPassword(),
      });
    }
  }, [editingStaff]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const nextVal = type === 'checkbox' ? checked : value;
      const updated = { ...prev, [name]: nextVal };

      // If role changed to a login-capable role, ensure account creation is active
      if (name === 'role') {
        const isLoginRole = ['Dairy Manager', 'Cashier', 'Farm Supervisor', 'Accountant', 'Delivery Rider'].includes(value);
        if (isLoginRole && !prev.password) {
          updated.createLoginAccount = true;
          updated.password = generateRandomPassword();
        }
      }

      // Auto-suggest username if name or email changed
      if (name === 'name' && !prev.username && value) {
        updated.username = value.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15);
      } else if (name === 'email' && value && (!prev.username || prev.username.startsWith('staff'))) {
        updated.username = value.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 15);
      }

      return updated;
    });
  };

  const handleCnicChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, cnic: digitsOnly }));
  };

  const handleRegeneratePassword = () => {
    setFormData((prev) => ({ ...prev, password: generateRandomPassword() }));
  };

  const calculatedDailySalary = formData.monthlySalary
    ? Math.round(parseFloat(formData.monthlySalary) / 30)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      setSubmitError('Employee Full Name is required.');
      return;
    }

    if (formData.createLoginAccount && formData.sendEmailCredentials && !formData.email.trim()) {
      setSubmitError('Email Address is required to send login credentials to the employee.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let savedResult;
      if (isEdit && editingStaff) {
        savedResult = await updateStaff(editingStaff.id, formData);
      } else {
        savedResult = await addStaff(formData);
      }

      const accountDetails = savedResult?.accountDetails || (formData.createLoginAccount ? {
        username: formData.username || formData.email.split('@')[0],
        email: formData.email,
        temporaryPassword: formData.password,
        role: formData.role,
        emailSent: Boolean(formData.sendEmailCredentials && formData.email),
      } : null);

      if (accountDetails && !isEdit) {
        setCreatedCredentialsModal({
          name: formData.name,
          role: formData.role,
          email: formData.email,
          username: accountDetails.username,
          password: accountDetails.temporaryPassword || formData.password,
          emailSent: accountDetails.emailSent,
          shift: formData.shift,
        });
      } else {
        if (onSuccess) onSuccess();
        else if (handleBack) handleBack();
      }
    } catch (err) {
      console.error('Failed to save staff:', err);
      setSubmitError(err.message || 'Failed to save staff record to database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishModal = () => {
    setCreatedCredentialsModal(null);
    if (onSuccess) onSuccess();
    else if (handleBack) handleBack();
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-150 no-scrollbar pb-8 relative">
      {/* Onboarding Credentials Success Modal */}
      <StaffCredentialsSuccessModal
        modalData={createdCredentialsModal}
        onClose={handleFinishModal}
      />

      {/* Top action & header bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Staff Roster
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight font-display leading-tight">
              {isEdit ? `Edit Staff Profile — ${editingStaff?.name || ''}` : 'Register New Staff Member'}
            </h1>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isEdit
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isEdit ? 'bg-indigo-500' : 'bg-emerald-500 animate-pulse'
            }`}
          />
          {isEdit ? `Editing ${editingStaff?.name || 'Staff'}` : 'New Staff'}
        </span>
      </div>

      {/* Main form container */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-6 shadow-2xs no-scrollbar">
        {submitError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
            <span>{submitError}</span>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-rose-500 hover:text-rose-700 ml-2 font-black"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Staff Identification & Role */}
          <StaffIdentitySection
            formData={formData}
            onChange={handleChange}
            isEdit={isEdit}
          />

          {/* Section 2: Contact & Identity Verification */}
          <StaffContactSection
            formData={formData}
            onChange={handleChange}
            onCnicChange={handleCnicChange}
          />

          {/* Section 3: System Access & Credentials Email Delivery (OWNER ONLY) */}
          {isAdmin && (
            <StaffCredentialsSection
              formData={formData}
              onChange={handleChange}
              onRegeneratePassword={handleRegeneratePassword}
            />
          )}

          {/* Section 4: Salary Terms & Payroll Rate */}
          <StaffSalarySection
            formData={formData}
            onChange={handleChange}
            isAdmin={isAdmin}
            calculatedDailySalary={calculatedDailySalary}
          />

          {/* Section 5: Dynamic Role-Specific Operational Details */}
          <StaffRoleDetailsSection
            formData={formData}
            onChange={handleChange}
          />

          {/* Section 6: Staff Photograph */}
          <StaffPhotoSection
            image={formData.image}
            onImageChange={(img) => setFormData((prev) => ({ ...prev, image: img }))}
          />

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#00a86b] hover:bg-[#008f5a] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing &amp; Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {isEdit ? 'Save Staff Changes' : 'Register Staff & Send Credentials'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
