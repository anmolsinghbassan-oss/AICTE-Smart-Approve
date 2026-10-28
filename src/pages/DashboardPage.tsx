import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Award
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Institution } from '../types';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role !== 'Institution User';

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('');
  const [searchedInstGraph, setSearchedInstGraph] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('All');
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState('All');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
      const insts = await api.getInstitutions();
      setInstitutions(insts);

      // If user is institution user, preselect their institute
      if (!isAdmin && user?.institutionId) {
        setSelectedInstId(user.institutionId);
        const graph = await api.getInstituteGraph(user.institutionId);
        setSearchedInstGraph(graph);
      } else if (insts.length > 0) {
        // Pre-load COEP Pune as default searched institute for immediate rich visual
        const defaultId = '1-1029384711';
        setSelectedInstId(defaultId);
        const graph = await api.getInstituteGraph(defaultId);
        setSearchedInstGraph(graph);
      }
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const handleSelectInstitute = async (id: string) => {
    setSelectedInstId(id);
    if (!id) {
      setSearchedInstGraph(null);
      return;
    }
    try {
      const graph = await api.getInstituteGraph(id);
      setSearchedInstGraph(graph);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  const kpis = stats.kpis;

  // Filtered institutions for search dropdown
  const filteredInstitutions = institutions.filter(i => {
    const matchesQuery = i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedStateFilter === 'All' || i.state === selectedStateFilter;
    const matchesDiscipline = selectedDisciplineFilter === 'All' || i.discipline === selectedDisciplineFilter;
    return matchesQuery && matchesState && matchesDiscipline;
  });

  return (
    <div className="space-y-8">
      {/* Dashboard Header with Mode Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-aicte-100 text-aicte-800 dark:bg-aicte-950 dark:text-saffron-300 border border-aicte-200 dark:border-aicte-800">
              {isAdmin ? `🏛️ Officer Command: ${user?.role}` : '🎓 Registered College Portal'}
            </span>
            <span className="text-xs text-slate-400">Academic Year 2026-27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Global Controls & Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-aicte-600" />
            <span>{t('common.refresh')}</span>
          </button>
        </div>
      </div>

      {/* --- INSTITUTION SPECIFIC VIEW (when logged in as College User) --- */}
      {!isAdmin && searchedInstGraph && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-aicte-600 via-aicte-700 to-[#12213D] text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-saffron-400">
                Official College Compliance Dashboard
              </span>
              <h2 className="text-xl font-bold mt-0.5">
                {searchedInstGraph.institution.name}
              </h2>
              <p className="text-xs text-slate-300">
                AICTE Permanent ID: <span className="font-mono font-bold text-amber-300">{searchedInstGraph.institution.id}</span> | State: {searchedInstGraph.institution.state}
              </p>
            </div>

            {/* Score Badge Gauge */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Current Health Score</span>
                <span className={`text-2xl font-black ${searchedInstGraph.institution.complianceScore >= 85 ? 'text-emerald-400' : searchedInstGraph.institution.complianceScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                  {searchedInstGraph.institution.complianceScore} / 100
                </span>
              </div>
              <div className={`w-3 h-10 rounded-full ${searchedInstGraph.institution.complianceScore >= 85 ? 'bg-emerald-400' : searchedInstGraph.institution.complianceScore >= 70 ? 'bg-amber-400' : 'bg-red-500'}`} />
            </div>
          </div>

          {/* Quick tracker cards for college */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-slate-300 block">Active Application</span>
              <span className="font-bold text-amber-300 block mt-0.5">
                {searchedInstGraph.activeApplication ? searchedInstGraph.activeApplication.applicationType : 'Extension of Approval'}
              </span>
              <span className="text-[10px] text-slate-200">
                Stage: {searchedInstGraph.activeApplication ? searchedInstGraph.activeApplication.stage : 'Submitted'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-slate-300 block">SLA Countdown</span>
              <span className="font-bold text-emerald-300 block mt-0.5">
                {searchedInstGraph.activeApplication?.slaDaysRemaining !== undefined ? `${searchedInstGraph.activeApplication.slaDaysRemaining} Days Remaining` : '14 Days Remaining'}
              </span>
              <span className="text-[10px] text-slate-200">Standard 21-Day Window</span>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-slate-300 block">Faculty Cadre Ratio</span>
              <span className="font-bold block mt-0.5 text-white">
                1 : {(searchedInstGraph.institution.totalStudents / searchedInstGraph.institution.totalFaculty).toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-200">Target 1:20 (APH Clause 7.1)</span>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] text-slate-300 block">Fire NOC Status</span>
              <span className="font-bold block mt-0.5 text-white">
                Valid till {searchedInstGraph.institution.fireNocValidTill}
              </span>
              <span className="text-[10px] text-slate-200">Municipal Fire Division</span>
            </div>
          </div>
        </div>
      )}

      {/* --- 8 KPI CARDS (ADMIN & OVERVIEW) --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <FileText className="w-4 h-4 text-aicte-600 dark:text-aicte-400" />
            <span className="text-[10px] font-bold text-slate-400">Total</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{kpis.totalApplications}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('dashboard.totalApplications')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold text-amber-500">In Review</span>
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{kpis.pending}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('dashboard.pending')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500">Issued</span>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{kpis.approved}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('dashboard.approved')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <div className="flex items-center justify-between text-rose-500 mb-2">
            <XCircle className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-bold text-rose-500">Deficient</span>
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">{kpis.rejected}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('dashboard.rejected')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <div className="flex items-center justify-between text-govteal-500 mb-2">
            <TrendingUp className="w-4 h-4 text-govteal-600" />
            <span className="text-[10px] font-bold text-govteal-600">Avg SLA</span>
          </div>
          <div className="text-xl font-black text-govteal-600 dark:text-govteal-400">{kpis.avgTurnaroundDays}d</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('dashboard.avgTurnaround')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <div className="flex items-center justify-between text-red-500 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-bold text-red-500">Breach</span>
          </div>
          <div className="text-xl font-black text-red-600 dark:text-red-400">{kpis.overdueSla}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('dashboard.overdueSla')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <div className="flex items-center justify-between text-saffron-500 mb-2">
            <Flame className="w-4 h-4 text-saffron-500" />
            <span className="text-[10px] font-bold text-saffron-500">High Risk</span>
          </div>
          <div className="text-xl font-black text-saffron-600 dark:text-saffron-400">{kpis.highRiskInstitutes}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('dashboard.highRiskInstitutes')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <div className="flex items-center justify-between text-purple-500 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-bold text-purple-500">Active</span>
          </div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400">{kpis.alertsToday}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('dashboard.alertsToday')}</span>
        </div>
      </div>

      {/* --- INSTITUTE SEARCH & APPLICATION GRAPH MODAL/PANEL --- */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-aicte-600" />
              <span>{t('dashboard.searchGraphTitle')}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {t('dashboard.searchGraphDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedInstId}
              onChange={e => handleSelectInstitute(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-aicte-500 outline-none max-w-xs"
            >
              <option value="">-- Select Technical Institution ({institutions.length} seeded) --</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.code} - {inst.name} ({inst.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchedInstGraph && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* College Overview snippet */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-aicte-100 text-aicte-800 dark:bg-aicte-950 dark:text-saffron-300">
                    {searchedInstGraph.institution.type}
                  </span>
                  <span className={`text-xs font-bold ${searchedInstGraph.institution.complianceScore >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    Score: {searchedInstGraph.institution.complianceScore}/100
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {searchedInstGraph.institution.name}
                </h4>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div>ID: <span className="font-mono font-semibold">{searchedInstGraph.institution.id}</span></div>
                  <div>Discipline: {searchedInstGraph.institution.discipline}</div>
                  <div>Approved Intake: {searchedInstGraph.institution.intakeApproved} Seats</div>
                  <div>Fire NOC: Valid till {searchedInstGraph.institution.fireNocValidTill}</div>
                </div>
              </div>

              {/* Status Breakdown Donut */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('dashboard.statusBreakdown')}
                </span>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Approved', value: searchedInstGraph.statusCounts.Approved || 1, color: '#10B981' },
                          { name: 'In Review', value: searchedInstGraph.statusCounts.InReview || 1, color: '#3B82F6' },
                          { name: 'Deficiency', value: searchedInstGraph.statusCounts.Deficiency || 0, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#3B82F6" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Score Trend Line */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Compliance Score Trend (4 Years)
                </span>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={searchedInstGraph.scoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#1F3864" strokeWidth={2.5} dot={{ r: 4, fill: '#FF9933' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- CHARTS ROW 1: APPLICATIONS BY STAGE & APPROVALS TREND --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Stage */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('dashboard.applicationsByStage')}
              </h3>
              <p className="text-[11px] text-slate-500">Live distribution across statutory processing stages</p>
            </div>
            <span className="text-xs font-semibold text-aicte-600 bg-aicte-50 dark:bg-aicte-950 px-2 py-1 rounded-lg">
              60 Applications
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.applicationsByStage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F3864', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#1F3864" radius={[6, 6, 0, 0]}>
                  {stats.applicationsByStage.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.stage === 'Decision' ? '#10B981' : entry.stage === 'Scrutiny' ? '#F59E0B' : '#1F3864'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approvals Trend by Month */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('dashboard.approvalsTrend')}
              </h3>
              <p className="text-[11px] text-slate-500">Monthly progression of received, cleared, and deficient cases</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg">
              +14% SLA Velocity
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.approvalsTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F3864', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="received" stroke="#3B82F6" strokeWidth={2} name="Received" />
                <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2.5} name="Approved" />
                <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} name="Deficient" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- CHARTS ROW 2: SCORE DISTRIBUTION & STATE-WISE PENDING --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Score Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('dashboard.scoreDistribution')}
              </h3>
              <p className="text-[11px] text-slate-500">Institutions grouped by statutory health rating</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              26 Sample Colleges
            </span>
          </div>

          <div className="h-64 flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.scoreBuckets}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {stats.scoreBuckets.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 text-xs">
              {stats.scoreBuckets.map((bucket: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: bucket.fill }} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">{bucket.range}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{bucket.count} inst</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* State-wise Pending and Approvals */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('dashboard.stateHeatmap')}
              </h3>
              <p className="text-[11px] text-slate-500">Pending scrutiny vs cleared EoA approvals by State</p>
            </div>
            <span className="text-xs font-semibold text-aicte-600 bg-aicte-50 dark:bg-aicte-950 px-2 py-1 rounded-lg">
              Top 8 States
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.stateStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="state" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F3864', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="approved" fill="#10B981" name="Approved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#FF9933" name="Pending Scrutiny" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- BOTTLENECK DURATION & STAGE DIAGNOSTICS --- */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{t('dashboard.bottleneck')}</span>
            </h3>
            <p className="text-[11px] text-slate-500">Average days spent per statutory stage versus official AICTE SLA targets</p>
          </div>
          <span className="text-[11px] text-slate-400">Total Statutory Window: 21 Days</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {stats.bottleneck.map((b: any, idx: number) => {
            const isExceeded = b.avgDays > b.targetSla;
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                  isExceeded
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-500 block truncate">{b.stage}</span>
                <div className="flex items-baseline justify-between">
                  <span className={`text-lg font-black ${isExceeded ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                    {b.avgDays}d
                  </span>
                  <span className="text-[10px] text-slate-400">Target: {b.targetSla}d</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${isExceeded ? 'bg-amber-500' : 'bg-aicte-600'}`}
                    style={{ width: `${Math.min(100, (b.avgDays / b.targetSla) * 75)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- RECENT ACTIVITY & UPCOMING DEADLINES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-aicte-600" />
              <span>{t('dashboard.recentActivity')}</span>
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-3">
            {stats.recentActivity.map((act: any) => (
              <div
                key={act.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{act.title}</h4>
                  <p className="text-[11px] text-slate-500">{act.college}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>{t('dashboard.upcomingDeadlines')}</span>
            </h3>
            <span className="text-[11px] font-semibold text-red-500">Strict Statutory Cutoffs</span>
          </div>

          <div className="space-y-3">
            {stats.upcomingDeadlines.map((dl: any) => (
              <div
                key={dl.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{dl.title}</h4>
                  <p className="text-[11px] text-slate-500">{dl.target}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-red-600 dark:text-red-400 text-xs block">
                    {dl.daysLeft} days left
                  </span>
                  <span className="text-[10px] text-slate-400">{dl.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
