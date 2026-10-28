const API_BASE = '/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('aicte_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchWithAuth('/auth/me'),

  // Dashboard
  getDashboardStats: () => fetchWithAuth('/dashboard/stats'),
  getInstituteGraph: (id: string) => fetchWithAuth(`/dashboard/institute-graph/${id}`),

  // Dedicated Institute Portal
  getInstituteDossier: (institutionId?: string) =>
    fetchWithAuth(`/institute/dossier${institutionId ? `?institutionId=${encodeURIComponent(institutionId)}` : ''}`),
  updateInstituteProfile: (data: any) =>
    fetchWithAuth('/institute/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadInstituteDocument: (data: any) =>
    fetchWithAuth('/institute/documents/upload', { method: 'POST', body: JSON.stringify(data) }),
  replaceInstituteDocument: (id: string, data: any) =>
    fetchWithAuth(`/institute/documents/${id}/replace`, { method: 'POST', body: JSON.stringify(data) }),
  reverifyInstituteDocument: (id: string, data?: any) =>
    fetchWithAuth(`/institute/documents/${id}/re-verify`, { method: 'POST', body: JSON.stringify(data || {}) }),

  // Institutions & Passport
  getInstitutions: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchWithAuth(`/institutions${query ? `?${query}` : ''}`);
  },
  getInstitutionById: (id: string) => fetchWithAuth(`/institutions/${id}`),
  compareInstitutions: (id1: string, id2: string) => fetchWithAuth(`/institutions/compare/${id1}/${id2}`),

  // Applications & Workflow
  getApplications: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetchWithAuth(`/applications${query ? `?${query}` : ''}`);
  },
  getApplicationById: (id: string) => fetchWithAuth(`/applications/${id}`),
  createApplication: (data: any) => fetchWithAuth('/applications', { method: 'POST', body: JSON.stringify(data) }),
  raiseDeficiency: (id: string, data: any) => fetchWithAuth(`/applications/${id}/deficiency`, { method: 'POST', body: JSON.stringify(data) }),
  respondDeficiency: (id: string, data: any) => fetchWithAuth(`/applications/${id}/respond-deficiency`, { method: 'POST', body: JSON.stringify(data) }),
  makeDecision: (id: string, data: any) => fetchWithAuth(`/applications/${id}/decision`, { method: 'POST', body: JSON.stringify(data) }),

  // Compliance
  getRules: () => fetchWithAuth('/compliance/rules'),
  addRule: (data: any) => fetchWithAuth('/compliance/rules', { method: 'POST', body: JSON.stringify(data) }),
  validateInstitution: (data: any) => fetchWithAuth('/compliance/validate', { method: 'POST', body: JSON.stringify(data) }),
  batchCheckCompliance: () => fetchWithAuth('/compliance/batch-check', { method: 'POST' }),

  // Alerts
  getAlerts: () => fetchWithAuth('/alerts'),
  acknowledgeAlert: (id: string, acknowledgedBy: string) =>
    fetchWithAuth(`/alerts/${id}/acknowledge`, { method: 'PATCH', body: JSON.stringify({ acknowledgedBy }) }),
  snoozeAlert: (id: string, days: number = 3) =>
    fetchWithAuth(`/alerts/${id}/snooze`, { method: 'PATCH', body: JSON.stringify({ days }) }),
  sendNudge: (data: any) => fetchWithAuth('/alerts/nudge', { method: 'POST', body: JSON.stringify(data) }),

  // Documents & Fraud
  getDocuments: () => fetchWithAuth('/documents'),
  uploadDocument: (data: any) => fetchWithAuth('/documents/upload', { method: 'POST', body: JSON.stringify(data) }),

  // Inspections
  getInspections: () => fetchWithAuth('/inspections'),
  scheduleInspection: (data: any) => fetchWithAuth('/inspections/schedule', { method: 'POST', body: JSON.stringify(data) }),
  submitInspectionReport: (id: string, data: any) => fetchWithAuth(`/inspections/${id}/submit-report`, { method: 'POST', body: JSON.stringify(data) }),

  // Accountability
  getAccountabilityStats: () => fetchWithAuth('/accountability/stats'),

  // Simulator
  simulate: (data: any) => fetchWithAuth('/simulator/simulate', { method: 'POST', body: JSON.stringify(data) }),

  // Public Verification
  verifyPublic: (code: string) => fetchWithAuth(`/public/verify/${code}`),

  // AI Assistant
  chatAI: (messages: any[], selectedLanguage?: string) =>
    fetchWithAuth('/ai/chat', { method: 'POST', body: JSON.stringify({ messages, selectedLanguage }) }),
  getReferenceLibrary: (search?: string) => fetchWithAuth(`/reference-library${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  // Reset Demo
  resetDemoDatabase: () => fetchWithAuth('/admin/reset-demo', { method: 'POST' }),
};
