import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Zap,
  FileCheck2,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Building2,
  Lock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const stats = [
    { label: t('home.stats.instCovered'), value: '12,400+', change: t('home.stats.instCoveredSub') },
    { label: t('home.stats.paperlessSla'), value: '10.6 Days', change: t('home.stats.paperlessSlaSub') },
    { label: t('home.stats.ghostFaculty'), value: '100% Checked', change: t('home.stats.ghostFacultySub') },
    { label: t('home.stats.transparency'), value: '100% Verified', change: t('home.stats.transparencySub') },
  ];

  const highlights = [
    {
      title: t('home.highlights.workflowTitle'),
      desc: t('home.highlights.workflowDesc'),
      icon: Zap,
      color: 'from-blue-600 to-[#1F3864]'
    },
    {
      title: t('home.highlights.complianceTitle'),
      desc: t('home.highlights.complianceDesc'),
      icon: BarChart3,
      color: 'from-blue-700 to-indigo-900'
    },
    {
      title: t('home.highlights.fraudTitle'),
      desc: t('home.highlights.fraudDesc'),
      icon: ShieldCheck,
      color: 'from-blue-600 to-sky-800'
    },
    {
      title: t('home.highlights.alertsTitle'),
      desc: t('home.highlights.alertsDesc'),
      icon: AlertTriangle,
      color: 'from-amber-600 to-orange-700'
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1F3864] via-blue-900 to-[#12213D] text-white p-8 md:p-12 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 border border-white/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('home.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {t('home.heroTitle')}
          </h1>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            {t('home.heroSubtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl font-bold bg-white text-[#1F3864] hover:bg-slate-100 transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <span>{t('home.exploreDashboard')}</span>
              <ArrowRight className="w-4 h-4 text-[#1F3864]" />
            </Link>

            <Link
              to="/public-verification"
              className="px-5 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4 text-sky-300" />
              <span>{t('home.publicQrPortal')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition"
          >
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              {s.label}
            </span>
            <div className="text-2xl font-black text-[#1F3864] dark:text-white mt-1">
              {s.value}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{s.change}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Feature Highlights */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('home.highlightsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('featuresPage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((h, idx) => {
            const Icon = h.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 transition flex gap-4"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${h.color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {h.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Portal Portals Access */}
      <section className="p-6 md:p-8 rounded-3xl bg-blue-50/70 dark:bg-slate-900/80 border border-blue-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('home.quickAccessTitle')}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-[#1F3864] dark:text-blue-300 font-bold">
                Portals
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Secure dedicated access for AICTE officers, participating colleges, and public verification.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/login"
              className="px-3.5 py-2 rounded-xl bg-[#1F3864] text-white font-semibold text-xs hover:bg-blue-900 transition shadow-xs inline-flex items-center"
            >
              {t('home.quickAccessAdmin')}
            </Link>
            <Link
              to="/institute/login"
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition shadow-xs inline-flex items-center"
            >
              {t('home.quickAccessCollege')}
            </Link>
            <Link
              to="/public-verification"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-xs hover:bg-slate-50 transition shadow-xs inline-flex items-center gap-1.5"
            >
              {t('home.quickAccessPublic')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
