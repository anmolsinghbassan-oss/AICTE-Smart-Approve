import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Building,
  Award,
  Calendar,
  Lock,
  ArrowRight,
  ExternalLink,
  Printer,
  FileCheck2,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import { ScannableQRCode } from '../components/ScannableQRCode';

export const PublicVerificationPortalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || 'QR-AICTE-COEP-2026-001';

  const [inputCode, setInputCode] = useState(initialCode);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleCodes = [
    { label: 'COEP Pune (Valid QR)', code: 'QR-AICTE-COEP-2026-001' },
    { label: 'COEP AICTE ID', code: '1-1029384711' },
    { label: 'SPCE Application ID', code: 'APP-2026-1002' },
    { label: 'Fake/Tampered QR', code: 'FAKE-QR-NON-EXISTENT' }
  ];

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || inputCode).trim();
    if (!code) return;

    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const data = await api.verifyPublic(code);
      setVerificationResult(data);
    } catch (err: any) {
      setError(err.message || 'No genuine AICTE approval record found for the provided code or ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Public Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Public Trust Verification Portal — Open to Students, Employers & Public</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Verify AICTE Statutory Approval Certificate
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Scan the QR code printed on the official Extension of Approval (EoA) letter or enter the permanent AICTE ID to authenticate genuine validity.
        </p>
      </div>

      {/* Verification Input Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-gov space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <QrCode className="absolute left-3.5 top-3 w-5 h-5 text-aicte-600" />
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              placeholder="Enter QR Code, AICTE Permanent ID (e.g. 1-1029384711), or Application ID..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-aicte-500 outline-none"
            />
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading}
            className="px-6 py-3 rounded-2xl font-bold bg-[#1F3864] hover:bg-aicte-700 text-white text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Authenticate Certificate'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Sample Search Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Test Cases:
          </span>
          {sampleCodes.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputCode(s.code);
                handleVerify(s.code);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-center space-y-2 animate-in fade-in">
          <XCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-red-800 dark:text-red-300">
            Invalid / Tampered Certificate Alert
          </h3>
          <p className="text-xs text-red-700 dark:text-red-400 max-w-md mx-auto">
            {error}
          </p>
        </div>
      )}

      {/* Verified Certificate Card */}
      {verificationResult && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/80 shadow-2xl space-y-6 text-xs animate-in zoom-in-95 duration-200">
          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                ✓
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                  Officially Authenticated & Genuine
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  AICTE Extension of Approval (EoA) Validated
                </h2>
                <span className="font-mono text-slate-400 text-[11px]">
                  Letter No: AICTE/AB/{verificationResult.academicYear}/{verificationResult.applicationId}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Status</span>
              <span className="text-base font-black text-emerald-600 block">
                {verificationResult.approvalStatus}
              </span>
              <span className="text-[11px] text-slate-500">Valid Till: {verificationResult.validTill}</span>
            </div>
          </div>

          {/* Institution Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Institution Name</span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {verificationResult.institution.name}
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                State: {verificationResult.institution.state} | Region: {verificationResult.institution.region}
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Permanent AICTE ID</span>
              <span className="font-mono font-bold text-aicte-600 dark:text-saffron-400 text-sm block">
                {verificationResult.institution.id}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                Compliance Standing: {verificationResult.institution.complianceScore}/100 (Optimal)
              </span>
            </div>
          </div>

          {/* Course-Wise Approved Intake Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Sanctioned Academic Programs & Approved Intake
            </h4>
            <div className="border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b">
                  <tr>
                    <th className="p-3">Program / Course Name</th>
                    <th className="p-3">Level</th>
                    <th className="p-3 text-right">Approved Intake</th>
                    <th className="p-3">Statutory Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {verificationResult.approvedCourses.map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="p-3">{c.level}</td>
                      <td className="p-3 font-bold text-right font-mono text-aicte-600 dark:text-saffron-400">
                        {c.proposedIntake || c.currentIntake} Seats
                      </td>
                      <td className="p-3 font-bold text-emerald-600">Approved (EoA 2026-27)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scannable Real QR & Cryptographic Seal Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-blue-50/50 dark:bg-slate-800/50 border border-blue-200 dark:border-blue-900/40 items-center">
            <div className="md:col-span-1 flex flex-col items-center">
              <ScannableQRCode
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/public-verification?code=${encodeURIComponent(
                        verificationResult.qrVerificationCode || verificationResult.institution.id
                      )}`
                    : `https://aicte.gov.in/verify?code=${verificationResult.qrVerificationCode}`
                }
                size={160}
                label="Scan with phone camera to verify official AICTE approval"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cryptographically Signed AICTE Statutory Seal</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Tamper-Proof Verification QR Code
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This QR code directly resolves to this genuine AICTE cloud record. Anyone (students, parents, prospective employers, state authorities) can scan this QR code on physical paper documents to confirm legitimacy without requiring portal login.
              </p>
              <div className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 break-all">
                Verification URL: {typeof window !== 'undefined' ? `${window.location.origin}/public-verification?code=${verificationResult.qrVerificationCode || verificationResult.institution.id}` : ''}
              </div>
            </div>
          </div>

          {/* Verified Documents (Public Non-Sensitive Disclosure) */}
          {verificationResult.verifiedDocuments && verificationResult.verifiedDocuments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Publicly Verified Statutory Clearances</span>
                </h4>
                <span className="text-[11px] text-slate-500">Non-sensitive statutory compliance confirmation</span>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b">
                    <tr>
                      <th className="p-3">Clearance / Statutory Deed</th>
                      <th className="p-3">Verified Status</th>
                      <th className="p-3">Validity Window</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {verificationResult.verifiedDocuments.map((doc: any, dIdx: number) => (
                      <tr key={dIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{doc.docType}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {doc.status || 'Verified'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{doc.validTill || 'Permanent'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cryptographic Digital Signature Audit */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Digital Signature Issuer:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {verificationResult.digitalSignature.signedBy}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Algorithm: {verificationResult.digitalSignature.algorithm}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-sans font-semibold text-xs transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
