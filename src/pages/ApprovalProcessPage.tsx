import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building,
  User,
  ArrowRight,
  UploadCloud,
  Download,
  QrCode,
  ShieldCheck,
  History,
  MessageSquare,
  PlusCircle,
  Search,
  Filter,
  Check,
  X,
  FileCheck2,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Application, Institution } from '../types';
import { ScannableQRCode } from '../components/ScannableQRCode';

export const ApprovalProcessPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role !== 'Institution User';

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tracker' | 'new_application' | 'deficiencies' | 'audit_trail'>('tracker');

  // Multi-step Application Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    institutionName: 'College of Engineering, Pune (COEP Technological Univ)',
    institutionId: '1-1029384711',
    state: 'Maharashtra',
    applicationType: 'Extension of Approval (EoA)' as Application['applicationType'],
    courses: [
      { name: 'Computer Engineering', level: 'UG' as const, currentIntake: 180, proposedIntake: 180 },
      { name: 'Artificial Intelligence & Robotics', level: 'PG' as const, currentIntake: 30, proposedIntake: 30 }
    ],
    facultyCount: 145,
    builtUpArea: 45000,
    fireNocValidTill: '2027-03-31',
    balanceSheetUploaded: true,
    autoSavedTime: 'Auto-saved 2 mins ago'
  });

  // Deficiency Modal State (for officer to raise deficiency)
  const [showRaiseDefModal, setShowRaiseDefModal] = useState(false);
  const [defRuleId, setDefRuleId] = useState('APH-R01');
  const [defDescription, setDefDescription] = useState('');

  // Response Modal State (for institution to respond)
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedDefId, setSelectedDefId] = useState('');
  const [instResponseText, setInstResponseText] = useState('');

  // Approval Letter Modal
  const [showLetterModal, setShowLetterModal] = useState(false);

  // Search & Filter
  const [filterStage, setFilterStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = !isAdmin && user?.institutionId ? { institutionId: user.institutionId } : undefined;
      const data = await api.getApplications(params);
      const userApps = !isAdmin && user?.institutionId 
        ? data.filter((a: Application) => a.institutionId === user.institutionId)
        : data;
      setApplications(userApps);
      if (userApps.length > 0) {
        if (!isAdmin && user?.institutionId) {
          setSelectedApp(userApps[0]);
        } else {
          // Pre-select SPCE Mumbai for admin demo review
          const spceApp = userApps.find((a: Application) => a.id === 'APP-2026-1002');
          setSelectedApp(spceApp || userApps[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    if (user?.institutionId) {
      setWizardData(prev => ({
        ...prev,
        institutionId: user.institutionId || prev.institutionId,
        institutionName: (user as any).institutionName || user.name || prev.institutionName,
        state: (user as any).state || prev.state
      }));
    }
  }, [user]);

  // Handle Decision (Approve / Reject)
  const handleDecision = async (decision: 'Approved' | 'Rejected' | 'Conditional Approval') => {
    if (!selectedApp) return;
    try {
      const updated = await api.makeDecision(selectedApp.id, {
        decision,
        remarks: `Statutory Committee clearance recorded on ${new Date().toLocaleDateString()}`
      });
      setSelectedApp(updated);
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));

      if (decision === 'Approved') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setShowLetterModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Raise Deficiency
  const handleRaiseDeficiency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !defDescription) return;
    try {
      const updated = await api.raiseDeficiency(selectedApp.id, {
        ruleId: defRuleId,
        description: defDescription
      });
      setSelectedApp(updated);
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      setShowRaiseDefModal(false);
      setDefDescription('');
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Respond to Deficiency
  const handleRespondDeficiency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !selectedDefId || !instResponseText) return;
    try {
      const updated = await api.respondDeficiency(selectedApp.id, {
        deficiencyId: selectedDefId,
        institutionResponse: instResponseText
      });
      setSelectedApp(updated);
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      setShowRespondModal(false);
      setInstResponseText('');
    } catch (e) {
      console.error(e);
    }
  };

  // Submit New Application from Wizard
  const handleWizardSubmit = async () => {
    try {
      const newApp = await api.createApplication({
        institutionId: wizardData.institutionId,
        institutionName: wizardData.institutionName,
        applicationType: wizardData.applicationType,
        coursesRequested: wizardData.courses,
        submittedBy: user?.name || 'Registrar'
      });
      setApplications(prev => [newApp, ...prev]);
      setSelectedApp(newApp);
      setActiveTab('tracker');
      confetti({ particleCount: 50 });
    } catch (e) {
      console.error(e);
    }
  };

  const stagesList: Application['stage'][] = [
    'Submitted',
    'Document Check',
    'Scrutiny',
    'Inspection',
    'Committee Review',
    'Decision'
  ];

  const filteredApps = applications.filter(a => {
    // Strict privacy: Institution user can only see their own application
    if (!isAdmin && user?.institutionId && a.institutionId !== user.institutionId) {
      return false;
    }
    const matchesStage = filterStage === 'All' || a.stage === filterStage;
    const matchesSearch = a.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-aicte-100 text-aicte-800 dark:bg-aicte-950 dark:text-saffron-300">
              Module 2: Automated Workflow Engine
            </span>
            <span className="text-xs text-slate-400">APH 2026 Statutory Standard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            End-to-End Approval Workflow & Deficiency Cycle
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time courier-like scrutiny tracker, deficiency rectifications, and digital EoA letter issuance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('new_application')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-aicte-600 hover:bg-aicte-700 text-white font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for EoA / New Course</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'tracker'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Workflow Tracker & Review</span>
        </button>

        <button
          onClick={() => setActiveTab('new_application')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'new_application'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Multi-Step Application Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab('deficiencies')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'deficiencies'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Deficiency Rectification Cycle</span>
          {selectedApp && selectedApp.deficiencies.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
              {selectedApp.deficiencies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit_trail')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'audit_trail'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Full Audit Trail & Logs</span>
        </button>
      </div>

      {/* --- TAB 1: REAL-TIME COURIER-LIKE WORKFLOW TRACKER --- */}
      {activeTab === 'tracker' && selectedApp && (
        <div className="space-y-6">
          {/* Active Application Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-aicte-600 dark:text-saffron-400 bg-aicte-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {selectedApp.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedApp.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : selectedApp.status === 'Deficiency Raised'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {selectedApp.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    AY {selectedApp.academicYear}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedApp.institutionName}
                </h2>
                <p className="text-xs text-slate-500">
                  Application Type: <strong>{selectedApp.applicationType}</strong> | Assigned Officer: <strong>{selectedApp.assignedOfficer}</strong>
                </p>
              </div>

              {/* Action Buttons for Officer */}
              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && selectedApp.status !== 'Approved' && (
                  <>
                    <button
                      onClick={() => setShowRaiseDefModal(true)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 transition"
                    >
                      Raise Deficiency
                    </button>
                    <button
                      onClick={() => handleDecision('Approved')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
                    >
                      Approve & Issue EoA Letter
                    </button>
                  </>
                )}

                {selectedApp.status === 'Approved' && (
                  <button
                    onClick={() => setShowLetterModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-aicte-600 hover:bg-aicte-700 text-white shadow-md transition"
                  >
                    <FileCheck2 className="w-4 h-4 text-amber-300" />
                    <span>View Official Approval Letter</span>
                  </button>
                )}
              </div>
            </div>

            {/* Courier-like Progress Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                Statutory Workflow Progression (Courier Style)
              </div>

              <div className="relative">
                {/* Connecting track */}
                <div className="absolute top-5 left-4 right-4 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
                  {stagesList.map((stg, idx) => {
                    const currentIndex = stagesList.indexOf(selectedApp.stage);
                    const isCompleted = idx < currentIndex || selectedApp.status === 'Approved';
                    const isCurrent = idx === currentIndex && selectedApp.status !== 'Approved';
                    const isDeficient = isCurrent && selectedApp.status === 'Deficiency Raised';

                    return (
                      <div key={stg} className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isDeficient
                              ? 'bg-red-500 text-white ring-4 ring-red-200 dark:ring-red-950 animate-pulse'
                              : isCurrent
                              ? 'bg-aicte-600 text-white ring-4 ring-aicte-200 dark:ring-aicte-900'
                              : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                        </div>

                        <span className={`text-xs font-bold mt-2 ${isCurrent ? 'text-aicte-600 dark:text-saffron-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {stg}
                        </span>

                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {isCompleted ? 'Passed' : isDeficient ? 'Deficiency Raised' : isCurrent ? 'Under Review' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SLA Countdown Timer */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-govteal-100 dark:bg-govteal-950 text-govteal-700 dark:text-govteal-300 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">
                    Statutory Turnaround SLA Timer
                  </span>
                  <span className="text-[11px] text-slate-500">
                    AICTE Citizen Charter mandates 21 calendar days per cycle.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className={`text-sm font-black ${selectedApp.slaDaysRemaining < 0 ? 'text-red-500 animate-pulse' : 'text-emerald-600'}`}>
                    {selectedApp.slaDaysRemaining < 0 ? `Breached by ${Math.abs(selectedApp.slaDaysRemaining)} Days` : `${selectedApp.slaDaysRemaining} Days Remaining`}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Submitted on {selectedApp.submissionDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick List of Applications to Select From */}
          {isAdmin ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  All Applications ({filteredApps.length})
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={filterStage}
                    onChange={e => setFilterStage(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="All">All Stages</option>
                    {stagesList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input
                    type="text"
                    placeholder="Filter colleges..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">App ID</th>
                      <th className="p-3">Institution Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">SLA Days</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredApps.slice(0, 8).map(app => (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                          selectedApp.id === app.id ? 'bg-aicte-50/60 dark:bg-aicte-950/40 font-semibold' : ''
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-aicte-600 dark:text-saffron-400">{app.id}</td>
                        <td className="p-3 max-w-[220px] truncate text-slate-800 dark:text-slate-200">{app.institutionName}</td>
                        <td className="p-3 text-slate-500">{app.applicationType}</td>
                        <td className="p-3">{app.stage}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : app.status === 'Deficiency Raised'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`font-bold ${app.slaDaysRemaining < 0 ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                            {app.slaDaysRemaining}d
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApp(app);
                            }}
                            className="text-aicte-600 dark:text-saffron-400 font-semibold hover:underline"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : filteredApps.length > 1 ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                My Submitted Applications ({filteredApps.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">App ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredApps.map(app => (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                          selectedApp.id === app.id ? 'bg-aicte-50/60 dark:bg-aicte-950/40 font-semibold' : ''
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-aicte-600 dark:text-saffron-400">{app.id}</td>
                        <td className="p-3 text-slate-500">{app.applicationType}</td>
                        <td className="p-3">{app.stage}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : app.status === 'Deficiency Raised'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApp(app);
                            }}
                            className="text-aicte-600 dark:text-saffron-400 font-semibold hover:underline"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* --- TAB 2: MULTI-STEP APPLICATION WIZARD --- */}
      {activeTab === 'new_application' && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-gov space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Statutory Application Filing Wizard (AY 2026-27)
              </h2>
              <p className="text-xs text-slate-500">
                Pre-filled with certified records from previous approval year.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                ⚡ {wizardData.autoSavedTime}
              </span>
            </div>
          </div>

          {/* Stepper Header (6 Steps) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            {[
              { num: 1, title: 'Institution' },
              { num: 2, title: 'Courses & Intake' },
              { num: 3, title: 'Faculty Roll' },
              { num: 4, title: 'Infrastructure' },
              { num: 5, title: 'Documents' },
              { num: 6, title: 'Review & Submit' }
            ].map(s => (
              <div
                key={s.num}
                onClick={() => setWizardStep(s.num)}
                className={`p-2.5 rounded-xl cursor-pointer border transition ${
                  wizardStep === s.num
                    ? 'bg-aicte-600 text-white border-aicte-600 shadow-sm font-bold'
                    : wizardStep > s.num
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="block text-[10px] uppercase">Step {s.num}</span>
                <span className="text-xs font-semibold truncate">{s.title}</span>
              </div>
            ))}
          </div>

          {/* Step 1: Institution Details */}
          {wizardStep === 1 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Institution Profile (Pre-filled)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">College Name</label>
                  <input
                    type="text"
                    value={wizardData.institutionName}
                    onChange={e => setWizardData({ ...wizardData, institutionName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">AICTE Permanent ID</label>
                  <input
                    type="text"
                    disabled
                    value={wizardData.institutionId}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Courses and Intake */}
          {wizardStep === 2 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Courses & Sanctioned Intake</h3>
                <button
                  type="button"
                  onClick={() => {
                    setWizardData({
                      ...wizardData,
                      courses: [...wizardData.courses, { name: 'New Specialized Discipline', level: 'UG', currentIntake: 0, proposedIntake: 60 }]
                    });
                  }}
                  className="px-3 py-1 rounded-lg bg-aicte-50 dark:bg-slate-800 text-aicte-600 font-bold"
                >
                  + Add Proposed Course
                </button>
              </div>

              <div className="space-y-2">
                {wizardData.courses.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                    <span className="font-bold text-slate-800 dark:text-white flex-1">{c.name} ({c.level})</span>
                    <span className="text-slate-500">Current: {c.currentIntake}</span>
                    <span className="font-bold text-aicte-600 dark:text-saffron-400">Proposed: {c.proposedIntake}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Faculty Roll */}
          {wizardStep === 3 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Faculty Cadre Strength</h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span>Total Verified Regular Faculty:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{wizardData.facultyCount} Members</span>
                </div>
                <div className="flex justify-between">
                  <span>Student-Faculty Ratio (FSR):</span>
                  <span className="font-bold text-emerald-600">1:15.4 (Compliant with Clause 7.1)</span>
                </div>
                <div className="flex justify-between">
                  <span>Aadhaar Biometric Seeding:</span>
                  <span className="font-bold text-emerald-600">100% Seeded & Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Infrastructure */}
          {wizardStep === 4 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Instructional Space & Built-Up Area</h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span>Total Built-Up Area:</span>
                  <span className="font-bold">{wizardData.builtUpArea} sq.m</span>
                </div>
                <div className="flex justify-between">
                  <span>Instructional Space per Student:</span>
                  <span className="font-bold text-emerald-600">4.9 m²/student (Min 4.5 required)</span>
                </div>
                <div className="flex justify-between">
                  <span>Divyangjan Ramps & Restrooms:</span>
                  <span className="font-bold text-emerald-600">Audited & Certified</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Documents */}
          {wizardStep === 5 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Mandatory Statutory Deeds</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                  <span>1. State Fire & Life Safety Certificate (NOC)</span>
                  <span className="font-bold text-emerald-600">Valid till {wizardData.fireNocValidTill}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                  <span>2. Land Ownership Title & Revenue Patta</span>
                  <span className="font-bold text-emerald-600">Encumbrance-Free Verified</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                  <span>3. Audited Balance Sheet (FY 2024-25)</span>
                  <span className="font-bold text-emerald-600">Uploaded & Signed by CA</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review and Submit */}
          {wizardStep === 6 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300">
                <h4 className="font-bold text-sm mb-1">Pre-Submission Validation: 100% Passed</h4>
                <p>All 14 mandatory APH 2026 checks have passed without fatal blockers. Your application will be auto-routed to the Regional Office upon submission.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span>Target Academic Year:</span>
                  <span className="font-bold">2026-2027</span>
                </div>
                <div className="flex justify-between">
                  <span>Statutory Processing Fee:</span>
                  <span className="font-bold">₹1,50,000 (Payment Verified via Bharatkosh)</span>
                </div>
                <div className="flex justify-between">
                  <span>Regional Office:</span>
                  <span className="font-bold">Western Regional Office, Mumbai</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleWizardSubmit}
                  className="w-full py-3 rounded-xl font-bold bg-[#1F3864] hover:bg-aicte-700 text-white text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Application with Digital Signature</span>
                </button>
              </div>
            </div>
          )}

          {/* Next / Previous Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              type="button"
              disabled={wizardStep === 1}
              onClick={() => setWizardStep(prev => prev - 1)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 text-xs"
            >
              Previous Step
            </button>
            {wizardStep < 6 && (
              <button
                type="button"
                onClick={() => setWizardStep(prev => prev + 1)}
                className="px-5 py-2 rounded-xl bg-aicte-600 text-white font-bold text-xs hover:bg-aicte-700"
              >
                Next Step →
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: DEFICIENCY RECTIFICATION CYCLE --- */}
      {activeTab === 'deficiencies' && selectedApp && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Deficiencies Noted for {selectedApp.institutionName}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Institutions are granted 15 days from deficiency notice date to submit rectification affidavits and supporting evidence.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowRaiseDefModal(true)}
                  className="px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                >
                  + Raise New Statutory Deficiency
                </button>
              )}
            </div>

            {selectedApp.deficiencies.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-xs text-slate-700 dark:text-slate-200">Zero Deficiencies Recorded</p>
                <p className="text-[11px]">This application meets all statutory norms and has not been flagged with discrepancies.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedApp.deficiencies.map(def => (
                  <div
                    key={def.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-red-600 dark:text-red-400">
                        {def.id} (Rule: {def.ruleId})
                      </span>
                      <span className="text-[10px] text-slate-400">Issued on {def.raisedDate}</span>
                    </div>

                    <p className="font-semibold text-slate-900 dark:text-white">
                      {def.description}
                    </p>

                    {def.institutionResponse ? (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                        <span className="font-bold block text-[11px]">College Response (Uploaded {def.responseDate}):</span>
                        <p>{def.institutionResponse}</p>
                        {def.officerNote && (
                          <span className="block mt-1 text-[10px] font-semibold text-slate-500">
                            Officer Review Note: {def.officerNote}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                          Pending College Clarification
                        </span>
                        <button
                          onClick={() => {
                            setSelectedDefId(def.id);
                            setShowRespondModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-aicte-600 text-white font-bold text-xs hover:bg-aicte-700 transition"
                        >
                          Upload Response & Documents
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: AUDIT TRAIL --- */}
      {activeTab === 'audit_trail' && selectedApp && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-aicte-600" />
            <span>Complete Statutory Audit Trail (ISO 27001 Log)</span>
          </h3>

          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 text-xs pl-6">
            {selectedApp.history.map((ev, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-aicte-600 ring-4 ring-white dark:ring-slate-900" />
                <span className="font-mono text-[10px] text-slate-400 block">{ev.timestamp}</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">{ev.action}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{ev.notes}</p>
                <span className="text-[10px] text-aicte-600 dark:text-saffron-400 font-semibold block mt-1">
                  Actor: {ev.actor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL: RAISE DEFICIENCY (OFFICER) --- */}
      {showRaiseDefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-xs space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Issue Statutory Deficiency Notice</h4>
            <form onSubmit={handleRaiseDeficiency} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">APH Rule Violation</label>
                <select
                  value={defRuleId}
                  onChange={e => setDefRuleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  <option value="APH-R01">Clause 7.1: Faculty-Student Ratio (FSR)</option>
                  <option value="APH-R02">Clause 8.3: Instructional Built-up Space</option>
                  <option value="APH-R03">Clause 4.2: Valid Fire Safety NOC</option>
                  <option value="APH-R04">Clause 7.4: Cadre Ratio Imbalance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Deficiency Description / Finding</label>
                <textarea
                  rows={3}
                  required
                  value={defDescription}
                  onChange={e => setDefDescription(e.target.value)}
                  placeholder="Detail the discrepancy observed during scrutiny..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRaiseDefModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
                >
                  Issue Deficiency Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: RESPOND TO DEFICIENCY (COLLEGE) --- */}
      {showRespondModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-xs space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Upload Deficiency Clarification & Affidavit</h4>
            <form onSubmit={handleRespondDeficiency} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Institution Response / Justification</label>
                <textarea
                  rows={3}
                  required
                  value={instResponseText}
                  onChange={e => setInstResponseText(e.target.value)}
                  placeholder="Enter clarification regarding faculty relieving deed or municipal renewal..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed flex items-center justify-center gap-2 text-slate-500">
                <UploadCloud className="w-4 h-4 text-aicte-600" />
                <span>Simulated Supporting Deed Attachment: Relieving_Certificate.pdf</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRespondModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-aicte-600 text-white font-bold hover:bg-aicte-700"
                >
                  Submit for Re-Scrutiny
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: OFFICIAL APPROVAL LETTER (PDF / PRINT VIEW WITH SECURE QR) --- */}
      {showLetterModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-8 shadow-2xl space-y-6 my-8 border border-slate-200">
            {/* National Emblem & Header */}
            <div className="text-center border-b pb-4 space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#1F3864] text-amber-400 font-black flex items-center justify-center mx-auto text-sm shadow">
                AICTE
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-tight text-[#1F3864]">
                All India Council for Technical Education
              </h2>
              <p className="text-[11px] text-slate-600">
                (A Statutory Body of the Government of India, Ministry of Education)
              </p>
              <p className="text-[10px] text-slate-500">
                Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 | www.aicte-india.org
              </p>
            </div>

            {/* Letter Metadata */}
            <div className="flex justify-between items-start text-xs">
              <div>
                <div><strong>Letter No:</strong> AICTE/AB/EoA/2026-27/{selectedApp.id}</div>
                <div><strong>Date:</strong> 22-October-2026</div>
              </div>
              <div className="text-right">
                <div><strong>Permanent Institute ID:</strong> {selectedApp.institutionId}</div>
                <div><strong>Academic Year:</strong> 2026-2027</div>
              </div>
            </div>

            {/* Subject */}
            <div className="text-xs">
              <p><strong>To:</strong> The Principal / Director, {selectedApp.institutionName}</p>
              <p className="mt-1">
                <strong>Sub:</strong> Extension of Approval (EoA) / Sanction of Intake for Technical Programs for Academic Year 2026-2027.
              </p>
            </div>

            {/* Approval Table */}
            <div className="text-xs border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Program</th>
                    <th className="p-2.5">Level</th>
                    <th className="p-2.5">Approved Intake</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedApp.coursesRequested.map((c, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-medium">{c.name}</td>
                      <td className="p-2.5">{c.level}</td>
                      <td className="p-2.5 font-bold">{c.proposedIntake}</td>
                      <td className="p-2.5 text-emerald-600 font-bold">Approved</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* QR Code & e-Sign Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              {/* Real Scannable QR Code */}
              <div className="flex items-center gap-3">
                <ScannableQRCode
                  value={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/public-verification?code=${encodeURIComponent(selectedApp.qrVerificationCode || selectedApp.id)}`
                      : `https://aicte.gov.in/verify?code=${selectedApp.qrVerificationCode}`
                  }
                  size={96}
                  showActions={false}
                  className="p-1.5 shadow-none border-slate-300"
                />
                <div>
                  <span className="font-bold text-[#1F3864] block">Official Scannable Verification QR</span>
                  <span className="font-mono text-[10px] text-slate-500 block">
                    {selectedApp.qrVerificationCode}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Scannable via Phone Camera (Opens Public Portal)
                  </span>
                </div>
              </div>

              {/* Digital Signature */}
              <div className="text-right space-y-0.5">
                <span className="text-[10px] text-slate-400 block">Digitally Signed By:</span>
                <span className="font-bold text-[#1F3864] block">Prof. Rajive Kumar</span>
                <span className="text-[10px] text-slate-600 block">Member Secretary, AICTE New Delhi</span>
                <span className="font-mono text-[9px] text-slate-400 block">e-Hastakshar SHA-256 Validated</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setShowLetterModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close Window
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => {
                    alert('Official EoA PDF Downloaded (Simulated with Cryptographic QR)');
                    setShowLetterModal(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1F3864] text-white hover:bg-aicte-700 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
