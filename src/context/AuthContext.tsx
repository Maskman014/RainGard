import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loginAsDemoUser: (demoKey: 'ramesh' | 'lakshmi' | 'priya') => Promise<void>;
  registerProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_PROFILES: Record<string, UserProfile> = {
  ramesh: {
    uid: 'demo-worker-ramesh-101',
    name: 'Ramesh Kumar',
    phone: '+91 98480 23145',
    zoneId: 'hyd-charminar',
    zoneName: 'Charminar Heritage Bazaar',
    dailyWage: 750,
    trade: 'Fresh Fruit & Seasonal Produce Cart',
    language: 'te',
    role: 'worker',
    walletBalance: 1450,
    parametricCredits: 1450,
    daysProtected: 42,
    policyActive: true,
    upiId: 'ramesh.fruits@upi',
    createdAt: new Date(Date.now() - 3600000 * 24 * 42).toISOString(),
  },
  lakshmi: {
    uid: 'demo-worker-lakshmi-102',
    name: 'Lakshmi Devi',
    phone: '+91 99890 87412',
    zoneId: 'hyd-koti',
    zoneName: 'Koti Sultan Bazaar',
    dailyWage: 600,
    trade: 'Marigold & Jasmine Garland Stall',
    language: 'te',
    role: 'worker',
    walletBalance: 980,
    parametricCredits: 980,
    daysProtected: 30,
    policyActive: true,
    upiId: 'lakshmi.flowers@oksbi',
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  priya: {
    uid: 'demo-admin-priya-201',
    name: 'Priya Sharma',
    phone: '+91 94401 55678',
    zoneId: 'hyd-charminar',
    zoneName: 'Charminar Heritage Bazaar',
    dailyWage: 1200,
    trade: 'Urban Micro-Insurance Coordinator',
    language: 'en',
    role: 'admin',
    walletBalance: 0,
    parametricCredits: 0,
    daysProtected: 120,
    policyActive: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 120).toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Check cached demo or user profile
    const cached = localStorage.getItem('rainguard_active_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        localStorage.removeItem('rainguard_active_user');
      }
    }
    return null;
  });

  const loginAsDemoUser = async (demoKey: 'ramesh' | 'lakshmi' | 'priya') => {
    const demo = DEMO_PROFILES[demoKey];
    setUser(demo);
    localStorage.setItem('rainguard_active_user', JSON.stringify(demo));
  };

  const registerProfile = async (data: Partial<UserProfile>) => {
    const newUid = 'worker-' + Date.now().toString().slice(-6);
    const profile: UserProfile = {
      uid: newUid,
      name: data.name || 'Vendor',
      phone: data.phone || '+91 90000 00000',
      zoneId: data.zoneId || 'hyd-charminar',
      zoneName: data.zoneName || 'Charminar Heritage Bazaar',
      dailyWage: data.dailyWage || 650,
      trade: data.trade || 'Street Vendor',
      language: data.language || 'en',
      role: data.role || 'worker',
      walletBalance: 0,
      daysProtected: 1,
      policyActive: true,
      upiId: data.upiId || '',
      createdAt: new Date().toISOString(),
    };
    setUser(profile);
    localStorage.setItem('rainguard_active_user', JSON.stringify(profile));
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('rainguard_active_user', JSON.stringify(updated));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('rainguard_active_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsDemoUser,
        registerProfile,
        updateProfile,
        signOut,
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
