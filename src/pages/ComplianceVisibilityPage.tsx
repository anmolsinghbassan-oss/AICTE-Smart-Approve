import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  ShieldCheck,
  Zap,
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
  Cell
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Institution } from '../types';

export const ComplianceVisibilityPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role !== 'Institution User';

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>(
    !isAdmin && user?.institutionId ? user.institutionId : '1-6079889766'
  );
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const insts = await api.getInstitutions();
        setInstitutions(insts);
        const targetId = !isAdmin && user?.institutionId ? user.institutionId : selectedInstId;
        const matched = insts.find((i: Institution) => i.id === targetId);
        setSelectedInst(matched || insts[0]);
        if (targetId !== selectedInstId) {
          setSelectedInstId(targetId);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [selectedInstId, user]);

  // Waterfall / Contribution Breakdown for selected institution
  const scoreBreakdown = selectedInst?.complianceScore === 68 ? [
    { category: 'Instructional Space', clause: 'APH Clause 8.3', weight: 20, earned: 20, status: 'Passed', evidence: '4.9 m²/student certified' },
    { category: 'Divyangjan Ramp & Lifts', clause: 'APH Clause 9.1', weight: 15, earned: 15, status: 'Passed', evidence: 'Wheelchair access verified' },
    { category: 'Mandatory Disclosure', clause: 'APH Clause 3.1', weight: 15, earned: 15, status: 'Passed', evidence: 'Annual report on homepage' },
    { category: 'Digital Library & NDLI', clause: 'APH Clause 6.4', weight: 12, earned: 12, status: 'Passed', evidence: '16 IEEE/Springer subscriptions' },
    { category: 'Fire & Safety NOC', clause: 'APH Clause 4.2', weight: 15, earned: 4, status: 'Warning', evidence: 'Municipal NOC expiring in 18 days (-11 pts)' },
    { category: 'Faculty Cadre Ratio', clause: 'APH Clause 7.1', weight: 23, earned: 2, status: 'Deficient', evidence: 'FSR 1:24.7 & Ghost Faculty Flag (-21 pts)' }
  ] : [
    { category: 'Faculty Student Ratio', clause: 'APH Clause 7.1', weight: 25, earned: 24, status: 'Passed', evidence: 'FSR 1:15.4 regular faculty' },
    { category: 'Built-Up Space', clause: 'APH Clause 8.3', weight: 20, earned: 20, status: 'Passed', evidence: '45,000 sq.m verified plan' },
    { category: 'Fire NOC Clearance', clause: 'APH Clause 4.2', weight: 20, earned: 20, status: 'Passed', evidence: 'Valid till 31-Mar-2027' },
    { category: 'Divyangjan Facilities', clause: 'APH Clause 9.1', weight: 15, earned: 15, status: 'Passed', evidence: 'Full barrier-free campus' },
    { category: 'Mandatory Disclosure', clause: 'APH Clause 3.1', weight: 10, earned: 10, status: 'Passed', evidence: 'Current 2026 update published' },
    { category: 'Digital Library / NDLI', clause: 'APH Clause 6.4', weight: 10, earned: 7, status: 'Passed', evidence: 'DELNET active subscription' }
  ];

  // Ranked "What to Fix First" Priority Actions
  const rankedFixes = selectedInst?.complianceScore === 68 ? [
    {
      rank: 1,
      title: 'Submit Dr. Ramesh Verma Faculty Relieving Deed',
      rule: 'APH 2026 Clause 7.1',
      scoreImpact: '+14 Points Immediate Gain',
      action: 'Upload relieving certificate in Approval Process module to clear ghost faculty flag.',
      difficulty: 'Low (1 Day)'
    },
    {
      rank: 2,
      title: 'Upload Municipal Fire NOC Renewal Acknowledgement',
      rule: 'APH 2026 Clause 4.2',
      scoreImpact: '+10 Points Immediate Gain',
      action: 'Upload municipal receipt before 14-Nov-2026 hard cutoff to prevent show-cause notice.',
      difficulty: 'Medium (3 Days)'
    },
    {
      rank: 3,
      title: 'Release Open Recruitment for 2 Assistant Professors',
      rule: 'APH 2026 Clause 7.4',
      scoreImpact: '+8 Points Long-Term Gain',
      action: 'Restores cadre ratio to 1:20 ahead of proposed Civil Engineering intake expansion.',
      difficulty: 'High (30 Days)'
    }
  ] : [
    {
      rank: 1,
      title: 'Renew IEEE E-Journal Package Subscription via DELNET',
      rule: 'APH 2026 Clause 6.4',
      scoreImpact: '+3 Points Gain',
      action: 'Sync consortia subscription receipt before annual audit.',
      difficulty: 'Low (1 Day)'
    }
  ];

  const score = selectedInst?.complianceScore || 85;
  const ragStatus = score >= 85 ? 'Green (Optimal)' : score >= 70 ? 'Amber (Action Needed)' : 'Red (Critical Non-Compliance)';

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-aicte-100 text-aicte-800 dark:bg-aicte-950 dark:text-saffron-300">
              Module 6: Explainable AI & Transparency
            </span>
            <span className="text-xs text-slate-400">Zero Black-Box Statutory Scoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Explainable Compliance Score & Priority Remediation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Understand exactly why a score was awarded, backed by handbook clauses, supporting evidence, and ranked fixes.
          </p>
        </div>

        {/* Institution Selector */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <select
              value={selectedInstId}
              onChange={e => setSelectedInstId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-semibold max-w-xs shadow-xs"
            >
              {institutions.map(i => (
                <option key={i.id} value={i.id}>
                  {i.code} - {i.name} ({i.complianceScore} pts)
                </option>
              ))}
            </select>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 font-medium">
              <strong>{selectedInst?.name || user?.name}</strong>
              <span className="text-[11px] block text-slate-500 dark:text-slate-400">AICTE ID: {selectedInst?.id || user?.institutionId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Score Hero Card */}
      {selectedInst && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Circular Score Gauge */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={`${score >= 85 ? 'text-emerald-500' : score >= 70 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000`}
                  strokeWidth="8"
                  strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{score}</span>
                <span className="text-[10px] font-bold text-slate-400">OUT OF 100</span>
              </div>
            </div>

            <div className="mt-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  score >= 85
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : score >= 70
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {ragStatus}
              </span>
            </div>
          </div>

          {/* Institution Context & Summary */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-aicte-600 dark:text-saffron-400 font-bold">
                {selectedInst.id}
              </span>
              <span className="text-xs text-slate-400">{selectedInst.state} • {selectedInst.discipline}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {selectedInst.name}
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {score >= 85
                ? 'This institution demonstrates exemplary statutory compliance across faculty cadre requirements, instructional infrastructure carpet area, and municipal fire safety certifications.'
                : 'This institution has critical compliance deductions caused by a ghost faculty collision and an imminent municipal Fire NOC expiry. Completing the top 2 ranked remediation steps will restore the institution score to 92/100 (Optimal).'}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold">
                Approved Intake: {selectedInst.intakeApproved} Seats
              </span>
              <span className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold">
                Regular Faculty: {selectedInst.totalFaculty}
              </span>
              <span className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold">
                Instructional Area: {selectedInst.builtUpAreaSqM} sq.m
              </span>
            </div>
          </div>
        </div>
      )}

      {/* "Why This Score?" Panel (Waterfall Breakdown) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-aicte-600" />
            <span>"Why This Score?" — Transparent Factor Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500">
            Every point gained or deducted is linked to the exact Approval Process Handbook (APH) clause and digital evidence.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border rounded-2xl overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b">
              <tr>
                <th className="p-3">Statutory Category</th>
                <th className="p-3">APH Clause</th>
                <th className="p-3">Max Weight</th>
                <th className="p-3">Points Awarded</th>
                <th className="p-3">Evidence / Reason</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {scoreBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{row.category}</td>
                  <td className="p-3 font-mono text-aicte-600 dark:text-saffron-400 font-bold">{row.clause}</td>
                  <td className="p-3 text-slate-500">{row.weight} pts</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{row.earned} pts</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{row.evidence}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        row.status === 'Passed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : row.status === 'Warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* "What To Fix First" Priority Remediation */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>"What to Fix First" — Ranked Prescriptive Actions</span>
          </h3>
          <p className="text-xs text-slate-500">
            Algorithmically ordered by score improvement velocity and statutory urgency.
          </p>
        </div>

        <div className="space-y-3">
          {rankedFixes.map(fix => (
            <div
              key={fix.rank}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-aicte-600 text-white font-black flex items-center justify-center shrink-0">
                  #{fix.rank}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {fix.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Governing Rule: {fix.rule}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {fix.action}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold block">
                  {fix.scoreImpact}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Estimated Effort: {fix.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
