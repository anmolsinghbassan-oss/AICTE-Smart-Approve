import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  GitBranch,
  ShieldCheck,
  BellRing,
  Database,
  BarChart3,
  AlertTriangle,
  FileCheck2,
  CalendarCheck,
  UserCheck,
  Sliders,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LeftSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role !== 'Institution User';

  // Admin sees official AICTE oversight features
  const adminNavItems = [
    {
      id: 'dashboard',
      to: '/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'approval-process',
      to: '/approval-process',
      label: t('nav.approvalProcess'),
      icon: GitBranch,
      badge: 'Live SLA'
    },
    {
      id: 'compliance-checking',
      to: '/compliance-checking',
      label: t('nav.complianceChecking'),
      icon: ShieldCheck,
      badge: null
    },
    {
      id: 'alerts',
      to: '/alerts',
      label: t('nav.alertsReminders'),
      icon: BellRing,
      badge: 'Escalations'
    },
    {
      id: 'data-silos',
      to: '/data-silos',
      label: t('nav.dataSilos'),
      icon: Database,
      badge: 'Registry'
    },
    {
      id: 'compliance-visibility',
      to: '/compliance-visibility',
      label: t('nav.complianceVisibility'),
      icon: BarChart3,
      badge: 'Explainable'
    },
    {
      id: 'early-warning',
      to: '/early-warning',
      label: t('nav.earlyWarning'),
      icon: AlertTriangle,
      badge: 'Predictive'
    },
    {
      id: 'document-verification',
      to: '/document-verification',
      label: t('nav.docVerification'),
      icon: FileCheck2,
      badge: 'OCR & Fraud'
    },
    {
      id: 'inspections',
      to: '/inspections',
      label: t('nav.inspections'),
      icon: CalendarCheck,
      badge: null
    },
    {
      id: 'officer-accountability',
      to: '/officer-accountability',
      label: t('nav.accountability'),
      icon: UserCheck,
      badge: 'Admin'
    },
    {
      id: 'policy-simulator',
      to: '/policy-simulator',
      label: t('nav.policyBuilder'),
      icon: Sliders,
      badge: 'What-If'
    },
    {
      id: 'public-verification',
      to: '/public-verification',
      label: t('nav.publicPortal'),
      icon: QrCode,
      badge: 'Public QR'
    }
  ];

  // Institution sees strictly its own college private tools
  const institutionNavItems = [
    {
      id: 'institute-dashboard',
      to: '/institute/dashboard',
      label: t('nav.instituteDashboard') || 'My College Dashboard',
      icon: LayoutDashboard,
      badge: 'My College'
    },
    {
      id: 'approval-process',
      to: '/approval-process',
      label: t('nav.approvalProcess'),
      icon: GitBranch,
      badge: 'My Status'
    },
    {
      id: 'compliance-checking',
      to: '/compliance-checking',
      label: t('nav.complianceChecking'),
      icon: ShieldCheck,
      badge: 'My Rules'
    },
    {
      id: 'alerts',
      to: '/alerts',
      label: t('nav.alertsReminders'),
      icon: BellRing,
      badge: 'My Alerts'
    },
    {
      id: 'compliance-visibility',
      to: '/compliance-visibility',
      label: t('nav.complianceVisibility'),
      icon: BarChart3,
      badge: 'My Score'
    },
    {
      id: 'public-verification',
      to: '/public-verification',
      label: t('nav.publicPortal'),
      icon: QrCode,
      badge: 'Public QR'
    }
  ];

  const visibleItems = isAdmin ? adminNavItems : institutionNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between shadow-xs ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-aicte-600 text-white shadow-gov-md font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-aicte-600 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-saffron-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-aicte-600 dark:group-hover:text-aicte-400'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1 tracking-tight">
                        {item.label}
                      </span>
                    )}

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-tight uppercase ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badge === 'Admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                            : 'bg-aicte-100 text-aicte-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip on collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info & Collapse Toggle */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          {!collapsed && (
            <div className="mb-2 px-2 py-1.5 rounded-lg bg-aicte-50 dark:bg-aicte-950/40 border border-aicte-100 dark:border-aicte-900 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span className="truncate font-medium">
                {isAdmin ? '🏛️ Official Portal' : '🎓 Institution Mode'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}

          {/* Collapse / Expand Button (Desktop Only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition text-xs"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px] font-medium">Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
