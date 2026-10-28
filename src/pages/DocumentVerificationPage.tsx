import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileCheck2,
  UploadCloud,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Hash,
  Eye,
  FileText,
  UserX,
  Copy,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { VerifiedDocument, FacultyRecord } from '../types';

export const DocumentVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upload_verify' | 'fraud_matrix' | 'documents_list'>('upload_verify');
  const [documents, setDocuments] = useState<VerifiedDocument[]>([]);
  const [ghostFaculty, setGhostFaculty] = useState<FacultyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload Simulation State
  const [uploadDocType, setUploadDocType] = useState('Fire Safety Certificate (NOC)');
  const [fileName, setFileName] = useState('SPCE_Municipal_Fire_NOC_2026.pdf');
  const [simulateDuplicate, setSimulateDuplicate] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [uploadedResult, setUploadedResult] = useState<VerifiedDocument | null>(null);

  const fetchDocsData = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments();
      setDocuments(data.documents);
      setGhostFaculty(data.fraudDetection.ghostFaculty);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocsData();
  }, []);

  const handleSimulatedUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingOcr(true);
    setUploadedResult(null);

    try {
      const newDoc = await api.uploadDocument({
        institutionId: '1-6079889766',
        docType: uploadDocType,
        fileName: fileName,
        simulateDuplicate: simulateDuplicate
      });

      setTimeout(() => {
        setIsProcessingOcr(false);
        setUploadedResult(newDoc);
        setDocuments(prev => [newDoc, ...prev]);
      }, 1200);
    } catch (e) {
      setIsProcessingOcr(false);
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-aicte-100 text-aicte-800 dark:bg-aicte-950 dark:text-saffron-300">
              Module 8: Forensic Fraud Detection & OCR
            </span>
            <span className="text-xs text-slate-400">Cryptographic Document Integrity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Document Verification & Cross-Institution Fraud Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Forensic OCR field extraction, duplicate certificate hash matching, and pan-India ghost faculty detection.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('upload_verify')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'upload_verify'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload & Forensic OCR Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('fraud_matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'fraud_matrix'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <UserX className="w-4 h-4 text-red-500" />
          <span>Ghost Faculty & Duplicate Deed Matrix</span>
          <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
            2
          </span>
        </button>

        <button
          onClick={() => setActiveTab('documents_list')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'documents_list'
              ? 'border-aicte-600 text-aicte-600 dark:text-saffron-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Verified Documents Dossier ({documents.length})</span>
        </button>
      </div>

      {/* --- TAB 1: UPLOAD & FORENSIC OCR SCANNER --- */}
      {activeTab === 'upload_verify' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Form Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-aicte-600" />
                  <span>Upload Statutory Deed for OCR & Tamper Analysis</span>
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Simulate document ingestion. Runs instant OCR, expiry calculation, and cryptographic hash collision check.
                </p>
              </div>

              <form onSubmit={handleSimulatedUpload} className="space-y-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Select Document Category
                  </label>
                  <select
                    value={uploadDocType}
                    onChange={e => setUploadDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    <option value="Fire Safety Certificate (NOC)">State Fire & Life Safety Certificate (NOC)</option>
                    <option value="Building Completion Certificate">Registered Building Plan & Completion Certificate</option>
                    <option value="Faculty Aadhaar Master Roll">Faculty Aadhaar Biometric Master Roster</option>
                    <option value="Audited Balance Sheet">Audited Financial Balance Sheet (FY 24-25)</option>
                    <option value="Land Title & Encumbrance Certificate">Land Title & Revenue Non-Encumbrance Deed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Simulated File Name
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={e => setFileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
                  />
                </div>

                {/* Fraud Demonstration Toggle */}
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 dark:text-amber-200">
                    <input
                      type="checkbox"
                      checked={simulateDuplicate}
                      onChange={e => setSimulateDuplicate(e.target.checked)}
                      className="rounded text-red-600 w-4 h-4"
                    />
                    <span>⚡ Simulate Duplicate / Reused Document Fraud (Live Test)</span>
                  </label>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 pl-6">
                    If checked, generates the identical byte hash as Apex Meerut campus deed to test the fraud shield alert.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingOcr}
                  className="w-full py-3 rounded-xl font-bold bg-[#1F3864] hover:bg-aicte-700 text-white transition flex items-center justify-center gap-2 shadow-md"
                >
                  {isProcessingOcr ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Running AICTE Forensic OCR & Hash Comparison...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>Scan & Verify Document Authenticity</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* OCR Live Result Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4 text-xs">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-govteal-600" />
                <span>Forensic OCR Field Extraction Report</span>
              </h3>

              {uploadedResult ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-sm">
                        {uploadedResult.docType}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        File: {uploadedResult.fileName}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        uploadedResult.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : uploadedResult.status === 'Suspicious'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {uploadedResult.status}
                    </span>
                  </div>

                  {/* OCR Extracted Fields */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Extracted Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{uploadedResult.ocrExtracted.instituteNameExtracted}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Issue Date:</span>
                      <span className="text-slate-700 dark:text-slate-300">{uploadedResult.ocrExtracted.issueDate}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Valid Till:</span>
                      <span className="font-bold text-red-500">{uploadedResult.ocrExtracted.validTill}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-500">Registration Number:</span>
                      <span className="font-bold">{uploadedResult.ocrExtracted.regNumber}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">OCR Confidence:</span>
                      <span className="text-emerald-600 font-bold">{uploadedResult.ocrExtracted.confidence}%</span>
                    </div>
                  </div>

                  {/* Cryptographic SHA-256 Fingerprint */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border text-[10px] space-y-1">
                    <span className="text-slate-400 block font-bold uppercase">Cryptographic SHA-256 Hash:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300 break-all">{uploadedResult.hash}</span>
                  </div>

                  {/* Tamper / Duplicate Flags */}
                  {uploadedResult.flags.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 space-y-1 text-red-800 dark:text-red-300">
                      <span className="font-bold block flex items-center gap-1.5 text-xs">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Forensic Discrepancy Alert Flagged:
                      </span>
                      <ul className="list-disc list-inside text-[11px] space-y-0.5">
                        {uploadedResult.flags.map((flg, idx) => (
                          <li key={idx}>{flg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p>Upload a document from the left form to view live forensic field extraction.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: FRAUD DETECTION MATRIX (GHOST FACULTY & REUSED DEEDS) --- */}
      {activeTab === 'fraud_matrix' && (
        <div className="space-y-6">
          {/* Ghost Faculty Flag */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-gov space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                  <UserX className="w-5 h-5" />
                  <span>Ghost Faculty Cross-Collision Detection (PAN / Aadhaar Deduplication)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time detection of faculty members simultaneously declared as full-time by multiple colleges.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse">
                Critical Integrity Alert
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border rounded-2xl overflow-hidden">
                <thead className="bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 font-bold border-b">
                  <tr>
                    <th className="p-3">Faculty Name</th>
                    <th className="p-3">Hashed PAN / Aadhaar</th>
                    <th className="p-3">Primary Claiming College</th>
                    <th className="p-3">Simultaneous Secondary College</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Action Enacted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="bg-red-50/20 dark:bg-red-950/10">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">Dr. Ramesh Verma</td>
                    <td className="p-3 font-mono font-bold text-red-600">ABCDE1234F</td>
                    <td className="p-3 font-medium">Sardar Patel College of Engg, Mumbai</td>
                    <td className="p-3 font-medium text-red-600 font-bold">College of Engineering, Pune (COEP)</td>
                    <td className="p-3">Civil Engineering</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                        Level 1 Deficiency Issued
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Reused Document Hash Fraud */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Copy className="w-5 h-5 text-amber-500" />
              <span>Duplicate / Reused Document Hash Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Flags identical architectural blue-prints or completion certificates submitted under two different trust IDs.
            </p>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
              <div className="flex justify-between font-mono font-bold text-amber-800 dark:text-amber-300">
                <span>DOC-2026-003: Building Completion Plan</span>
                <span>Byte Collision: 100% Match</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                The byte hash <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded">c7d6b5a4...09876</code> uploaded by <strong>Apex Global Institute (Greater Noida)</strong> is an exact cryptographic clone of deed previously registered by <strong>Apex Meerut Campus</strong>.
              </p>
              <div className="text-[11px] text-red-600 font-bold">
                Action: Formal Show-Cause Hearing Scheduled under Chapter X.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: DOCUMENTS REPOSITORY --- */}
      {activeTab === 'documents_list' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              All Verified Institutional Documents ({documents.length})
            </h3>
            <span className="text-xs text-slate-400">OCR Forensically Scanned</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b">
                <tr>
                  <th className="p-3">Doc ID</th>
                  <th className="p-3">Document Category</th>
                  <th className="p-3">Institution Name</th>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Valid Till</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Hash Fingerprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-aicte-600 dark:text-saffron-400">{d.id}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{d.docType}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{d.institutionName}</td>
                    <td className="p-3 font-mono text-slate-500 max-w-[180px] truncate">{d.fileName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{d.ocrExtracted.validTill}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : d.status === 'Suspicious'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400 max-w-[120px] truncate">
                      {d.hash.substring(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
