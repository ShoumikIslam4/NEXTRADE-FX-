import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PermissionCategory, StaffRecord, SystemRoleType } from '../types/admin';

export interface PlatformReferralConfig {
  enabled: boolean;
  referrerCommissionPercent: number;
  referrerSignupBonusUSD: number;
  referredDiscountPercent: number;
}

export interface PlatformSettings {
  requireKycToTrade: boolean;
  referralConfig: PlatformReferralConfig;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  requireKycToTrade: false,
  referralConfig: {
    enabled: true,
    referrerCommissionPercent: 10,
    referrerSignupBonusUSD: 5,
    referredDiscountPercent: 20
  }
};

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'USER' | SystemRoleType | string;
  isEmailVerified: boolean;
  country?: string;
  phone?: string;
  createdAt?: string;
  lastLoginAt?: string;
  kycStatus?: 'UNSUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';
  kycDocumentType?: string;
  kycDocumentNumber?: string;
  kycDocumentFileName?: string;
  kycFrontFileName?: string;
  kycBackFileName?: string;
  kycSubmittedAt?: string;
  kycNotes?: string;
  referralCode?: string;
  referralEarnings?: number;
  referralCount?: number;
  permissions?: PermissionCategory[];
  staffProfile?: StaffRecord | null;
}

export interface TradingAccount {
  id: string;
  userId: string;
  accountNumber: string;
  mode: 'DEMO' | 'LIVE';
  type: string;
  server: string;
  leverage: string;
  currency: string;
  initialBalance: number;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  floatingProfit: number;
  isPrimary: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaffOrAdmin: boolean;
  hasPermission: (category: PermissionCategory) => boolean;
  serverTradingAccounts: TradingAccount[];
  bdtRate: number;
  platformSettings: PlatformSettings;
  refreshPlatformSettings: () => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string; role?: string; emailAlertSent?: boolean }>;
  register: (fullName: string, email: string, password: string, confirmPassword: string, phone?: string, referralCode?: string) => Promise<{ success: boolean; message: string; emailAlertSent?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { fullName?: string; country?: string; phone?: string }) => Promise<{ success: boolean; message: string }>;
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<{ success: boolean; message: string }>;
  submitKyc: (data: {
    documentType: string;
    documentNumber: string;
    fileName?: string;
    frontFileName?: string;
    backFileName?: string;
    frontImage?: string;
    backImage?: string;
  }) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read cached user synchronously so Chrome reload / back button / home clicks never drop the authenticated state
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('nextrade_cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [bdtRate, setBdtRate] = useState<number>(122.50);
  const [serverTradingAccounts, setServerTradingAccounts] = useState<TradingAccount[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    try {
      const cached = localStorage.getItem('nextrade_platform_settings');
      return cached ? JSON.parse(cached) : DEFAULT_PLATFORM_SETTINGS;
    } catch {
      return DEFAULT_PLATFORM_SETTINGS;
    }
  });

  const applyPlatformSettings = (settings?: PlatformSettings | null) => {
    if (!settings) return;
    setPlatformSettings(settings);
    try {
      localStorage.setItem('nextrade_platform_settings', JSON.stringify(settings));
    } catch {
      // ignore storage quota errors
    }
  };

  // Sync state to localStorage whenever user changes
  const saveUserState = (u: User | null, token?: string) => {
    setUser(u);
    if (u) {
      localStorage.setItem('nextrade_cached_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('nextrade_cached_user');
      localStorage.removeItem('nextrade_token');
      setServerTradingAccounts([]);
    }
    if (token) {
      localStorage.setItem('nextrade_token', token);
    }
  };

  const parseJsonSafe = async (res: Response): Promise<any> => {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const refreshPlatformSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/platform/config', { credentials: 'include' });
      if (res.ok) {
        const data = await parseJsonSafe(res);
        if (data?.settings) {
          applyPlatformSettings(data.settings);
        }
        if (data?.bdtRate) {
          setBdtRate(data.bdtRate);
        }
      }
    } catch {
      // keep cached settings
    }
  }, []);

  // Check current session from /api/auth/me on initial load and keep it synced
  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('nextrade_token');
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/me', {
        headers,
        credentials: 'include'
      });

      if (res.ok) {
        const data = await parseJsonSafe(res);
        if (data?.success && data.user) {
          saveUserState(data.user);
          if (data.bdtRate) {
            setBdtRate(data.bdtRate);
          }
          if (data.platformSettings) {
            applyPlatformSettings(data.platformSettings);
          }
          if (Array.isArray(data.tradingAccounts)) {
            setServerTradingAccounts(data.tradingAccounts);
          }
          return;
        }
      }

      // If backend explicitly rejected session (401), clear cached user
      if (res.status === 401) {
        saveUserState(null);
      }
    } catch (err) {
      console.warn('[Auth] Session check fallback to cached user', err);
      // Don't log out user on network hiccups - maintain cached session
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    refreshPlatformSettings();
  }, [refreshUser, refreshPlatformSettings]);

  const login = async (email: string, password: string, rememberMe = true): Promise<{ success: boolean; message: string; role?: string; emailAlertSent?: boolean }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await parseJsonSafe(res);
      if (res.ok && data?.success) {
        saveUserState(data.user, data.token);
        if (data.platformSettings) {
          applyPlatformSettings(data.platformSettings);
        }
        refreshUser();
        return { success: true, message: data.message, role: data.user.role, emailAlertSent: !!data.emailAlertSent };
      }
      return {
        success: false,
        message: data?.message || `Login failed (HTTP ${res.status}). Please try again.`
      };
    } catch (err) {
      return { success: false, message: 'Network error or server unavailable. Please try again.' };
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone?: string,
    referralCode?: string
  ): Promise<{ success: boolean; message: string; emailAlertSent?: boolean }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, email, password, confirmPassword, phone, referralCode })
      });
      const data = await parseJsonSafe(res);
      if (res.ok && data?.success) {
        saveUserState(data.user, data.token);
        if (data.platformSettings) {
          applyPlatformSettings(data.platformSettings);
        }
        return { success: true, message: data.message, emailAlertSent: !!data.emailAlertSent };
      }
      return {
        success: false,
        message: data?.message || `Registration failed (HTTP ${res.status}). Please ensure the backend API is deployed and reachable.`
      };
    } catch (err) {
      return { success: false, message: 'Network error during registration. Could not reach authentication server.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('nextrade_token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include'
      });
    } catch (err) {
      console.error('[Auth] Logout failed', err);
    } finally {
      saveUserState(null);
    }
  };

  const submitKyc = async (data: {
    documentType: string;
    documentNumber: string;
    fileName?: string;
    frontFileName?: string;
    backFileName?: string;
    frontImage?: string;
    backImage?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('nextrade_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/user/kyc', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data)
      });
      const result = await parseJsonSafe(res);
      if (res.ok && result?.success) {
        if (user) {
          const updated: User = {
            ...user,
            kycStatus: 'PENDING',
            kycDocumentType: data.documentType,
            kycDocumentNumber: data.documentNumber,
            kycDocumentFileName: data.frontFileName || data.fileName || user.kycDocumentFileName,
            kycFrontFileName: data.frontFileName || data.fileName || user.kycFrontFileName,
            kycBackFileName: data.backFileName || user.kycBackFileName,
            kycSubmittedAt: new Date().toISOString()
          };
          saveUserState(updated);
        }
        return { success: true, message: result.message };
      }
      return { success: false, message: result?.message || 'Failed to submit KYC.' };
    } catch (err) {
      return { success: false, message: 'Network error submitting KYC document.' };
    }
  };

  const updateProfile = async (data: { fullName?: string; country?: string; phone?: string }) => {
    try {
      const token = localStorage.getItem('nextrade_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data)
      });
      const result = await parseJsonSafe(res);
      if (res.ok && result?.success) {
        if (user && result.user) {
          const updated = { ...user, ...result.user };
          saveUserState(updated);
        }
        return { success: true, message: result.message };
      }
      return { success: false, message: result?.message || 'Failed to update profile.' };
    } catch (err) {
      return { success: false, message: 'Network error updating profile.' };
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      const token = localStorage.getItem('nextrade_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data)
      });
      const result = await parseJsonSafe(res);
      return { success: res.ok && !!result?.success, message: result?.message || 'Error updating password.' };
    } catch (err) {
      return { success: false, message: 'Network error updating password.' };
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isStaffOrAdmin = !!user && user.role !== 'USER';

  const hasPermission = useCallback((category: PermissionCategory): boolean => {
    if (!user || user.role === 'USER') return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(category);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isStaffOrAdmin,
        hasPermission,
        serverTradingAccounts,
        bdtRate,
        platformSettings,
        refreshPlatformSettings,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        changePassword,
        submitKyc
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


