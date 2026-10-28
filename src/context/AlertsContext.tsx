import React, { createContext, useContext, useState, useEffect } from 'react';
import { AlertItem } from '../types';
import { api } from '../services/api';

interface AlertsContextType {
  alerts: AlertItem[];
  unreadCount: number;
  activeToast: AlertItem | null;
  closeToast: () => void;
  acknowledgeAlert: (id: string) => Promise<void>;
  snoozeAlert: (id: string, days?: number) => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeToast, setActiveToast] = useState<AlertItem | null>(null);

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);

      // Trigger a toast for the first critical alert if not seen
      const criticalNew = data.find((a: AlertItem) => a.priority === 'Critical' && a.status === 'New');
      if (criticalNew && !activeToast) {
        setActiveToast(criticalNew);
      }
    } catch (e) {
      console.warn('Could not fetch alerts:', e);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // Poll every 15s for live simulation
    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = async (id: string) => {
    try {
      await api.acknowledgeAlert(id, 'Current Authorized Officer');
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Acknowledged' } : a));
      if (activeToast?.id === id) setActiveToast(null);
    } catch (e) {
      console.error(e);
    }
  };

  const snoozeAlert = async (id: string, days: number = 3) => {
    try {
      await api.snoozeAlert(id, days);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Acknowledged' } : a));
      if (activeToast?.id === id) setActiveToast(null);
    } catch (e) {
      console.error(e);
    }
  };

  const closeToast = () => setActiveToast(null);

  const unreadCount = alerts.filter(a => a.status === 'New').length;

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        unreadCount,
        activeToast,
        closeToast,
        acknowledgeAlert,
        snoozeAlert,
        refreshAlerts: fetchAlerts
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) throw new Error('useAlerts must be used within an AlertsProvider');
  return context;
};
