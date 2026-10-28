import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  switchRole: (role: User['role']) => void;
  loginAsDemo: (type: 'super_admin' | 'ro_western' | 'inspection' | 'institution_coep' | 'institution_spce') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session
    const savedUser = localStorage.getItem('aicte_user');
    const token = localStorage.getItem('aicte_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('aicte_user');
        localStorage.removeItem('aicte_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    const res = await api.login(credentials);
    setUser(res.user);
    localStorage.setItem('aicte_user', JSON.stringify(res.user));
    localStorage.setItem('aicte_token', res.token);
  };

  const signup = async (data: any) => {
    const res = await api.register(data);
    setUser(res.user);
    localStorage.setItem('aicte_user', JSON.stringify(res.user));
    localStorage.setItem('aicte_token', res.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aicte_user');
    localStorage.removeItem('aicte_token');
  };

  const switchRole = (role: User['role']) => {
    if (!user) return;
    let updatedUser: User = { ...user, role };
    if (role === 'Institution User') {
      updatedUser = {
        id: 'INST-USER-001',
        email: 'user@college.demo',
        name: 'Dr. B. B. Ahuja (Principal/Registrar)',
        role: 'Institution User',
        institutionId: '1-1029384711',
        institutionName: 'College of Engineering, Pune (COEP Technological Univ)',
        state: 'Maharashtra',
        phone: '+91 20 2550 7000',
        accountStatus: 'Active & Verified',
        lastLogin: new Date().toISOString()
      };
    } else {
      updatedUser = {
        id: 'ADMIN-001',
        email: 'admin@aicte.demo',
        name: role === 'Regional Officer' ? 'Dr. Rajesh Sharma (RO Western)' : role === 'Inspection Team Member' ? 'Er. Priya Patel (Inspection Head)' : 'Dr. Ramesh Unnikrishnan',
        role,
        office: role === 'Regional Officer' ? 'AICTE Western Regional Office, Mumbai' : 'AICTE Headquarters, New Delhi',
        region: role === 'Regional Officer' ? 'Western Region' : 'National',
        phone: '+91 11 2958 1000',
        accountStatus: 'Active & Verified',
        lastLogin: new Date().toISOString()
      };
    }
    setUser(updatedUser);
    localStorage.setItem('aicte_user', JSON.stringify(updatedUser));
  };

  const loginAsDemo = (type: 'super_admin' | 'ro_western' | 'inspection' | 'institution_coep' | 'institution_spce') => {
    let demoUser: User;
    if (type === 'super_admin') {
      demoUser = {
        id: 'ADMIN-001',
        email: 'admin@aicte.demo',
        name: 'Dr. Ramesh Unnikrishnan',
        role: 'Super Admin',
        office: 'AICTE Headquarters, New Delhi',
        region: 'Central HQ',
        phone: '+91 11 2958 1000',
        accountStatus: 'Active & Verified',
        lastLogin: new Date().toISOString()
      };
    } else if (type === 'ro_western') {
      demoUser = {
        id: 'ADMIN-002',
        email: 'ro.western@aicte.demo',
        name: 'Dr. Rajesh Sharma',
        role: 'Regional Officer',
        office: 'AICTE Western Regional Office, Mumbai',
        region: 'Western Region',
        phone: '+91 22 2285 5412',
        accountStatus: 'Active & Verified',
        lastLogin: new Date().toISOString()
      };
    } else if (type === 'inspection') {
      demoUser = {
        id: 'ADMIN-003',
        email: 'inspection@aicte.demo',
        name: 'Er. Priya Patel',
        role: 'Inspection Team Member',
        office: 'AICTE National Quality Cell',
        region: 'National',
        phone: '+91 11 2958 1055',
        accountStatus: 'Active & Verified',
        lastLogin: new Date().toISOString()
      };
    } else if (type === 'institution_spce') {
      demoUser = {
        id: 'INST-USER-002',
        email: 'spce@college.demo',
        name: 'Dr. M. M. Murudi (Principal)',
        role: 'Institution User',
        institutionId: '1-6079889766',
        institutionName: 'Sardar Patel College of Engineering, Mumbai',
        state: 'Maharashtra',
        phone: '+91 22 2623 2164',
        accountStatus: 'Active & Verified',
        lastLogin: new Date().toISOString()
      };
    } else {
      demoUser = {
        id: 'INST-USER-001',
        email: 'user@college.demo',
        name: 'Dr. B. B. Ahuja (Principal/Registrar)',
        role: 'Institution User',
        institutionId: '1-1029384711',
        institutionName: 'College of Engineering, Pune (COEP Technological Univ)',
        state: 'Maharashtra',
        phone: '+91 20 2550 7000',
        accountStatus: 'Active & Verified',
        lastLogin: new Date().toISOString()
      };
    }

    setUser(demoUser);
    localStorage.setItem('aicte_user', JSON.stringify(demoUser));
    localStorage.setItem('aicte_token', `demo-jwt-token-${type}`);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, switchRole, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
