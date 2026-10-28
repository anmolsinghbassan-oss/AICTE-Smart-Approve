import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarCheck,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  Clock,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  UploadCloud,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Inspection, Institution } from '../types';

export const InspectionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInsp, setSelectedInsp] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);

  // Offline Mode Simulation
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [queuedSyncCount, setQueuedSyncCount] = useState(0);

  // Inspector Checklist State for Active Inspection
  const [checklist, setChecklist] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([
    {
      name: 'Computer_Laboratory_Cluster_GeoTagged.jpg',
      geotag: '12.9237° N, 77.4987° E (Mysore Rd Campus)',
      time: '18-Oct-2026 11:42 AM IST',
      verified: true
    }
  ]);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Schedule New Inspection Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedInstId, setSchedInstId] = useState('1-2789989966');
  const [schedMode, setSchedMode] = useState<'Physical Visit' | 'Virtual Scrutiny'>('Physical Visit');
  const [schedLead, setSchedLead] = useState('Er. Priya Patel (Inspection Head)');

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const data = await api.getInspections();
      setInspections(data);
      const insts = await api.getInstitutions();
      setInstitutions(insts);
      if (data.length > 0) {
        setSelectedInsp(data[0]);
        setChecklist(data[0].checklist);
        setReportSummary(data[0].reportSummary || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleToggleCheck = (index: number) => {
    setChecklist(prev => {
      const updated = [...prev];
      updated[index].verified = !updated[index].verified;
      return updated;
    });
    if (isOfflineMode) {
      setQueuedSyncCount(c => c + 1);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedInsp) return;

    if (isOfflineMode) {
      setQueuedSyncCount(c => c + 1);
      setSubmitSuccess('Report saved locally in offline queue. Will auto-sync when network connects.');
      setTimeout(() => setSubmitSuccess(''), 4000);
      return;
    }

    try {
      const updated = await api.submitInspectionReport(selectedInsp.id, {
        checklist,
        reportSummary: reportSummary || 'Statutory physical verification completed. Campus adheres to APH 2026 standards.'
      });
      setSelectedInsp(updated);
      setInspections(prev => prev.map(i => i.id === updated.id ? updated : i));
      setSubmitSuccess('Inspection Report formally submitted to Central Scrutiny Committee.');
      setTimeout(() => setSubmitSuccess(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newInsp = await api.scheduleInspection({
        institutionId: schedInstId,
        mode: schedMode,
        leadInspector: schedLead
      });
      setInspections(prev => [newInsp, ...prev]);
      setSelectedInsp(newInsp);
      setChecklist(newInsp.checklist);
      setShowScheduleModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulatePhotoUpload = () => {
    const newPhoto = {
      name: `Field_Inspection_Photo_${Date.now().toString().slice(-4)}.jpg`,
      geotag: selectedInsp?.geotagSimulated ? `${selectedInsp.geotagSimulated.lat}° N, ${selectedInsp.geotagSimulated.lng}° E (${selectedInsp.geotagSimulated.locationName})` : '18.5293° N, 73.8565° E',
      time: new Date().toLocaleString(),
      verified: true
    };
    setUploadedPhotos(prev => [...prev, newPhoto]);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-aicte-100 text-aicte-800 dark:bg-aicte-950 dark:text-saffron-300">
              Module 9: Field Oversight
            </span>
            <span className="text-xs text-slate-400">Risk-Calibrated Scrutiny</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Risk-Based Inspection Management & Geotagged Reporting
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Surprise physical visits for high-risk institutions, virtual scrutiny for low-risk campuses, and offline-sync checklists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Offline Mode Toggle Button */}
          <button
            onClick={() => {
              setIsOfflineMode(!isOfflineMode);
              if (isOfflineMode && queuedSyncCount > 0) {
                setQueuedSyncCount(0);
                setSubmitSuccess(`Synced ${queuedSyncCount} pending offline changes with central AICTE server.`);
                setTimeout(() => setSubmitSuccess(''), 4000);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              isOfflineMode
                ? 'bg-amber-500 text-slate-900 border border-amber-600 animate-pulse'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
            <span>{isOfflineMode ? `Offline Mode (${queuedSyncCount} queued)` : 'Online Sync'}</span>
          </button>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aicte-600 hover:bg-aicte-700 text-white font-bold text-xs shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule New Inspection</span>
          </button>
        </div>
      </div>

      {/* Offline Alert Banner */}
      {isOfflineMode && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Field Offline Mode Active:</strong> Inspectors can verify checklists and capture geotagged photos in remote campus zones without cell connectivity. Data is cached locally and will synchronize automatically when online.
            </span>
          </div>
          <span className="font-bold text-xs">{queuedSyncCount} Changes Cached</span>
        </div>
      )}

      {submitSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
          {submitSuccess}
        </div>
      )}

      {/* Main Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scheduled Inspections List */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Scheduled Inspections ({inspections.length})
          </h3>

          <div className="space-y-3">
            {inspections.map(insp => {
              const isSelected = selectedInsp?.id === insp.id;
              const isPhysical = insp.mode === 'Physical Visit';

              return (
                <div
                  key={insp.id}
                  onClick={() => {
                    setSelectedInsp(insp);
                    setChecklist(insp.checklist);
                    setReportSummary(insp.reportSummary || '');
                  }}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition shadow-xs ${
                    isSelected
                      ? 'bg-aicte-50/70 dark:bg-slate-800 border-aicte-600 dark:border-saffron-400 font-medium shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span
                      className={`px-2 py-0.5 rounded uppercase ${
                        isPhysical
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {insp.mode}
                    </span>
                    <span className="font-mono text-slate-400">{insp.id}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white mt-2">
                    {insp.institutionName}
                  </h4>

                  <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                    <div>Lead: {insp.leadInspector}</div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      Date: {insp.scheduledDate}
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold text-aicte-600 dark:text-saffron-400">{insp.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Inspector Field Checklist & Geotagged Reporting */}
        <div className="lg:col-span-2 space-y-6">
          {selectedInsp ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-6 text-xs">
              {/* Inspection Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-aicte-600 dark:text-saffron-400">
                      {selectedInsp.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                      {selectedInsp.mode}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedInsp.institutionName}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>
                    {selectedInsp.geotagSimulated?.lat}° N, {selectedInsp.geotagSimulated?.lng}° E ({selectedInsp.geotagSimulated?.locationName})
                  </span>
                </div>
              </div>

              {/* Committee Members */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Empaneled Expert Committee:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Lead Inspector: <strong>{selectedInsp.leadInspector}</strong> | Members: {selectedInsp.committeeMembers.join(', ')}
                </p>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Statutory On-Site Verification Checklist
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {checklist.filter(c => c.verified).length} of {checklist.length} Verified
                  </span>
                </div>

                <div className="space-y-2">
                  {checklist.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleCheck(idx)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                        item.verified
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                            item.verified
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                          }`}
                        >
                          {item.verified && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <span className="font-medium">{item.item}</span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.remarks}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geotagged Photo Upload Simulation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-aicte-600" />
                    <span>Geotagged & Timestamped Evidence Photos</span>
                  </h4>
                  <button
                    onClick={handleSimulatePhotoUpload}
                    className="px-3 py-1 rounded-lg bg-aicte-50 dark:bg-slate-800 text-aicte-600 dark:text-saffron-400 font-bold text-[11px] hover:bg-aicte-100"
                  >
                    + Capture Camera Snapshot
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uploadedPhotos.map((photo, pIdx) => (
                    <div key={pIdx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white">
                        <span className="truncate max-w-[180px]">{photo.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Geotag Matched
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        📍 {photo.geotag}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        🕒 {photo.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Summary & Submission */}
              <div className="space-y-2">
                <label className="block text-slate-700 dark:text-slate-300 font-medium">
                  Executive Inspection Committee Recommendation
                </label>
                <textarea
                  rows={3}
                  value={reportSummary}
                  onChange={e => setReportSummary(e.target.value)}
                  placeholder="Enter final recommendation regarding course approval or deficit notice..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSubmitReport}
                  className="px-6 py-2.5 rounded-xl font-bold bg-[#1F3864] hover:bg-aicte-700 text-white text-xs transition shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Submit Final Scrutiny Report to Workflow</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select an inspection on the left to review the field checklist.
            </div>
          )}
        </div>
      </div>

      {/* Schedule Inspection Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border rounded-3xl p-6 text-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Schedule Statutory Inspection</h4>
            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Target College</label>
                <select
                  value={schedInstId}
                  onChange={e => setSchedInstId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  {institutions.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Risk: {i.riskLevel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Inspection Mode</label>
                <select
                  value={schedMode}
                  onChange={e => setSchedMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  <option value="Physical Visit">Surprise Physical Visit (For High/Critical Risk)</option>
                  <option value="Virtual Scrutiny">Virtual Remote Scrutiny (For Low/Medium Risk)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Lead Inspector</label>
                <input
                  type="text"
                  value={schedLead}
                  onChange={e => setSchedLead(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-aicte-600 text-white font-bold hover:bg-aicte-700"
                >
                  Schedule Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
