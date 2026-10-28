import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Download,
  Filter,
  Search,
  Sliders,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ComplianceRule, Institution } from '../types';

export const ComplianceCheckingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role !== 'Institution User';

  const [activeTab, setActiveTab] = useState<'instant' | 'batch' | 'rules'>('instant');
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('1-1029384711');
  const [instantValidationResult, setInstantValidationResult] = useState<any>(null);
  const [batchResults, setBatchResults] = useState<any>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [instantLoading, setInstantLoading] = useState(false);

  // Instant simulator sliders
  const [simData, setSimData] = useState({
    facultyCount: 145,
    studentsCount: 2240,
    builtUpArea: 45000,
    fireNocExpiry: '2027-03-31'
  });

  const [batchFilterStatus, setBatchFilterStatus] = useState('All');
  const [batchSearch, setBatchSearch] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const rulesData = await api.getRules();
        setRules(rulesData);
        const instsData = await api.getInstitutions();
        setInstitutions(instsData);
        
        const targetId = !isAdmin && user?.institutionId 
          ? user.institutionId 
          : (instsData.length > 0 ? instsData[0].id : '1-1029384711');
        
        const targetInst = instsData.find((i: Institution) => i.id === targetId) || instsData[0];
        if (targetInst) {
          setSimData({
            facultyCount: targetInst.totalFaculty,
            studentsCount: targetInst.totalStudents,
            builtUpArea: targetInst.builtUpAreaSqM,
            fireNocExpiry: targetInst.fireNocValidTill
          });
          runInstantValidation(targetInst.id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, [user]);

  const runInstantValidation = async (instId: string) => {
    setInstantLoading(true);
    setSelectedInstId(instId);
    try {
      const res = await api.validateInstitution({
        institutionId: instId,
        dataOverride: {
          totalFaculty: simData.facultyCount,
          totalStudents: simData.studentsCount,
          builtUpAreaSqM: simData.builtUpArea,
          fireNocValidTill: simData.fireNocExpiry
        }
      });
      setInstantValidationResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setInstantLoading(false);
    }
  };

  const runBatchCheck = async () => {
    setBatchLoading(true);
    try {
      const res = await api.batchCheckCompliance();
      setBatchResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setBatchLoading(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!batchResults?.results) return;
    const headers = ['Institution ID', 'College Name', 'State', 'Discipline', 'Compliance Score', 'FSR', 'Fire NOC Valid', 'Status'];
    const rows = batchResults.results.map((r: any) => [
      r.institutionId,
      `"${r.name}"`,
      r.state,
      r.discipline,
      r.complianceScore,
      r.fsr,
      r.fireNocValidTill,
      r.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_Compliance_Batch_Run_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-aicte-100 text-aicte-800 dark:bg-aicte-950 dark:text-saffron-300">
              Module 3: Preventive Engine
            </span>
            <span className="text-xs text-slate-400">Approval Process Handbook (APH) Norms</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Machine-Readable Compliance Checking & Batch Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Instant rule evaluation with red/amber/green status, fix suggestions, and pan-India batch verification.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('batch');
                runBatchCheck();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-aicte-600 hover:bg-aicte-700 text-white font-bold text-xs shadow-md transition"
            >
              <Play className="w-4 h-4 text-amber-300" />
              <span>Run Pan-India Batch Audit</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('instant')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition ${
            activeTab === 'instant'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isAdmin ? 'Instant Rule Validation' : 'My Compliance Simulation'}</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => {
              setActiveTab('batch');
              if (!batchResults) runBatchCheck();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition ${
              activeTab === 'batch'
                ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Batch Audit Across All Colleges ({institutions.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition ${
            activeTab === 'rules'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configured Statutory Rules ({rules.length})</span>
        </button>
      </div>

      {/* --- TAB 1: INSTANT VALIDATION --- */}
      {activeTab === 'instant' && (
        <div className="space-y-6">
          {/* Institution Selector & Interactive Sliders */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isAdmin ? 'Select College to Verify Instantly' : 'Institution Compliance Simulator'}
                </h3>
                <p className="text-xs text-slate-500">
                  Observe real-time recalculation of Pass / Fail RAG flags when values are adjusted.
                </p>
              </div>

              {isAdmin ? (
                <select
                  value={selectedInstId}
                  onChange={e => {
                    const inst = institutions.find(i => i.id === e.target.value);
                    if (inst) {
                      setSimData({
                        facultyCount: inst.totalFaculty,
                        studentsCount: inst.totalStudents,
                        builtUpArea: inst.builtUpAreaSqM,
                        fireNocExpiry: inst.fireNocValidTill
                      });
                    }
                    runInstantValidation(e.target.value);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-semibold max-w-sm"
                >
                  {institutions.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.state})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 font-medium">
                  <strong>{user?.name}</strong>
                  <span className="text-[11px] block text-slate-500 dark:text-slate-400">AICTE ID: {user?.institutionId}</span>
                </div>
              )}
            </div>

            {/* Simulated Sliders for Live Demonstration */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Regular Faculty:</span>
                  <span className="font-bold text-aicte-600 dark:text-saffron-400">{simData.facultyCount}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={simData.facultyCount}
                  onChange={e => {
                    setSimData({ ...simData, facultyCount: Number(e.target.value) });
                  }}
                  onMouseUp={() => runInstantValidation(selectedInstId)}
                  className="w-full accent-aicte-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block text-right">
                  Ratio: 1:{(simData.studentsCount / simData.facultyCount).toFixed(1)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Instructional Area:</span>
                  <span className="font-bold text-aicte-600 dark:text-saffron-400">{simData.builtUpArea} sq.m</span>
                </div>
                <input
                  type="range"
                  min="8000"
                  max="80000"
                  step="1000"
                  value={simData.builtUpArea}
                  onChange={e => {
                    setSimData({ ...simData, builtUpArea: Number(e.target.value) });
                  }}
                  onMouseUp={() => runInstantValidation(selectedInstId)}
                  className="w-full accent-aicte-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block text-right">
                  Area: {(simData.builtUpArea / simData.studentsCount).toFixed(1)} m²/student
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Fire NOC Expiry Date:</span>
                </div>
                <input
                  type="date"
                  value={simData.fireNocExpiry}
                  onChange={e => {
                    setSimData({ ...simData, fireNocExpiry: e.target.value });
                  }}
                  onBlur={() => runInstantValidation(selectedInstId)}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border text-xs"
                />
                <span className="text-[10px] text-slate-400 block text-right">
                  Cutoff: 2026-10-27
                </span>
              </div>
            </div>
          </div>

          {/* Results Cards */}
          {instantValidationResult && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Compliance Verification Summary: {instantValidationResult.institutionName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Engine Status: <strong>{instantValidationResult.status}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Composite Score</span>
                    <span className={`text-2xl font-black ${instantValidationResult.calculatedScore >= 85 ? 'text-emerald-500' : instantValidationResult.calculatedScore >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                      {instantValidationResult.calculatedScore} / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Individual Rules Table with RAG Indicator & Fix Suggestion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instantValidationResult.results.map((res: any) => (
                  <div
                    key={res.ruleId}
                    className={`p-4 rounded-2xl border text-xs space-y-2 transition shadow-xs ${
                      res.passed
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                        : res.severity === 'Critical'
                        ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40'
                        : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        {res.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        <span className="text-slate-900 dark:text-white">{res.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{res.aphClause}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                      <span>Observed: <strong>{res.actualValue}</strong></span>
                      <span>Target: {res.thresholdValue}</span>
                    </div>

                    {!res.passed && (
                      <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-red-200 dark:border-red-800/40 text-[11px] text-red-800 dark:text-red-300">
                        <span className="font-bold block text-[10px] uppercase text-red-600">
                          Fix Suggestion (Deficiency Remedy):
                        </span>
                        {res.fixSuggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: BATCH RUN ACROSS ALL COLLEGES --- */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Pan-India Automated Compliance Audit Results
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive batch check across all 26 technical institutions nationwide.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('common.exportCsv')}</span>
                </button>
              </div>
            </div>

            {batchResults && (
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Total Audited</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{batchResults.totalChecked}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-center">
                  <span className="text-[10px] text-emerald-600 block">Fully Compliant</span>
                  <span className="text-lg font-black text-emerald-600">{batchResults.compliantCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-center">
                  <span className="text-[10px] text-red-600 block">Deficiencies Found</span>
                  <span className="text-lg font-black text-red-600">{batchResults.deficientCount}</span>
                </div>
              </div>
            )}

            {/* Filter controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => setBatchFilterStatus('All')}
                  className={`px-2.5 py-1 rounded-lg ${batchFilterStatus === 'All' ? 'bg-aicte-600 text-white font-bold' : 'text-slate-500'}`}
                >
                  All ({batchResults?.results?.length || 0})
                </button>
                <button
                  onClick={() => setBatchFilterStatus('Compliant')}
                  className={`px-2.5 py-1 rounded-lg ${batchFilterStatus === 'Compliant' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'}`}
                >
                  Compliant ({batchResults?.compliantCount || 0})
                </button>
                <button
                  onClick={() => setBatchFilterStatus('Deficient')}
                  className={`px-2.5 py-1 rounded-lg ${batchFilterStatus === 'Deficient' ? 'bg-red-600 text-white font-bold' : 'text-slate-500'}`}
                >
                  Deficient ({batchResults?.deficientCount || 0})
                </button>
              </div>

              <input
                type="text"
                placeholder="Filter institution or state..."
                value={batchSearch}
                onChange={e => setBatchSearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>

            {/* Batch Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Institution Name</th>
                    <th className="p-3">State</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">FSR Ratio</th>
                    <th className="p-3">Fire NOC Validity</th>
                    <th className="p-3">Risk Level</th>
                    <th className="p-3">Audit Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {batchResults?.results
                    ?.filter((r: any) => {
                      const matchesStatus = batchFilterStatus === 'All' || r.status === batchFilterStatus;
                      const matchesSearch = r.name.toLowerCase().includes(batchSearch.toLowerCase()) || r.state.toLowerCase().includes(batchSearch.toLowerCase());
                      return matchesStatus && matchesSearch;
                    })
                    .map((row: any) => (
                      <tr key={row.institutionId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-aicte-600 dark:text-saffron-400">{row.code}</td>
                        <td className="p-3 font-medium text-slate-900 dark:text-white max-w-[220px] truncate">{row.name}</td>
                        <td className="p-3 text-slate-500">{row.state}</td>
                        <td className="p-3 font-bold">{row.complianceScore}/100</td>
                        <td className="p-3">
                          <span className={row.isFsrValid ? 'text-emerald-600 font-semibold' : 'text-red-500 font-bold'}>
                            {row.fsr}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={row.isFireNocValid ? 'text-slate-600 dark:text-slate-300' : 'text-red-500 font-bold'}>
                            {row.fireNocValidTill}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' : row.riskLevel === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row.riskLevel}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === 'Compliant' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: CONFIGURED APH RULES --- */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div
              key={rule.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-aicte-600 dark:text-saffron-400">{rule.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {rule.category}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rule.title}</h4>
              <p className="text-[11px] text-slate-500 font-mono">{rule.aphClause}</p>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{rule.description}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-500">Threshold: {rule.operator} {rule.thresholdValue}</span>
                <span className="font-bold text-red-600 uppercase">{rule.severity} Severity</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
