import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Award,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';

export const OfficerAccountabilityPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAccountabilityStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div className="p-8 text-center text-slate-400">Loading Officer Accountability Metrics...</div>;
  }

  // Workload and Turnaround Chart Data
  const officerChartData = stats.officers.map((o: any) => ({
    name: o.name.split(' ')[1] || o.name,
    assigned: o.assignedCount,
    resolved: o.resolvedCount,
    avgDays: o.avgTurnaroundDays,
    overdue: o.overdueCount
  }));

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Module 10: Administrative Accountability (AICTE Officer View)
            </span>
            <span className="text-xs text-slate-400">Citizen Charter Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Officer Turnaround Accountability & Regional Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time stage-wise processing time tracking, SLA compliance ranking, and regional workload distribution.
          </p>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <span className="text-slate-500 block">Total Statutory Filings Handled</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalCasesHandled}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">AY 2026-27 Active Cycle</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <span className="text-slate-500 block">National Average Turnaround</span>
          <div className="text-2xl font-black text-govteal-600 dark:text-govteal-400 mt-1">{stats.overallAvgTurnaround} Days</div>
          <span className="text-[10px] text-slate-400">Citizen Charter Limit: 21 Days</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <span className="text-slate-500 block">Total SLA Breaches</span>
          <div className="text-2xl font-black text-red-500 mt-1">{stats.overdueCases} Cases</div>
          <span className="text-[10px] text-red-400">Escalated to Member Secretary</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov">
          <span className="text-slate-500 block">Officer Performance Index</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">94.8%</div>
          <span className="text-[10px] text-emerald-500">Exemplary Statutory Discipline</span>
        </div>
      </div>

      {/* Charts: Turnaround Days by Officer & Workload Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnaround Days per Officer */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Average Turnaround Time by Scrutiny Officer (Days)
            </h3>
            <span className="text-xs text-slate-400">Lower is better</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={officerChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F3864', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="avgDays" fill="#1F3864" name="Avg Processing Days" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Resolution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Assigned Workload vs Cleared Cases
            </h3>
            <span className="text-xs text-emerald-600 font-semibold">91.4% Clearance Rate</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={officerChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F3864', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="assigned" fill="#3B82F6" name="Assigned Cases" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved / EoA Issued" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Officer Leaderboard Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Statutory Officer Performance & SLA Leaderboard</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Officer Name</th>
                <th className="p-3">Designation / Region</th>
                <th className="p-3">Assigned Cases</th>
                <th className="p-3">Resolved</th>
                <th className="p-3">Avg Turnaround</th>
                <th className="p-3">Overdue Count</th>
                <th className="p-3">Quality Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.officers.map((off: any, idx: number) => (
                <tr key={off.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-black text-slate-400">#{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{off.name}</td>
                  <td className="p-3 text-slate-500">{off.role} • {off.region}</td>
                  <td className="p-3 font-semibold">{off.assignedCount}</td>
                  <td className="p-3 font-bold text-emerald-600">{off.resolvedCount}</td>
                  <td className="p-3 font-mono font-bold text-aicte-600 dark:text-saffron-400">{off.avgTurnaroundDays} Days</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${off.overdueCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {off.overdueCount} Overdue
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{off.satisfactionScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
