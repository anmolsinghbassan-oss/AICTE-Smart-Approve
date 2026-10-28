import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Building2,
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UploadCloud,
  RefreshCw,
  Edit3,
  Search,
  Filter,
  History,
  Bot,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  Info,
  Check,
  Eye,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Institution, VerifiedDocument, Application } from '../types';

export const InstituteDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dossier, setDossier] = useState<{
    institution: Institution;
    documents: VerifiedDocument[];
    applications: Application[];
    alerts: any[];
    stats: {
      totalDocuments: number;
      pendingVerification: number;
      approvedDocuments: number;
      rejectedDocuments: number;
    };
    verificationStatus: string;
  } | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<VerifiedDocument | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    contactPhone: '',
    contactEmail: '',
    principalName: '',
    address: ''
  });
  const [newDocForm, setNewDocForm] = useState({
    docType: 'Fire Safety Certificate (NOC)',
    fileName: '',
    notes: ''
  });
  const [replaceForm, setReplaceForm] = useState({
    fileName: '',
    remarks: ''
  });

  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadDossier = async () => {
    try {
      setLoading(true);
      const data = await api.getInstituteDossier(user?.institutionId);
      setDossier(data);
      if (data.institution) {
        setProfileForm({
          contactPhone: data.institution.contactPhone || '',
          contactEmail: data.institution.contactEmail || '',
          principalName: data.institution.principalName || '',
          address: data.institution.address || ''
        });
      }
    } catch (err) {
      console.error('Error loading institute dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDossier();
  }, [user]);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateInstituteProfile({
        institutionId: dossier?.institution.id,
        ...profileForm
      });
      setEditProfileModalOpen(false);
      showToast('Institutional profile and contact details updated successfully.');
      loadDossier();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleUploadNewDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.fileName) return;

    try {
      await api.uploadInstituteDocument({
        institutionId: dossier?.institution.id,
        docType: newDocForm.docType,
        fileName: newDocForm.fileName,
        notes: newDocForm.notes
      });
      setUploadModalOpen(false);
      setNewDocForm({ docType: 'Fire Safety Certificate (NOC)', fileName: '', notes: '' });
      showToast('Document uploaded successfully and queued for statutory verification.');
      loadDossier();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    }
  };

  const handleReplaceDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !replaceForm.fileName) return;

    try {
      await api.replaceInstituteDocument(selectedDoc.id, {
        fileName: replaceForm.fileName,
        remarks: replaceForm.remarks
      });
      setReplaceModalOpen(false);
      setSelectedDoc(null);
      setReplaceForm({ fileName: '', remarks: '' });
      showToast('Corrected document submitted. Status reset to Pending for re-scrutiny.');
      loadDossier();
    } catch (err: any) {
      alert(err.message || 'Replace failed');
    }
  };

  const handleRequestReverification = async (doc: VerifiedDocument) => {
    try {
      await api.reverifyInstituteDocument(doc.id, {
        notes: 'Institution requested priority re-scrutiny after uploading rectifications.'
      });
      showToast(`Re-verification request submitted for ${doc.docType}.`);
      loadDossier();
    } catch (err: any) {
      alert(err.message || 'Failed to request re-verification');
    }
  };

  // Filtered documents
  const filteredDocs = (dossier?.documents || []).filter(doc => {
    const matchesSearch =
      doc.docType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const docStatus = (doc.verificationStatus || doc.status || '').toLowerCase();
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'approved') return matchesSearch && (docStatus.includes('approved') || docStatus.includes('verified'));
    if (filterStatus === 'pending') return matchesSearch && (docStatus.includes('pending') || docStatus.includes('attention'));
    if (filterStatus === 'rejected') return matchesSearch && (docStatus.includes('rejected') || docStatus.includes('suspicious'));
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading Institute Dossier & Records...</p>
      </div>
    );
  }

  const inst = dossier?.institution;
  const stats = dossier?.stats || { totalDocuments: 0, pendingVerification: 0, approvedDocuments: 0, rejectedDocuments: 0 };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Banner: Institute Identity & Verification Status */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1F3864] to-blue-600 p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-[#1F3864] rounded-[14px] flex items-center justify-center text-white">
                <Building2 className="w-7 h-7 text-blue-200" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#1F3864] border border-blue-200">
                  {t('institute.registeredBadge')}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    dossier?.verificationStatus === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : dossier?.verificationStatus?.includes('Deficient')
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {t('common.status')}: {dossier?.verificationStatus || t('common.verified')}
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                {inst?.name || user?.institutionName || 'College of Engineering, Pune'}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>
                  {t('institute.permanentId')}: <strong className="font-mono text-[#1F3864]">{inst?.id || user?.institutionId}</strong>
                </span>
                <span>•</span>
                <span>{t('institute.state')}: <strong className="text-slate-700">{inst?.state}</strong></span>
                <span>•</span>
                <span>{t('institute.region')}: <strong className="text-slate-700">{inst?.region} Region</strong></span>
                <span>•</span>
                <span>{t('institute.discipline')}: <strong className="text-slate-700">{inst?.discipline}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold bg-[#1F3864] hover:bg-blue-800 text-white text-xs shadow-sm transition flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4 text-blue-200" />
              <span>{t('institute.uploadNew')}</span>
            </button>

            <button
              onClick={() => setEditProfileModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200 transition flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>{t('institute.editProfile')}</span>
            </button>

            <Link
              to="/approval-process"
              className="px-3.5 py-2.5 rounded-xl font-semibold bg-blue-50 hover:bg-blue-100 text-[#1F3864] text-xs border border-blue-200 transition flex items-center gap-1.5"
            >
              <span>{t('nav.approvalProcess')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Section D: Dashboard Overview (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {t('institute.totalDocs')}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats.totalDocuments}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">{t('institute.totalDocsSub')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1F3864] border border-blue-100 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              {t('institute.pendingDocs')}
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {stats.pendingVerification}
            </span>
            <span className="text-[11px] text-amber-700/80 mt-0.5 block">{t('institute.pendingDocsSub')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Approved Documents */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              {t('institute.approvedDocs')}
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {stats.approvedDocuments}
            </span>
            <span className="text-[11px] text-emerald-700/80 mt-0.5 block">{t('institute.approvedDocsSub')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Rejected Documents */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
              {t('institute.rejectedDocs')}
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {stats.rejectedDocuments}
            </span>
            <span className="text-[11px] text-rose-700/80 mt-0.5 block">{t('institute.rejectedDocsSub')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Column = Section A Profile + Section F AI Assistant; Right Column = Section B/C Document Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col): Section A Institutional Profile Card & AI Box */}
        <div className="space-y-6 lg:col-span-1">
          {/* Institutional Profile Summary Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1F3864]" />
                <span>{t('institute.profileTitle')}</span>
              </h2>
              <button
                onClick={() => setEditProfileModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                {t('common.edit')}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('common.institution')}</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{inst?.name}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('institute.principal')}</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {inst?.principalName || 'Dr. Authorized Head'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('institute.discipline')}</span>
                  <span className="font-medium text-slate-700 block mt-0.5">{inst?.discipline || 'Engineering'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('institute.state')}</span>
                  <span className="font-medium text-slate-700 block mt-0.5">{inst?.state}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('institute.email')}</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-[11px]">{inst?.contactEmail || 'registrar@college.ac.in'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('institute.phone')}</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-[11px]">{inst?.contactPhone || '+91 20 2550 7000'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('institute.address')}</span>
                <div className="flex items-start gap-1.5 mt-0.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[11px] leading-relaxed">{inst?.address || 'Main Campus, Maharashtra'}</span>
                </div>
              </div>

              {/* Compliance & Risk Badge */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">{t('institute.complianceScore')}</span>
                  <span className="text-xs font-black text-[#1F3864]">
                    {inst?.complianceScore || 96} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      (inst?.complianceScore || 96) >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${inst?.complianceScore || 96}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section F: AI Assistant Quick Help Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#1F3864]">
              <div className="w-8 h-8 rounded-xl bg-[#1F3864] text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F3864]">
                  Statutory AI Assistant
                </h3>
                <span className="text-[10px] text-slate-500">Multilingual Scrutiny Co-Pilot</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ask questions regarding your uploaded documents, Fire NOC statutory clauses, deficiency rectifications, or application progress. Available in Hindi, English, Marathi, Tamil, and Bengali.
            </p>

            <div className="space-y-1.5 pt-1">
              {[
                'Why is my application stuck?',
                'How do I re-upload a rejected Fire NOC?',
                'What is the minimum FSR ratio for 2026?'
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    // Open floating assistant or fire question event
                    window.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { query: q } }));
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 text-[11px] text-slate-700 font-medium transition flex items-center justify-between group"
                >
                  <span>{q}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity Mini-Feed */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#1F3864]" />
              <span>Institutional Activity Feed</span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 block">Today, 10:15 AM</span>
                <span className="font-semibold text-slate-800">Extension of Approval (EoA) under Scrutiny</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Automated document check passed with 96% confidence score.</p>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-slate-400 block">24-Oct-2026</span>
                <span className="font-semibold text-slate-800">Document Uploaded: Faculty Relieving Deed</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Submitted in response to scrutiny discrepancy notice.</p>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-slate-400 block">10-Sep-2026</span>
                <span className="font-semibold text-slate-800">Fire Safety Certificate Verified</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Scrutinized and authenticated with municipal records.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2 cols): Section B Document Management & Section C Verification Tracking */}
        <div className="space-y-6 lg:col-span-2">
          {/* Document Management Container */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-[#1F3864]" />
                  <span>{t('institute.docManagement')}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload required statutory files, track real-time verification statuses, and re-upload deficient items.
                </p>
              </div>

              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#1F3864] hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 flex-shrink-0"
              >
                <UploadCloud className="w-4 h-4 text-blue-200" />
                <span>{t('institute.uploadNew')}</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('institute.searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: t('institute.filterAll') },
                  { id: 'approved', label: t('institute.filterApproved') },
                  { id: 'pending', label: t('institute.filterPending') },
                  { id: 'rejected', label: t('institute.filterRejected') }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      filterStatus === tab.id
                        ? 'bg-[#1F3864] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Documents List Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">{t('institute.colDocName')}</th>
                    <th className="p-3.5">{t('institute.colUploadDate')}</th>
                    <th className="p-3.5">{t('institute.colStatus')}</th>
                    <th className="p-3.5">{t('institute.colAudit')}</th>
                    <th className="p-3.5 text-right">{t('institute.colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No documents found matching the search or status filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc, idx) => {
                      const isApproved =
                        doc.verificationStatus === 'Approved' || doc.status === 'Verified';
                      const isRejected =
                        doc.verificationStatus === 'Rejected' || doc.status === 'Suspicious';
                      const isPending =
                        doc.verificationStatus === 'Pending' || doc.status === 'Needs Attention' || doc.status === 'Pending';

                      return (
                        <tr key={doc.id || idx} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5">
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : isRejected
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{doc.docType}</span>
                                <span className="font-mono text-[11px] text-slate-500 block">
                                  {doc.fileName}
                                </span>
                                {doc.rejectionReason && (
                                  <div className="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                                    <strong className="font-bold">Deficiency / Rejection Reason:</strong>{' '}
                                    {doc.rejectionReason}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-slate-600">
                            {doc.uploadDate || '2026-09-10'}
                          </td>

                          <td className="p-3.5">
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{t('institute.statusApproved')}</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>{t('institute.statusPending')}</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>{t('institute.statusRejected')}</span>
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-500 text-[11px]">
                            {doc.ocrExtracted?.validTill && (
                              <div>
                                Valid Till: <strong className="font-mono">{doc.ocrExtracted.validTill}</strong>
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Confidence: {doc.ocrExtracted?.confidence || 96}%
                            </div>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Re-Upload / Replace Button */}
                              <button
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setReplaceForm({ fileName: '', remarks: '' });
                                  setReplaceModalOpen(true);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                  isRejected
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs animate-pulse'
                                    : 'bg-blue-50 hover:bg-blue-100 text-[#1F3864] border border-blue-200'
                                }`}
                                title="Upload updated version to replace this document"
                              >
                                {isRejected ? t('institute.reupload') : t('common.edit')}
                              </button>

                              {/* View Upload History */}
                              <button
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setHistoryModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition"
                                title="View revision and upload history"
                              >
                                {t('institute.history')}
                              </button>

                              {/* Request Re-verification */}
                              {isPending && (
                                <button
                                  onClick={() => handleRequestReverification(doc)}
                                  className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200 transition"
                                  title="Request immediate re-verification"
                                >
                                  {t('institute.reverify')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: EDIT PROFILE MODAL --- */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#1F3864]" />
                <span>{t('institute.modalEditTitle')}</span>
              </h3>
              <button
                onClick={() => setEditProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Principal / Registrar In-Charge
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.principalName}
                  onChange={e => setProfileForm({ ...profileForm, principalName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Official Statutory Email
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.contactEmail}
                  onChange={e => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Official Contact Telephone
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.contactPhone}
                  onChange={e => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Physical Campus Address
                </label>
                <textarea
                  rows={3}
                  required
                  value={profileForm.address}
                  onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1F3864] hover:bg-blue-800 text-white font-bold shadow-xs"
                >
                  {t('institute.saveProfile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: UPLOAD NEW DOCUMENT MODAL --- */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#1F3864]" />
                <span>{t('institute.modalUploadTitle')}</span>
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadNewDocument} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Statutory Document Category
                </label>
                <select
                  value={newDocForm.docType}
                  onChange={e => setNewDocForm({ ...newDocForm, docType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-semibold"
                >
                  <option value="Fire Safety Certificate (NOC)">Fire Safety Certificate (NOC)</option>
                  <option value="Land Ownership & Registered Title Deed">Land Ownership & Registered Title Deed</option>
                  <option value="Building Completion & Occupancy Certificate">Building Completion & Occupancy Certificate</option>
                  <option value="Barrier-Free Divyangjan Accessibility Audit Certificate">Barrier-Free Divyangjan Accessibility Audit Certificate</option>
                  <option value="AICTE Mandatory Public Disclosure 2026">AICTE Mandatory Public Disclosure 2026</option>
                  <option value="Society / Trust Registration Deed">Society / Trust Registration Deed</option>
                  <option value="Faculty Salary Roll & Form 16 Roster">Faculty Salary Roll & Form 16 Roster</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  File Attachment (PDF / Certified Scan)
                </label>
                <div className="border-2 border-dashed border-blue-200 rounded-2xl p-5 text-center bg-blue-50/30">
                  <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Select official stamped PDF file</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maximum file size: 10MB (Vector or 300 DPI scan)</p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setNewDocForm({ ...newDocForm, fileName: e.target.files[0].name });
                      }
                    }}
                    className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1F3864] file:text-white hover:file:bg-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Submission Remarks / Officer Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Renewal receipt from Municipal Corporation Fire Dept"
                  value={newDocForm.notes}
                  onChange={e => setNewDocForm({ ...newDocForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!newDocForm.fileName}
                  className="px-5 py-2 rounded-xl bg-[#1F3864] hover:bg-blue-800 disabled:opacity-50 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4 text-blue-200" />
                  <span>{t('common.submit')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: RE-UPLOAD / REPLACE DOCUMENT MODAL --- */}
      {replaceModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <span>{t('institute.modalReplaceTitle')}</span>
              </h3>
              <button
                onClick={() => setReplaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Current Document</span>
              <span className="font-bold text-slate-900 block mt-0.5">{selectedDoc.docType}</span>
              <span className="font-mono text-[11px] text-slate-600 block">{selectedDoc.fileName}</span>
              {selectedDoc.rejectionReason && (
                <div className="mt-2 text-rose-800 font-medium">
                  <strong>Deficiency:</strong> {selectedDoc.rejectionReason}
                </div>
              )}
            </div>

            <form onSubmit={handleReplaceDocument} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Upload Replacement File (Corrected PDF)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setReplaceForm({ ...replaceForm, fileName: e.target.files[0].name });
                    }
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Correction Remarks & Explanation for Scrutiny Officer
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the changes made (e.g. Attached Fire NOC valid through 2027 with municipal seal on page 4)"
                  value={replaceForm.remarks}
                  onChange={e => setReplaceForm({ ...replaceForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setReplaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!replaceForm.fileName}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('institute.reupload')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: UPLOAD & AUDIT HISTORY MODAL --- */}
      {historyModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-[#1F3864]" />
                <span>{t('institute.modalHistoryTitle')}</span>
              </h3>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Document Target</span>
              <span className="font-bold text-sm text-slate-900 block mt-0.5">{selectedDoc.docType}</span>
              <span className="font-mono text-xs text-slate-500 block">{selectedDoc.fileName}</span>
            </div>

            {/* Timeline */}
            <div className="space-y-3 pt-2">
              {(selectedDoc.history && selectedDoc.history.length > 0 ? selectedDoc.history : [
                {
                  date: selectedDoc.uploadDate,
                  fileName: selectedDoc.fileName,
                  action: 'Initial Statutory Upload',
                  remarks: 'Uploaded by Authorized College Officer'
                }
              ]).map((hist, hIdx) => (
                <div key={hIdx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1F3864]">{hist.action}</span>
                    <span className="font-mono text-[10px] text-slate-400">{hist.date}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600">{hist.fileName}</div>
                  {hist.remarks && (
                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      "{hist.remarks}"
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1F3864] hover:bg-blue-800 text-white font-bold text-xs"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default InstituteDashboardPage;
