import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sliders,
  Play,
  PlusCircle,
  HelpCircle,
  TrendingDown,
  AlertTriangle,
  Building,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight
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

export const PolicySimulatorPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'policy_change' | 'institution_expansion' | 'rule_builder'>('policy_change');

  // Policy Simulator State (Admin)
  const [simFsr, setSimFsr] = useState(15); // changing from 1:20 to 1:15
  const [policySimResult, setPolicySimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Institution Expansion State
  const [seatAdd, setSeatAdd] = useState(60);
  const [courseName, setCourseName] = useState('Electronics & Communication Engineering (UG)');
  const [expansionResult, setExpansionResult] = useState<any>(null);

  // Rule Builder Form State
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleClause, setNewRuleClause] = useState('Clause 8.9');
  const [newRuleCategory, setNewRuleCategory] = useState<'Faculty' | 'Infrastructure' | 'Safety' | 'Academics' | 'Governance'>('Infrastructure');
  const [newRuleMetric, setNewRuleMetric] = useState('ai_supercomputing_gpu_nodes');
  const [newRuleOperator, setNewRuleOperator] = useState<'>=' | '<=' | '=='>('>=');
  const [newRuleThreshold, setNewRuleThreshold] = useState('4');
  const [newRuleSeverity, setNewRuleSeverity] = useState<'Critical' | 'High' | 'Medium'>('High');
  const [newRuleDesc, setNewRuleDesc] = useState('Institutions offering AI & Data Science UG degrees must maintain minimum 4 dedicated high-performance GPU nodes.');
  const [ruleSaveSuccess, setRuleSaveSuccess] = useState('');

  const runPolicySimulation = async () => {
    setSimLoading(true);
    try {
      const result = await api.simulate({
        type: 'policy_change',
        facultyRatioThreshold: simFsr
      });
      setPolicySimResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(false);
    }
  };

  const runExpansionSimulation = async () => {
    try {
      const result = await api.simulate({
        type: 'institution_expansion',
        seatAddition: seatAdd,
        courseType: courseName
      });
      setExpansionResult(result);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addRule({
        title: newRuleTitle,
        aphClause: newRuleClause,
        category: newRuleCategory,
        metric: newRuleMetric,
        operator: newRuleOperator,
        thresholdValue: newRuleThreshold,
        courseType: 'UG Technical',
        severity: newRuleSeverity,
        description: newRuleDesc,
        fixSuggestion: 'Procure compliant hardware / staff to fulfill statutory mandate.'
      });
      setRuleSaveSuccess(`Rule "${newRuleTitle}" created and versioned under APH 2026.2.`);
      setNewRuleTitle('');
      setTimeout(() => setRuleSaveSuccess(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Initial auto-run
  React.useEffect(() => {
    runPolicySimulation();
    runExpansionSimulation();
  }, []);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Module 11: Policy Lab & Sandbox
            </span>
            <span className="text-xs text-slate-400">Admin Scenario Modeling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Policy Rule Builder & What-If Impact Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Model national regulatory handbook changes before gazette notification, and calculate resource requirements for intake expansion.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('policy_change')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'policy_change'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Policymaker What-If Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('institution_expansion')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'institution_expansion'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>College Seat Expansion Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('rule_builder')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'rule_builder'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>No-Code Statutory Rule Builder</span>
        </button>
      </div>

      {/* --- TAB 1: POLICY WHAT-IF SIMULATOR --- */}
      {activeTab === 'policy_change' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Regulatory Scenario: "What if AICTE changes the Faculty Ratio threshold?"
            </h3>
            <p className="text-xs text-slate-500">
              Adjust the simulated threshold slider to calculate how many technical institutions across India will immediately drop out of compliance.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Simulated Faculty-to-Student Ratio (FSR):
                </span>
                <span className="text-base font-black text-aicte-600 dark:text-saffron-400">
                  1 : {simFsr} (Current AICTE Standard is 1:20)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="25"
                step="1"
                value={simFsr}
                onChange={e => setSimFsr(Number(e.target.value))}
                className="w-full accent-aicte-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1:10 (Stringent International Norm)</span>
                <span>1:15 (Proposed Higher Cadre)</span>
                <span>1:20 (Current Baseline)</span>
                <span>1:25 (Relaxed)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={runPolicySimulation}
                disabled={simLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F3864] hover:bg-aicte-700 text-white font-bold text-xs shadow-md transition"
              >
                <Play className="w-4 h-4 text-amber-300" />
                <span>{simLoading ? 'Simulating Impact...' : 'Run Simulation Impact Model'}</span>
              </button>
            </div>
          </div>

          {policySimResult && (
            <div className="space-y-6 animate-in fade-in">
              {/* Before vs After KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border">
                  <span className="text-slate-500 block">Baseline Non-Compliant (1:20)</span>
                  <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
                    {policySimResult.beforeNonCompliantCount} Institutions
                  </div>
                  <span className="text-[10px] text-slate-400">Current Statutory State</span>
                </div>

                <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                  <span className="text-red-700 dark:text-red-300 block font-semibold">
                    Simulated Non-Compliant ({policySimResult.simulatedThreshold})
                  </span>
                  <div className="text-2xl font-black text-red-600 mt-1">
                    {policySimResult.afterNonCompliantCount} Institutions
                  </div>
                  <span className="text-[10px] text-red-500 font-bold">{policySimResult.impactPercentage}</span>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-amber-700 dark:text-amber-300 block font-semibold">Newly Impacted Deficient Colleges</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    +{policySimResult.newlyImpactedCount} Colleges
                  </div>
                  <span className="text-[10px] text-amber-600">Requires Open Faculty Recruitment</span>
                </div>
              </div>

              {/* Before vs After Bar Chart */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Regulatory Impact Comparison: Baseline vs Simulated
                </h4>

                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: 'Technical Colleges',
                          Baseline: policySimResult.beforeNonCompliantCount,
                          Simulated: policySimResult.afterNonCompliantCount
                        }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="Baseline" fill="#3B82F6" name="Baseline (1:20)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Simulated" fill="#EF4444" name={`Simulated (${policySimResult.simulatedThreshold})`} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* List of newly impacted colleges */}
              {policySimResult.newlyImpactedInstitutions.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-3 text-xs">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Colleges Pushed into Deficiency Under Proposed Ratio ({policySimResult.newlyImpactedInstitutions.length})
                  </h4>
                  <div className="space-y-2">
                    {policySimResult.newlyImpactedInstitutions.map((i: any) => (
                      <div key={i.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{i.name}</span>
                          <span className="text-[11px] text-slate-500 block">State: {i.state}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-red-500">Current FSR: {i.currentFsr}</span>
                          <span className="text-[10px] text-slate-400 block">Violates proposed {policySimResult.simulatedThreshold}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: INSTITUTION SEAT EXPANSION SIMULATOR --- */}
      {activeTab === 'institution_expansion' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Institutional Expansion Readiness Simulator
            </h3>
            <p className="text-xs text-slate-500">
              "If I add 60 seats in ECE, what extra faculty members, lab area, and computing terminals do I need to remain compliant?"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Target Discipline</label>
                <select
                  value={courseName}
                  onChange={e => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  <option value="Electronics & Communication Engineering (UG)">Electronics & Communication Engineering (UG)</option>
                  <option value="Computer Science & Engineering (UG)">Computer Science & Engineering (UG)</option>
                  <option value="Artificial Intelligence & Data Science (UG)">Artificial Intelligence & Data Science (UG)</option>
                  <option value="Mechanical Engineering (UG)">Mechanical Engineering (UG)</option>
                  <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Proposed Additional Intake (Seats): <strong className="text-aicte-600">{seatAdd} Seats</strong>
                </label>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="30"
                  value={seatAdd}
                  onChange={e => setSeatAdd(Number(e.target.value))}
                  className="w-full accent-aicte-600 cursor-pointer mt-2"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>+30 Seats</span>
                  <span>+60 Seats</span>
                  <span>+120 Seats</span>
                  <span>+180 Seats</span>
                </div>
              </div>
            </div>

            <button
              onClick={runExpansionSimulation}
              className="px-5 py-2.5 rounded-xl bg-[#1F3864] hover:bg-aicte-700 text-white font-bold text-xs shadow-md transition"
            >
              Calculate Statutory Resource Requirements
            </button>
          </div>

          {expansionResult && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-6 animate-in fade-in">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Statutory Resource Blueprint for +{expansionResult.addedSeats} Seats in {expansionResult.courseType}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-center space-y-1">
                  <span className="text-slate-400 block text-[10px]">Additional Faculty Required</span>
                  <span className="text-2xl font-black text-aicte-600 dark:text-saffron-400">
                    +{expansionResult.extraFacultyNeeded} Faculty
                  </span>
                  <span className="text-[10px] text-slate-500">1:20 Cadre Ratio</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-center space-y-1">
                  <span className="text-slate-400 block text-[10px]">Instructional Carpet Space</span>
                  <span className="text-2xl font-black text-govteal-600 dark:text-govteal-400">
                    +{expansionResult.extraInstructionalAreaSqM} sq.m
                  </span>
                  <span className="text-[10px] text-slate-500">4.5 sq.m/student</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-center space-y-1">
                  <span className="text-slate-400 block text-[10px]">Desktop Terminals</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    +{expansionResult.extraComputersNeeded} Nodes
                  </span>
                  <span className="text-[10px] text-slate-500">1:4 Ratio with Broadband</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-center space-y-1">
                  <span className="text-slate-400 block text-[10px]">Estimated Equipment Budget</span>
                  <span className="text-2xl font-black text-amber-500">
                    ₹{expansionResult.additionalLabEquipBudgetEstLakhs} Lakhs
                  </span>
                  <span className="text-[10px] text-slate-500">Model Lab Kit</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block text-xs">Statutory Recommendation:</span>
                {expansionResult.recommendation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: NO-CODE STATUTORY RULE BUILDER --- */}
      {activeTab === 'rule_builder' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-gov space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              No-Code Statutory Compliance Rule Authoring
            </h3>
            <p className="text-slate-500 mt-0.5">
              Draft, version, and activate machine-readable rules for the AICTE Approval Process Handbook (APH 2026).
            </p>
          </div>

          {ruleSaveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold animate-in fade-in">
              {ruleSaveSuccess}
            </div>
          )}

          <form onSubmit={handleCreateRule} className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Rule Title</label>
              <input
                type="text"
                required
                value={newRuleTitle}
                onChange={e => setNewRuleTitle(e.target.value)}
                placeholder="e.g. Minimum High-Performance GPU Computing Cluster for AI UG Degree"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">APH Clause Reference</label>
                <input
                  type="text"
                  required
                  value={newRuleClause}
                  onChange={e => setNewRuleClause(e.target.value)}
                  placeholder="e.g. Clause 8.9 / Table 8.4"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={newRuleCategory}
                  onChange={e => setNewRuleCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  <option value="Faculty">Faculty</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Safety">Safety</option>
                  <option value="Academics">Academics</option>
                  <option value="Governance">Governance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Metric Code</label>
                <input
                  type="text"
                  required
                  value={newRuleMetric}
                  onChange={e => setNewRuleMetric(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Operator</label>
                <select
                  value={newRuleOperator}
                  onChange={e => setNewRuleOperator(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  <option value=">=">&gt;= (Greater or Equal)</option>
                  <option value="<=">&lt;= (Less or Equal)</option>
                  <option value="==">== (Exact Match)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Threshold</label>
                <input
                  type="text"
                  required
                  value={newRuleThreshold}
                  onChange={e => setNewRuleThreshold(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Statutory Severity</label>
              <select
                value={newRuleSeverity}
                onChange={e => setNewRuleSeverity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
              >
                <option value="Critical">Critical (Immediate Show-Cause)</option>
                <option value="High">High (Score Deduction)</option>
                <option value="Medium">Medium (Advisory Warning)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Official Handbook Description</label>
              <textarea
                rows={2}
                value={newRuleDesc}
                onChange={e => setNewRuleDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold bg-[#1F3864] hover:bg-aicte-700 text-white text-xs shadow-md transition"
            >
              Publish & Version New APH Rule
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
