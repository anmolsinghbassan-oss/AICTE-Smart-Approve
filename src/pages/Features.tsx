import React from 'react';
import { Link } from 'react-router-dom';
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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Features: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role !== 'Institution User';

  const modules = [
    {
      id: 'dashboard',
      to: isAdmin ? '/dashboard' : '/institute/dashboard',
      titleKey: isAdmin ? 'featuresPage.modules.dashboard.title' : 'nav.instituteDashboard',
      descKey: 'featuresPage.modules.dashboard.desc',
      badgeKey: 'featuresPage.modules.dashboard.badge',
      icon: LayoutDashboard,
      adminOnly: false
    },
    {
      id: 'approval-process',
      to: '/approval-process',
      titleKey: 'featuresPage.modules.approvalProcess.title',
      descKey: 'featuresPage.modules.approvalProcess.desc',
      badgeKey: 'featuresPage.modules.approvalProcess.badge',
      icon: GitBranch,
      adminOnly: false
    },
    {
      id: 'compliance-checking',
      to: '/compliance-checking',
      titleKey: 'featuresPage.modules.complianceChecking.title',
      descKey: 'featuresPage.modules.complianceChecking.desc',
      badgeKey: 'featuresPage.modules.complianceChecking.badge',
      icon: ShieldCheck,
      adminOnly: false
    },
    {
      id: 'alerts',
      to: '/alerts',
      titleKey: 'featuresPage.modules.alerts.title',
      descKey: 'featuresPage.modules.alerts.desc',
      badgeKey: 'featuresPage.modules.alerts.badge',
      icon: BellRing,
      adminOnly: false
    },
    {
      id: 'data-silos',
      to: '/data-silos',
      titleKey: 'featuresPage.modules.dataSilos.title',
      descKey: 'featuresPage.modules.dataSilos.desc',
      badgeKey: 'featuresPage.modules.dataSilos.badge',
      icon: Database,
      adminOnly: true
    },
    {
      id: 'compliance-visibility',
      to: '/compliance-visibility',
      titleKey: 'featuresPage.modules.complianceVisibility.title',
      descKey: 'featuresPage.modules.complianceVisibility.desc',
      badgeKey: 'featuresPage.modules.complianceVisibility.badge',
      icon: BarChart3,
      adminOnly: false
    },
    {
      id: 'early-warning',
      to: '/early-warning',
      titleKey: 'featuresPage.modules.earlyWarning.title',
      descKey: 'featuresPage.modules.earlyWarning.desc',
      badgeKey: 'featuresPage.modules.earlyWarning.badge',
      icon: AlertTriangle,
      adminOnly: true
    },
    {
      id: 'document-verification',
      to: '/document-verification',
      titleKey: 'featuresPage.modules.docVerification.title',
      descKey: 'featuresPage.modules.docVerification.desc',
      badgeKey: 'featuresPage.modules.docVerification.badge',
      icon: FileCheck2,
      adminOnly: true
    },
    {
      id: 'inspections',
      to: '/inspections',
      titleKey: 'featuresPage.modules.inspections.title',
      descKey: 'featuresPage.modules.inspections.desc',
      badgeKey: 'featuresPage.modules.inspections.badge',
      icon: CalendarCheck,
      adminOnly: true
    },
    {
      id: 'officer-accountability',
      to: '/officer-accountability',
      titleKey: 'featuresPage.modules.accountability.title',
      descKey: 'featuresPage.modules.accountability.desc',
      badgeKey: 'featuresPage.modules.accountability.badge',
      icon: UserCheck,
      adminOnly: true
    },
    {
      id: 'policy-simulator',
      to: '/policy-simulator',
      titleKey: 'featuresPage.modules.policyBuilder.title',
      descKey: 'featuresPage.modules.policyBuilder.desc',
      badgeKey: 'featuresPage.modules.policyBuilder.badge',
      icon: Sliders,
      adminOnly: true
    },
    {
      id: 'public-verification',
      to: '/public-verification',
      titleKey: 'featuresPage.modules.publicPortal.title',
      descKey: 'featuresPage.modules.publicPortal.desc',
      badgeKey: 'featuresPage.modules.publicPortal.badge',
      icon: QrCode,
      adminOnly: false
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('featuresPage.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          {t('featuresPage.subtitle')}
        </p>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(isAdmin ? modules : modules.filter(m => !m.adminOnly)).map(mod => {
          const Icon = mod.icon;
          const isLocked = mod.adminOnly && !isAdmin;

          return (
            <div
              key={mod.id}
              className={`rounded-2xl bg-white dark:bg-slate-900 border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group ${
                isLocked
                  ? 'border-slate-200/50 dark:border-slate-800/50 opacity-75'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-[#1F3864] dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      mod.adminOnly
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                        : 'bg-blue-100 text-[#1F3864] dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {t(mod.badgeKey)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-700 transition-colors">
                  {t(mod.titleKey)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {t(mod.descKey)}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                {isLocked ? (
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    🔒 {t('featuresPage.adminBadge') || 'Restricted to Officers'}
                  </span>
                ) : (
                  <Link
                    to={mod.to}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1F3864] hover:bg-blue-800 text-white transition shadow-xs group-hover:translate-x-1"
                  >
                    <span>{t('featuresPage.openTool') || 'Open'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
