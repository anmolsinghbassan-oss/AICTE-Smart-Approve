import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Send,
  TrendingDown,
  ShieldAlert,
  Flame,
  CheckCircle,
  MapPin,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { Institution } from '../types';

export const EarlyWarningPage: React.FC = () => {
  const { t } = useTranslation();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [targetInstId, setTargetInstId] = useState<string>('');
  const [nudgeSuccess, setNudgeSuccess] = useState('');

  useEffect(() => {
    const fetchInsts = async () => {
      try {
        const data = await api.getInstitutions();
        // Sort by risk probability descending so the highest risk colleges are right on top
        data.sort((a: Institution, b: Institution) => b.riskProbability - a.riskProbability);
        setInstitutions(data);
        if (data.length > 0) {
          setTargetInstId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsts();
  }, []);

  const handleSendNudge = async (inst: Institution) => {
    try {
      await api.sendNudge({
        institutionId: inst.id,
        message: `Statutory Warning: AICTE Predictive Model forecasts a ${(inst.riskProbability * 100).toFixed(0)}% non-compliance probability in the next 90 days. Primary driver: ${inst.riskReasons.join(', ')}. Please upload corrective documentation immediately.`,
        priority: inst.riskLevel === 'Critical' ? 'Critical' : 'High'
      });
      setNudgeSuccess(`Statutory Nudge alert successfully issued to ${inst.name}.`);
      setTimeout(() => setNudgeSuccess(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // State Risk Aggregation for Map / Bar view
  const stateRiskMap: Record<string, { state: string; critical: number; high: number; low: number }> = {};
  institutions.forEach(i => {
    if (!stateRiskMap[i.state]) {
      stateRiskMap[i.state] = { state: i.state, critical: 0, high: 0, low: 0 };
    }
    if (i.riskLevel === 'Critical') stateRiskMap[i.state].critical++;
    else if (i.riskLevel === 'High') stateRiskMap[i.state].high++;
    else stateRiskMap[i.state].low++;
  });
  const stateRiskChartData = Object.values(stateRiskMap).slice(0, 8);

  // Predictive 6-Month Risk Trend (Mock model trajectory)
  const riskTrendData = [
    { month: 'May 2026', avgRiskScore: 18, highRiskColleges: 2 },
    { month: 'Jun 2026', avgRiskScore: 22, highRiskColleges: 3 },
    { month: 'Jul 2026', avgRiskScore: 28, highRiskColleges: 4 },
    { month: 'Aug 2026', avgRiskScore: 35, highRiskColleges: 5 },
    { month: 'Sep 2026', avgRiskScore: 41, highRiskColleges: 7 },
    { month: 'Oct 2026 (Now)', avgRiskScore: 48, highRiskColleges: 8 },
    { month: 'Nov 2026 (Forecast)', avgRiskScore: 54, highRiskColleges: 10 },
    { month: 'Dec 2026 (Forecast)', avgRiskScore: 61, highRiskColleges: 12 }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-aicte-100 text-aicte-800 dark:bg-aicte-950 dark:text-saffron-300">
              Module 7: Predictive Intelligence
            </span>
            <span className="text-xs text-slate-400">Forecasting Non-Compliance (3-6 Months Ahead)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Early Warning & Predictive Risk Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Proactively identifies colleges likely to breach statutory thresholds before formal EoA filing deadlines.
          </p>
        </div>

        {nudgeSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
            {nudgeSuccess}
          </div>
        )}
      </div>

      {/* Predictive Trend & State Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Forecast Line Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Pan-India Risk Probability Trajectory (3-6 Months)
              </h3>
              <p className="text-[11px] text-slate-500">Historical trend and upcoming forecasted risk drift</p>
            </div>
            <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">
              Predictive Alert
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F3864', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="avgRiskScore" stroke="#EF4444" strokeWidth={2.5} name="Average Risk Probability (%)" />
                <Line type="monotone" dataKey="highRiskColleges" stroke="#F59E0B" strokeWidth={2} name="Critical Risk Colleges Count" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State-wise High Risk Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                State-Wise Critical & High Risk Clusters
              </h3>
              <p className="text-[11px] text-slate-500">Institutions with non-compliance probability &gt; 50%</p>
            </div>
            <span className="text-xs font-semibold text-aicte-600">Regional Overview</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateRiskChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="state" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F3864', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="critical" fill="#EF4444" name="Critical Risk" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="high" fill="#F59E0B" name="High Risk" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Early Warning Predictive Risk Table with 1-Click Nudge Action */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>Predictive Early Warning Dossier</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by probability of statutory failure. Dispatch proactive advisory nudges to prompt corrective compliance.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b">
              <tr>
                <th className="p-3">College & ID</th>
                <th className="p-3">State</th>
                <th className="p-3">Forecasted Failure Risk</th>
                <th className="p-3">Top Risk Drivers</th>
                <th className="p-3">Recommended Action Plan</th>
                <th className="p-3">Statutory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {institutions.map(inst => {
                const probPercent = Math.round(inst.riskProbability * 100);
                return (
                  <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white block max-w-[220px] truncate">{inst.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{inst.id} ({inst.code})</span>
                    </td>
                    <td className="p-3 text-slate-500">{inst.state}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${probPercent >= 70 ? 'text-red-500' : probPercent >= 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {probPercent}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${probPercent >= 70 ? 'bg-red-500' : probPercent >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${probPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                        {inst.riskReasons.map((r, i) => (
                          <li key={i} className="truncate">{r}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3 max-w-xs text-[11px] text-slate-600 dark:text-slate-300">
                      {probPercent >= 60
                        ? 'Mandatory on-site scrutiny visit + Fire NOC expedited renewal receipt.'
                        : 'Routine self-disclosure verification on institutional web portal.'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleSendNudge(inst)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-[11px] shadow-xs transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Nudge Alert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
