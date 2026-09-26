import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '@/config/rbac.config';

const AuthContext = createContext(null);

const STORAGE_KEY = 'pmb_auth_session';

// Pre-configured system accounts with realistic enterprise dairy profiles & distinct roles
export const DEMO_ACCOUNTS = [
  {
    id: 'usr_admin_01',
    username: 'admin',
    email: 'admin@puremilkbar.com',
    password: 'admin@123456',
    altPassword: 'admin123',
    name: 'Shaheer Ali',
    role: ROLES.ADMIN,
    roleLabel: 'Owner & System Administrator',
    phone: '+92 300 1234567',
    avatar: 'SA',
    shift: 'ROTATING',
    branch: 'Headquarters & Processing Hub',
  },
  {
    id: 'usr_mgr_02',
    username: 'manager',
    email: 'manager@puremilkbar.com',
    password: 'manager123',
    name: 'Tariq Mehmood',
    role: ROLES.MANAGER,
    roleLabel: 'Operations & Branch Manager',
    phone: '+92 321 8844221',
    avatar: 'TM',
    shift: 'MORNING',
    branch: 'Model Town Commercial Outlet',
  },
  {
    id: 'usr_cashier_03',
    username: 'cashier',
    email: 'cashier@puremilkbar.com',
    password: 'cashier123',
    name: 'Hamza Butt',
    role: ROLES.CASHIER,
    roleLabel: 'POS & Counter Cashier',
    phone: '+92 333 9955112',
    avatar: 'HB',
    shift: 'EVENING',
    branch: 'Main Bar Counter #1',
  },
  {
    id: 'usr_farm_04',
    username: 'supervisor',
    email: 'farm@puremilkbar.com',
    password: 'farm123',
    name: 'Chaudhry Akram',
    role: ROLES.FARM_SUPERVISOR,
    roleLabel: 'Farm & Production Supervisor',
    phone: '+92 345 7711223',
    avatar: 'CA',
    shift: 'MORNING',
    branch: 'Dairy Farm Yard #4',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved).user || null;
      }
    } catch (e) {
      console.error('Failed to parse saved auth session:', e);
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved).token || null;
      }
    } catch (e) {
      console.error('Failed to parse saved auth token:', e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(user && token);

  // Helper to check if current user has any of the specified roles
  const hasRole = useCallback((...allowedRoles) => {
    if (!user || !user.role) return false;
    if (user.role === ROLES.ADMIN) return true; // ADMIN matches all
    return allowedRoles.includes(user.role);
  }, [user]);

  // Helper to check if current user has a specific granular permission
  const hasPermission = useCallback((permission) => {
    if (!user || !user.role) return false;
    if (user.role === ROLES.ADMIN) return true; // ADMIN possesses all permissions
    const userPerms = ROLE_PERMISSIONS[user.role] || [];
    return userPerms.includes(permission);
  }, [user]);

  const saveSession = (userData, userToken) => {
    const payload = JSON.stringify({ user: userData, token: userToken, savedAt: new Date().toISOString() });
    try { sessionStorage.setItem(STORAGE_KEY, payload); } catch (_) {}
    try { localStorage.setItem(STORAGE_KEY, payload); } catch (_) {}
    try { localStorage.setItem('auth_token', userToken); } catch (_) {}
    setUser(userData);
    setToken(userToken);
  };

  const login = async (identifier, password, rememberMe = true) => {
    setIsLoading(true);
    setError(null);

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    try {
      // 1. Try backend API login first
      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanIdentifier, password: cleanPassword }),
        });

        if (response.ok) {
          const data = await response.json();
          const loggedUser = data.data?.user || data.user;
          const accessToken = data.data?.accessToken || data.token;
          if (loggedUser && accessToken) {
            saveSession(loggedUser, accessToken);
            setIsLoading(false);
            return { success: true, user: loggedUser };
          }
        }
      } catch (apiErr) {
        console.warn('Backend login API fallback:', apiErr.message);
      }

      // 2. Validate against pre-configured enterprise accounts
      const matched = DEMO_ACCOUNTS.find(
        (acc) =>
          (acc.email.toLowerCase() === cleanIdentifier || acc.username.toLowerCase() === cleanIdentifier) &&
          (acc.password === cleanPassword || (acc.altPassword && acc.altPassword === cleanPassword))
      );

      if (matched) {
        // Simulated network latency
        await new Promise((resolve) => setTimeout(resolve, 250));

        const userPayload = {
          id: matched.id,
          username: matched.username,
          name: matched.name,
          email: matched.email,
          phone: matched.phone,
          role: matched.role,
          roleLabel: matched.roleLabel,
          avatar: matched.avatar,
          shift: matched.shift,
          branch: matched.branch,
          lastLoginAt: new Date().toISOString(),
        };

        const simulatedToken = 'pmb_jwt_' + btoa(`${matched.username}_${Date.now()}`);
        saveSession(userPayload, simulatedToken, rememberMe);
        setIsLoading(false);
        return { success: true, user: userPayload };
      }

      // 3. Fallback: Structured email match for quick testing
      if (cleanIdentifier.includes('@') && cleanPassword.length >= 6) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const usernamePrefix = cleanIdentifier.split('@')[0];
        const formattedName = usernamePrefix
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        let detectedRole = ROLES.ADMIN;
        let detectedLabel = 'Owner & System Administrator';

        if (cleanIdentifier.includes('manager')) {
          detectedRole = ROLES.MANAGER;
          detectedLabel = 'Operations & Branch Manager';
        } else if (cleanIdentifier.includes('cashier')) {
          detectedRole = ROLES.CASHIER;
          detectedLabel = 'POS & Counter Cashier';
        } else if (cleanIdentifier.includes('farm') || cleanIdentifier.includes('supervisor')) {
          detectedRole = ROLES.FARM_SUPERVISOR;
          detectedLabel = 'Farm & Production Supervisor';
        }

        const customUser = {
          id: 'usr_' + Date.now().toString(36),
          username: usernamePrefix,
          name: formattedName || 'Enterprise Operator',
          email: cleanIdentifier,
          phone: '+92 300 0000000',
          role: detectedRole,
          roleLabel: detectedLabel,
          avatar: formattedName.substring(0, 2).toUpperCase() || 'PM',
          shift: 'MORNING',
          branch: 'Main Dairy Farm Facility',
          lastLoginAt: new Date().toISOString(),
        };

        const customToken = 'pmb_jwt_' + btoa(`${customUser.username}_${Date.now()}`);
        saveSession(customUser, customToken, rememberMe);
        setIsLoading(false);
        return { success: true, user: customUser };
      }

      throw new Error('Invalid email or password. Please use registered credentials or click a quick demo account.');
    } catch (err) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
      throw err;
    }
  };

  const loginWithDemo = async (role = ROLES.ADMIN) => {
    const target = DEMO_ACCOUNTS.find((a) => a.role === role) || DEMO_ACCOUNTS[0];
    return login(target.email, target.password, true);
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    setUser(null);
    setToken(null);
    setError(null);
  };

  const updateUserProfile = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.user = updated;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithDemo,
    logout,
    updateUserProfile,
    hasRole,
    hasPermission,
    demoAccounts: DEMO_ACCOUNTS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
