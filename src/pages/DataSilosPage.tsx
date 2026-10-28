import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Database,
  Building,
  GraduationCap,
  Users,
  Building2,
  CalendarCheck,
  FileCheck2,
  AlertCircle,
  TrendingUp,
  Search,
  Scale,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { Institution } from '../types';

export const DataSilosPage: React.FC = () => {
  const { t } = useTranslation();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('1-1029384711');
  const [passportData, setPassportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePassportTab, setActivePassportTab] = useState<string>('overview');

  // Compare Mode State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareId1, setCompareId1] = useState('1-1029384711'); // COEP
  const [compareId2, setCompareId2] = useState('1-6079889766'); // SPCE
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const insts = await api.getInstitutions();
        setInstitutions(insts);
        if (insts.length > 0) {
          loadPassport(selectedInstId || insts[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const loadPassport = async (id: string) => {
    setSelectedInstId(id);
    try {
      const data = await api.getInstitutionById(id);
      setPassportData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompare = async () => {
    try {
      const result = await api.compareInstitutions(compareId1, compareId2);
      setComparisonResult(result);
      setIsCompareMode(true);
    } catch (e) {
      console.error(e);
    }
  };

  const passportTabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'approvals', label: 'Approval History', icon: Layers },
    { id: 'faculty', label: 'Faculty Rolls', icon: Users },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building2 },
    { id: 'complaints', label: 'Complaints Cell', icon: AlertCircle },
    { id: 'inspections', label: 'Inspections', icon: CalendarCheck },
    { id: 'documents', label: 'Documents Repository', icon: FileCheck2 },
    { id: 'timeline', label: 'Score Timeline', icon: TrendingUp }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-aicte-100 text-aicte-800 dark:bg-aicte-950 dark:text-saffron-300">
              Module 5: Single Source of Truth
            </span>
            <span className="text-xs text-slate-400">Eliminating Fragmented Data Silos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Institution Compliance Passport (Digital Twin)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Consolidated statutory profile fed jointly by Regional Offices, Inspection Teams, Institute self-reports, and Grievance Cells.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isCompareMode) handleCompare();
              else setIsCompareMode(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-aicte-600 hover:bg-aicte-700 text-white font-bold text-xs shadow-md transition"
          >
            <Scale className="w-4 h-4 text-amber-300" />
            <span>{isCompareMode ? 'Return to Digital Passport' : 'Compare Two Institutions'}</span>
          </button>
        </div>
      </div>

      {/* --- COMPARE VIEW --- */}
      {isCompareMode && comparisonResult && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-aicte-600" />
                <span>Side-by-Side Comparative Audit</span>
              </h2>
              <p className="text-xs text-slate-500">
                Compare statutory metrics and compliance standing between two institutions simultaneously.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={compareId1}
                onChange={e => setCompareId1(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              >
                {institutions.map(i => (
                  <option key={i.id} value={i.id}>{i.code} - {i.name}</option>
                ))}
              </select>
              <span className="font-bold text-slate-400">vs</span>
              <select
                value={compareId2}
                onChange={e => setCompareId2(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              >
                {institutions.map(i => (
                  <option key={i.id} value={i.id}>{i.code} - {i.name}</option>
                ))}
              </select>
              <button
                onClick={handleCompare}
                className="px-3 py-1.5 rounded-xl bg-aicte-600 text-white font-bold"
              >
                Update
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b">
                <tr>
                  <th className="p-3 w-1/3">Statutory Metric</th>
                  <th className="p-3 w-1/3 text-aicte-600 dark:text-saffron-400">
                    {comparisonResult.institution1.name} ({comparisonResult.institution1.code})
                  </th>
                  <th className="p-3 w-1/3 text-govteal-600 dark:text-govteal-400">
                    {comparisonResult.institution2.name} ({comparisonResult.institution2.code})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {comparisonResult.metricsComparison.map((m: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-600 dark:text-slate-300">{m.metric}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{m.inst1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{m.inst2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- PASSPORT DIGITAL TWIN VIEW --- */}
      {!isCompareMode && passportData && (
        <div className="space-y-6">
          {/* Header Card with Source Badges */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-aicte-600 dark:text-saffron-400 bg-aicte-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {passportData.institution.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {passportData.institution.type}
                  </span>
                  <span className="text-xs text-slate-400">
                    Estd. {passportData.institution.establishedYear}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {passportData.institution.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {passportData.institution.address} | Contact: {passportData.institution.contactEmail}
                </p>
              </div>

              {/* Institution Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedInstId}
                  onChange={e => loadPassport(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-semibold max-w-xs"
                >
                  {institutions.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.code} - {i.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stakeholder Single Source-of-Truth Badges */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Data Feed Feeder Sources:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-blue-600" /> Regional Office Western (Active)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Inspection Committee Cell
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-amber-600" /> College Self-Reporting Portal
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-purple-600" /> National Anti-Ragging & Complaint Cell
              </span>
            </div>
          </div>

          {/* 8-Tab Navigation */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
            {passportTabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActivePassportTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl transition whitespace-nowrap ${
                    activePassportTab === t.id
                      ? 'bg-aicte-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov text-xs space-y-4">
            {activePassportTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                  <span className="text-slate-500">Compliance Health Score</span>
                  <div className="text-xl font-bold text-emerald-600">{passportData.institution.complianceScore}/100</div>
                  <span className="text-[10px] text-slate-400">Risk: {passportData.institution.riskLevel}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                  <span className="text-slate-500">Approved Intake</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{passportData.institution.intakeApproved} Seats</div>
                  <span className="text-[10px] text-slate-400">Total Enrolled: {passportData.institution.totalStudents}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                  <span className="text-slate-500">Regular Faculty Cadre</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{passportData.institution.totalFaculty} Faculty</div>
                  <span className="text-[10px] text-slate-400">FSR: 1:{(passportData.institution.totalStudents / passportData.institution.totalFaculty).toFixed(1)}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                  <span className="text-slate-500">Fire NOC Expiry</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{passportData.institution.fireNocValidTill}</div>
                  <span className="text-[10px] text-slate-400">Last Inspection: {passportData.institution.lastInspectionDate}</span>
                </div>
              </div>
            )}

            {activePassportTab === 'approvals' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Historical Approval Records</h4>
                <div className="space-y-2">
                  {passportData.applications.map((app: any) => (
                    <div key={app.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-aicte-600 dark:text-saffron-400">{app.id}</span>
                        <h5 className="font-bold text-slate-900 dark:text-white">{app.applicationType} ({app.academicYear})</h5>
                        <p className="text-[11px] text-slate-500">Officer: {app.assignedOfficer}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePassportTab === 'faculty' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Registered Master Faculty Roster</h4>
                {passportData.faculty.length === 0 ? (
                  <p className="text-slate-500">No individual faculty collision recorded for this college.</p>
                ) : (
                  <div className="space-y-2">
                    {passportData.faculty.map((f: any) => (
                      <div key={f.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{f.name}</span>
                          <p className="text-[11px] text-slate-500">{f.designation} • {f.department}</p>
                          <span className="font-mono text-[10px] text-slate-400">PAN: {f.pan}</span>
                        </div>
                        {f.isGhostFlagged ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                            Ghost Flagged (Dual Claim)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Verified Regular
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activePassportTab === 'infrastructure' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Physical Infrastructure Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-slate-400 block text-[10px]">Built-Up Area</span>
                    <span className="font-bold text-base">{passportData.institution.builtUpAreaSqM} sq.m</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-slate-400 block text-[10px]">Total Laboratories</span>
                    <span className="font-bold text-base">{passportData.institution.labCount} Labs</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-slate-400 block text-[10px]">Library Volumes</span>
                    <span className="font-bold text-base">{passportData.institution.libraryBooks.toLocaleString()} Books</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border">
                    <span className="text-slate-400 block text-[10px]">Barrier-Free Ramp</span>
                    <span className="font-bold text-base text-emerald-600">100% Certified</span>
                  </div>
                </div>
              </div>
            )}

            {activePassportTab === 'complaints' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Grievance & Complaint Cell Dossier</h4>
                {passportData.complaints.map((c: any) => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-slate-400">
                      <span>{c.id}</span>
                      <span>Filed on {c.date}</span>
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{c.subject}</h5>
                    <p className="text-[11px] text-slate-500">By: {c.complainantType}</p>
                    <div className="pt-1 text-[11px] text-emerald-600 font-semibold">
                      Status: {c.status} ({c.investigationNote})
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activePassportTab === 'timeline' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Compliance Score Timeline</h4>
                <div className="space-y-3 border-l-2 border-slate-200 dark:border-slate-800 pl-4">
                  {passportData.scoreTimeline.map((item: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                      <h5 className="font-bold text-slate-900 dark:text-white">{item.event}</h5>
                      <span className="text-xs font-black text-aicte-600 dark:text-saffron-400">
                        Score Recorded: {item.score} / 100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePassportTab === 'documents' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Registered Documents</h4>
                <div className="space-y-2">
                  {passportData.documents.map((d: any) => (
                    <div key={d.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{d.docType}</span>
                        <p className="text-[11px] text-slate-500">{d.fileName}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePassportTab === 'inspections' && (
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Field Inspection Reports</h4>
                {passportData.inspections.length === 0 ? (
                  <p className="text-slate-500">No physical inspection triggered for this institution in AY 2026-27.</p>
                ) : (
                  passportData.inspections.map((insp: any) => (
                    <div key={insp.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400">
                        <span>{insp.id}</span>
                        <span>Mode: {insp.mode}</span>
                      </div>
                      <h5 className="font-bold text-slate-900 dark:text-white">Inspector: {insp.leadInspector}</h5>
                      <p className="text-[11px] text-slate-600">{insp.reportSummary}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
