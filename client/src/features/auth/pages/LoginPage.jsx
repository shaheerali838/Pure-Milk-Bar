import React from 'react';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';

/**
 * LoginPage component.
 * Main entry page for authentication, composing AuthLayout and LoginForm.
 */
const LoginPage = ({ onLogin, initialEmail = '' }) => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Pure Milk Bar management portal"
    >
      <LoginForm onLogin={onLogin} initialEmail={initialEmail} />
    </AuthLayout>
  );
};

export default LoginPage;
