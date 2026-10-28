import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, initDataStore } from './dataStore.js';
import { processAIChat } from './aiService.js';
import { APH_REFERENCES } from './data/aphReferences.js';
import { Application, Institution } from './data/seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'aicte-smart-approve-super-secret-key-2026';

// Initialize data store
initDataStore();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper: JWT verification middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    institutionId?: string;
    name: string;
  };
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user as any;
    }
    next();
  });
};

app.use(authenticateToken as any);

// --- 1. HEALTH CHECK ---
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'AICTE SmartApprove',
    version: '2026.1.0',
    timestamp: new Date().toISOString()
  });
});

// --- 2. AUTHENTICATION & ROLES ---
// Admin accounts
const ADMIN_USERS = [
  {
    id: 'ADMIN-001',
    email: 'admin@aicte.demo',
    passwordHash: bcrypt.hashSync('Admin@123', 8),
    name: 'Dr. Ramesh Unnikrishnan',
    role: 'Super Admin',
    office: 'AICTE Headquarters, New Delhi',
    region: 'Central HQ',
    phone: '+91 11 2958 1000'
  },
  {
    id: 'ADMIN-002',
    email: 'ro.western@aicte.demo',
    passwordHash: bcrypt.hashSync('Admin@123', 8),
    name: 'Dr. Rajesh Sharma',
    role: 'Regional Officer',
    office: 'AICTE Western Regional Office, Mumbai',
    region: 'Western Region',
    phone: '+91 22 2285 5412'
  },
  {
    id: 'ADMIN-003',
    email: 'inspection@aicte.demo',
    passwordHash: bcrypt.hashSync('Admin@123', 8),
    name: 'Er. Priya Patel',
    role: 'Inspection Team Member',
    office: 'AICTE National Quality Cell',
    region: 'National',
    phone: '+91 11 2958 1055'
  }
];

// Institution default user
const INSTITUTION_USERS = [
  {
    id: 'INST-USER-001',
    email: 'user@college.demo',
    passwordHash: bcrypt.hashSync('User@123', 8),
    name: 'Dr. B. B. Ahuja (Principal/Registrar)',
    role: 'Institution User',
    institutionId: '1-1029384711', // COEP Pune
    institutionName: 'College of Engineering, Pune (COEP Technological Univ)',
    state: 'Maharashtra',
    phone: '+91 20 2550 7000'
  },
  {
    id: 'INST-USER-002',
    email: 'spce@college.demo',
    passwordHash: bcrypt.hashSync('User@123', 8),
    name: 'Dr. M. M. Murudi (Principal)',
    role: 'Institution User',
    institutionId: '1-6079889766', // SPCE Mumbai
    institutionName: 'Sardar Patel College of Engineering, Mumbai',
    state: 'Maharashtra',
    phone: '+91 22 2623 2164'
  }
];

// Login endpoint (handles both Admin and Institution)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, loginType, subRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  if (loginType === 'admin' || cleanEmail.includes('admin') || cleanEmail.includes('aicte')) {
    let admin = ADMIN_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (!admin && cleanEmail === 'admin@aicte.demo') {
      admin = ADMIN_USERS[0];
    }

    if (admin && bcrypt.compareSync(password, admin.passwordHash)) {
      const selectedRole = subRole || admin.role;
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: selectedRole, name: admin.name, office: admin.office, region: admin.region },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        token,
        user: {
          id: admin.id,
          email: admin.email,
          role: selectedRole,
          name: admin.name,
          office: admin.office,
          region: admin.region,
          phone: admin.phone,
          accountStatus: 'Active & Verified',
          lastLogin: new Date().toISOString()
        }
      });
    }
    return res.status(401).json({ error: 'Invalid Administrator credentials. Use admin@aicte.demo / Admin@123' });
  }

  // Institution User
  let instUser = INSTITUTION_USERS.find(u => u.email.toLowerCase() === cleanEmail);
  if (!instUser && cleanEmail === 'user@college.demo') {
    instUser = INSTITUTION_USERS[0];
  }

  if (instUser && bcrypt.compareSync(password, instUser.passwordHash)) {
    const institution = db.getInstitutionById(instUser.institutionId);
    const token = jwt.sign(
      {
        id: instUser.id,
        email: instUser.email,
        role: 'Institution User',
        name: instUser.name,
        institutionId: instUser.institutionId,
        institutionName: instUser.institutionName,
        state: instUser.state
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      token,
      user: {
        id: instUser.id,
        email: instUser.email,
        role: 'Institution User',
        name: instUser.name,
        institutionId: instUser.institutionId,
        institutionName: instUser.institutionName,
        state: instUser.state,
        phone: instUser.phone,
        aicteId: instUser.institutionId,
        accountStatus: 'Active & Verified',
        lastLogin: new Date().toISOString(),
        institutionDetails: institution
      }
    });
  }

  return res.status(401).json({ error: 'Invalid Institution credentials. Use user@college.demo / User@123' });
});

// Institution Signup with simulated OTP
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { instituteName, aicteId, state, email, phone, password, otp } = req.body;

  if (!instituteName || !email || !password) {
    return res.status(400).json({ error: 'Institute name, email and password are required' });
  }

  // Simulated OTP check (any 6 digit code accepted)
  if (otp && otp.toString().length !== 6) {
    return res.status(400).json({ error: 'Please enter a valid 6-digit OTP received on registered mobile/email' });
  }

  // Create new institution user
  const newUser = {
    id: `INST-USER-${Date.now()}`,
    email: email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 8),
    name: `${instituteName} (Authorized Registrar)`,
    role: 'Institution User',
    institutionId: aicteId || `1-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    institutionName: instituteName,
    state: state || 'Maharashtra',
    phone: phone || '+91 98765 43210'
  };

  INSTITUTION_USERS.push(newUser);

  // If institution not in db, create entry
  let existingInst = db.getInstitutionById(newUser.institutionId);
  if (!existingInst) {
    existingInst = {
      id: newUser.institutionId,
      name: instituteName,
      code: instituteName.substring(0, 4).toUpperCase(),
      state: state || 'Maharashtra',
      region: 'Western',
      discipline: 'Engineering & Technology',
      type: 'Private Self-Financing',
      establishedYear: 2018,
      address: `${instituteName} Campus, ${state}`,
      contactEmail: email,
      contactPhone: phone,
      principalName: 'Dr. Authorized Head',
      complianceScore: 82,
      riskLevel: 'Low',
      riskProbability: 0.15,
      riskReasons: ['Newly registered portal user'],
      intakeApproved: 360,
      totalFaculty: 28,
      totalStudents: 540,
      builtUpAreaSqM: 14000,
      labCount: 16,
      libraryBooks: 22000,
      fireNocValidTill: '2027-04-30',
      lastInspectionDate: '2025-05-10',
      status: 'Active',
      sources: { regionalOffice: true, inspectionCommittee: false, instituteSelfReported: true, complaintCell: false }
    };
    db.getInstitutions().push(existingInst);
  }

  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      role: 'Institution User',
      name: newUser.name,
      institutionId: newUser.institutionId,
      institutionName: newUser.institutionName,
      state: newUser.state
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    message: 'Institution registered successfully with OTP verification',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: 'Institution User',
      name: newUser.name,
      institutionId: newUser.institutionId,
      institutionName: newUser.institutionName,
      state: newUser.state,
      phone: newUser.phone,
      aicteId: newUser.institutionId,
      accountStatus: 'Active & Verified',
      lastLogin: new Date().toISOString()
    }
  });
});

// Current User Profile
app.get('/api/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  const inst = req.user.institutionId ? db.getInstitutionById(req.user.institutionId) : undefined;

  res.json({
    user: {
      ...req.user,
      accountStatus: 'Active & Verified',
      lastLogin: new Date().toISOString(),
      institutionDetails: inst
    }
  });
});

// --- 2.5 DEDICATED INSTITUTE PORTAL & DOSSIER ---
app.get('/api/institute/dossier', (req: AuthRequest, res: Response) => {
  let instId = req.user?.institutionId;

  // If user is admin, allow query param inspection
  if (!instId && req.user?.role !== 'Institution User' && req.query.institutionId) {
    instId = req.query.institutionId as string;
  }

  // Fallback default demo institute (COEP Pune)
  if (!instId) {
    instId = '1-1029384711';
  }

  // RBAC enforcement: Institution Users cannot view other institutions
  if (req.user && req.user.role === 'Institution User' && req.user.institutionId && req.query.institutionId && req.query.institutionId !== req.user.institutionId) {
    return res.status(403).json({ error: 'Access denied: You may only view records belonging to your registered institution.' });
  }

  const institution = db.getInstitutionById(instId);
  if (!institution) {
    return res.status(404).json({ error: 'Institution record not found' });
  }

  const allDocs = db.getDocuments().filter(d => d.institutionId === instId);
  const allApps = db.getApplications().filter(a => a.institutionId === instId);
  const allAlerts = db.getAlerts().filter(a => a.institutionId === instId);

  const stats = {
    totalDocuments: allDocs.length,
    pendingVerification: allDocs.filter(d => d.verificationStatus === 'Pending' || d.status === 'Needs Attention' || d.status === 'Pending').length,
    approvedDocuments: allDocs.filter(d => d.verificationStatus === 'Approved' || d.status === 'Verified').length,
    rejectedDocuments: allDocs.filter(d => d.verificationStatus === 'Rejected' || d.status === 'Suspicious').length
  };

  res.json({
    institution,
    documents: allDocs,
    applications: allApps,
    alerts: allAlerts,
    stats,
    verificationStatus: institution.status === 'Active' || institution.status === 'Approved' ? 'Verified' : institution.status === 'Deficiency Issued' ? 'Deficient / Attention Needed' : 'Pending Verification'
  });
});

app.patch('/api/institute/profile', (req: AuthRequest, res: Response) => {
  let instId = req.user?.institutionId || req.body.institutionId || '1-1029384711';

  if (req.user && req.user.role === 'Institution User' && req.user.institutionId && req.user.institutionId !== instId) {
    return res.status(403).json({ error: 'Unauthorized to modify another institution.' });
  }

  const { contactPhone, contactEmail, principalName, address } = req.body;
  const updated = db.updateInstitution(instId, {
    ...(contactPhone && { contactPhone }),
    ...(contactEmail && { contactEmail }),
    ...(principalName && { principalName }),
    ...(address && { address })
  });

  if (!updated) {
    return res.status(404).json({ error: 'Institution not found' });
  }

  res.json({ message: 'Profile updated successfully', institution: updated });
});

app.post('/api/institute/documents/upload', (req: AuthRequest, res: Response) => {
  let instId = req.user?.institutionId || req.body.institutionId || '1-1029384711';
  const inst = db.getInstitutionById(instId);
  const { docType, fileName, notes } = req.body;

  if (!docType || !fileName) {
    return res.status(400).json({ error: 'Document type and file name are required' });
  }

  const newDoc: any = {
    id: `DOC-2026-${Date.now().toString().slice(-4)}`,
    institutionId: instId,
    institutionName: inst ? inst.name : 'Registered Institution',
    docType,
    fileName,
    uploadDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    verificationStatus: 'Pending',
    history: [
      {
        date: new Date().toISOString().split('T')[0],
        fileName,
        action: 'Uploaded by Institution',
        remarks: notes || 'Submitted for statutory verification'
      }
    ],
    ocrExtracted: {
      instituteNameExtracted: (inst?.name || 'INSTITUTE').toUpperCase(),
      issueDate: new Date().toISOString().split('T')[0],
      validTill: '2027-06-30',
      regNumber: `REG/AICTE/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      confidence: 96.0
    },
    hash: `hash_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    flags: []
  };

  db.addDocument(newDoc);
  res.status(201).json({ message: 'Document uploaded successfully', document: newDoc });
});

app.post('/api/institute/documents/:id/replace', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { fileName, remarks } = req.body;

  const doc = db.getDocuments().find(d => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const newFileName = fileName || `Replaced_${doc.fileName}`;
  const history = doc.history ? [...doc.history] : [];
  history.push({
    date: new Date().toISOString().split('T')[0],
    fileName: newFileName,
    action: 'Re-uploaded / Replaced',
    remarks: remarks || 'Corrected document uploaded by institute for re-scrutiny'
  });

  const updated = db.updateDocument(id, {
    fileName: newFileName,
    uploadDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    verificationStatus: 'Pending',
    rejectionReason: undefined,
    flags: [],
    history
  });

  res.json({ message: 'Document re-uploaded successfully for re-verification', document: updated });
});

app.post('/api/institute/documents/:id/re-verify', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;

  const doc = db.getDocuments().find(d => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const history = doc.history ? [...doc.history] : [];
  history.push({
    date: new Date().toISOString().split('T')[0],
    fileName: doc.fileName,
    action: 'Re-verification Requested',
    remarks: notes || 'Institution requested official re-scrutiny'
  });

  const updated = db.updateDocument(id, {
    status: 'Pending',
    verificationStatus: 'Pending',
    history
  });

  res.json({ message: 'Re-verification request queued for scrutiny team', document: updated });
});

// --- 3. DASHBOARD METRICS ---
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const institutions = db.getInstitutions();
  const applications = db.getApplications();
  const alerts = db.getAlerts();

  const totalApplications = applications.length;
  const pending = applications.filter(a => a.status === 'Pending' || a.status === 'In Review').length;
  const approved = applications.filter(a => a.status === 'Approved').length;
  const rejected = applications.filter(a => a.status === 'Rejected' || a.status === 'Deficiency Raised').length;
  const overdueSla = applications.filter(a => a.slaDaysRemaining < 0).length;
  const highRiskCount = institutions.filter(i => i.riskLevel === 'High' || i.riskLevel === 'Critical').length;
  const alertsToday = alerts.filter(a => a.status === 'New').length;

  // Stages distribution
  const stageCounts: Record<string, number> = {
    'Submitted': 0,
    'Document Check': 0,
    'Scrutiny': 0,
    'Inspection': 0,
    'Committee Review': 0,
    'Decision': 0
  };
  applications.forEach(a => {
    if (stageCounts[a.stage] !== undefined) {
      stageCounts[a.stage]++;
    }
  });
  const applicationsByStage = Object.keys(stageCounts).map(stage => ({
    stage,
    count: stageCounts[stage]
  }));

  // Monthly approvals trend
  const approvalsTrend = [
    { month: 'May 2026', received: 4, approved: 1, rejected: 0 },
    { month: 'Jun 2026', received: 8, approved: 4, rejected: 1 },
    { month: 'Jul 2026', received: 14, approved: 9, rejected: 2 },
    { month: 'Aug 2026', received: 22, approved: 16, rejected: 3 },
    { month: 'Sep 2026', received: 35, approved: 24, rejected: 4 },
    { month: 'Oct 2026', received: 60, approved: 38, rejected: 8 }
  ];

  // Compliance score distribution
  const scoreBuckets = [
    { range: '0-50 (Critical)', count: institutions.filter(i => i.complianceScore < 50).length, fill: '#EF4444' },
    { range: '50-70 (High Risk)', count: institutions.filter(i => i.complianceScore >= 50 && i.complianceScore < 70).length, fill: '#F59E0B' },
    { range: '70-85 (Moderate)', count: institutions.filter(i => i.complianceScore >= 70 && i.complianceScore < 85).length, fill: '#3B82F6' },
    { range: '85-100 (Optimal)', count: institutions.filter(i => i.complianceScore >= 85).length, fill: '#10B981' }
  ];

  // State-wise pending vs approved
  const stateAgg: Record<string, { state: string; pending: number; approved: number }> = {};
  applications.forEach(app => {
    const inst = institutions.find(i => i.id === app.institutionId);
    const stateName = inst ? inst.state : 'Other';
    if (!stateAgg[stateName]) {
      stateAgg[stateName] = { state: stateName, pending: 0, approved: 0 };
    }
    if (app.status === 'Approved') stateAgg[stateName].approved++;
    else stateAgg[stateName].pending++;
  });
  const stateStats = Object.values(stateAgg).sort((a, b) => (b.pending + b.approved) - (a.pending + a.approved)).slice(0, 8);

  // Bottleneck durations (average days spent per stage)
  const bottleneck = [
    { stage: 'Document Check', avgDays: 2.4, targetSla: 3 },
    { stage: 'Scrutiny', avgDays: 7.8, targetSla: 7 },
    { stage: 'Inspection', avgDays: 9.2, targetSla: 7 },
    { stage: 'Deficiency Window', avgDays: 14.5, targetSla: 15 },
    { stage: 'Committee Review', avgDays: 5.1, targetSla: 5 },
    { stage: 'Final Decision', avgDays: 1.8, targetSla: 2 }
  ];

  // Recent activity
  const recentActivity = [
    { id: 1, title: 'Approval Letter Issued with Secured QR', college: 'COEP Technological Univ', time: '12 mins ago', type: 'approval' },
    { id: 2, title: 'Ghost Faculty Detected: PAN ABCDE1234F', college: 'Sardar Patel College of Engineering', time: '28 mins ago', type: 'fraud' },
    { id: 3, title: 'Virtual Inspection Checklist Cleared', college: 'RV College of Engineering', time: '1 hour ago', type: 'inspection' },
    { id: 4, title: 'SLA Escalation to Member Secretary', college: 'Apex Global Institute', time: '3 hours ago', type: 'sla' },
    { id: 5, title: 'Physical Surprise Inspection Scheduled', college: 'Madhav Institute (MITS)', time: '5 hours ago', type: 'inspection' }
  ];

  // Upcoming deadlines
  const upcomingDeadlines = [
    { id: 1, title: 'Deficiency Rectification Window Closes', target: 'Sardar Patel College of Engg', date: '31-Oct-2026', daysLeft: 4, severity: 'critical' },
    { id: 2, title: 'Surprise On-Site Lab Inspection', target: 'Apex Global Institute', date: '30-Oct-2026', daysLeft: 3, severity: 'high' },
    { id: 3, title: 'Annual Mandatory Website Disclosure Audit', target: 'All Technical Institutes', date: '05-Nov-2026', daysLeft: 9, severity: 'medium' },
    { id: 4, title: 'Standing Hearing Committee - Phase 2', target: 'Central Scrutiny Panel', date: '08-Nov-2026', daysLeft: 12, severity: 'low' }
  ];

  res.json({
    kpis: {
      totalApplications,
      pending,
      approved,
      rejected,
      avgTurnaroundDays: 10.6,
      overdueSla,
      highRiskInstitutes: highRiskCount,
      alertsToday
    },
    applicationsByStage,
    approvalsTrend,
    scoreBuckets,
    stateStats,
    bottleneck,
    recentActivity,
    upcomingDeadlines
  });
});

// Institute Specific Graph data for search box
app.get('/api/dashboard/institute-graph/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const inst = db.getInstitutionById(id);
  if (!inst) {
    return res.status(404).json({ error: 'Institution not found' });
  }

  const applications = db.getApplications().filter(a => a.institutionId === inst.id);

  // Status breakdown
  const statusCounts = {
    Approved: applications.filter(a => a.status === 'Approved').length,
    InReview: applications.filter(a => a.status === 'In Review' || a.status === 'Pending').length,
    Deficiency: applications.filter(a => a.status === 'Deficiency Raised').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length
  };

  // Historical score progression
  const scoreTrend = [
    { year: '2023', score: Math.max(50, inst.complianceScore - 12) },
    { year: '2024', score: Math.max(55, inst.complianceScore - 6) },
    { year: '2025', score: Math.max(60, inst.complianceScore - 2) },
    { year: '2026 (Current)', score: inst.complianceScore }
  ];

  // Applications over time
  const historyTimeline = [
    { year: '2023-24', type: 'Extension of Approval (EoA)', result: 'Approved', days: 12 },
    { year: '2024-25', type: 'Increase in Intake', result: 'Approved', days: 15 },
    { year: '2025-26', type: 'Extension of Approval (EoA)', result: 'Approved', days: 9 },
    { year: '2026-27', type: applications[0]?.applicationType || 'Extension of Approval', result: applications[0]?.status || 'In Review', days: 11 }
  ];

  res.json({
    institution: inst,
    totalApplications: applications.length,
    statusCounts,
    scoreTrend,
    historyTimeline,
    activeApplication: applications[0] || null
  });
});

// --- 4. INSTITUTIONS (DIGITAL TWIN PASSPORT & COMPARE) ---
app.get('/api/institutions', (req: Request, res: Response) => {
  const { search, state, discipline, risk } = req.query;
  const user = (req as AuthRequest).user;
  let list = db.getInstitutions();

  // Strict RBAC: Institution users can ONLY see their own college
  if (user?.role === 'Institution User' && user.institutionId) {
    list = list.filter(i => i.id === user.institutionId);
    return res.json(list);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q) || i.id.includes(q));
  }
  if (state && state !== 'All') {
    list = list.filter(i => i.state === state);
  }
  if (discipline && discipline !== 'All') {
    list = list.filter(i => i.discipline === discipline);
  }
  if (risk && risk !== 'All') {
    list = list.filter(i => i.riskLevel === risk);
  }

  res.json(list);
});

// Single Digital Twin Passport view
app.get('/api/institutions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as AuthRequest).user;

  // Strict RBAC: Institution users can ONLY access their own institution record
  if (user?.role === 'Institution User' && user.institutionId && user.institutionId !== id) {
    return res.status(403).json({ error: 'Access forbidden: You cannot view records of other institutions.' });
  }

  const inst = db.getInstitutionById(id);
  if (!inst) {
    return res.status(404).json({ error: 'Institution not found' });
  }

  const applications = db.getApplications().filter(a => a.institutionId === inst.id);
  const faculty = db.getFaculty().filter(f => f.institutionId === inst.id);
  const documents = db.getDocuments().filter(d => d.institutionId === inst.id);
  const inspections = db.getInspections().filter(i => i.institutionId === inst.id);
  const alerts = db.getAlerts().filter(a => a.institutionId === inst.id);

  // Digital twin complaints
  const complaints = [
    {
      id: 'CMP-2026-081',
      date: '2026-08-14',
      complainantType: 'Faculty Association',
      subject: 'Delay in 7th Pay Commission arrears disbursement',
      status: 'Resolved',
      investigationNote: 'Audited balance sheet verified by Regional Officer'
    }
  ];

  // Score timeline
  const scoreTimeline = [
    { date: '2024-03-31', score: inst.complianceScore - 5, event: 'Annual EoA 2024 Scrutiny' },
    { date: '2025-04-15', score: inst.complianceScore - 2, event: 'NIRF & AICTE Dual Audit' },
    { date: '2026-10-27', score: inst.complianceScore, event: 'Current Statutory AICTE Evaluation' }
  ];

  res.json({
    institution: inst,
    applications,
    faculty,
    documents,
    inspections,
    alerts,
    complaints,
    scoreTimeline
  });
});

// Compare two institutions side-by-side
app.get('/api/institutions/compare/:id1/:id2', (req: Request, res: Response) => {
  const { id1, id2 } = req.params;
  const user = (req as AuthRequest).user;

  if (user?.role === 'Institution User') {
    return res.status(403).json({ error: 'Access forbidden: Cross-institution comparison is restricted to AICTE Officers.' });
  }

  const inst1 = db.getInstitutionById(id1);
  const inst2 = db.getInstitutionById(id2);

  if (!inst1 || !inst2) {
    return res.status(404).json({ error: 'One or both institutions not found' });
  }

  res.json({
    institution1: inst1,
    institution2: inst2,
    metricsComparison: [
      { metric: 'Compliance Score', inst1: inst1.complianceScore, inst2: inst2.complianceScore, unit: '/100' },
      { metric: 'Faculty-Student Ratio', inst1: `1:${(inst1.totalStudents / inst1.totalFaculty).toFixed(1)}`, inst2: `1:${(inst2.totalStudents / inst2.totalFaculty).toFixed(1)}`, unit: 'Ratio' },
      { metric: 'Built-up Area', inst1: inst1.builtUpAreaSqM.toLocaleString(), inst2: inst2.builtUpAreaSqM.toLocaleString(), unit: 'sq.m' },
      { metric: 'Approved Intake', inst1: inst1.intakeApproved, inst2: inst2.intakeApproved, unit: 'Seats' },
      { metric: 'Total Faculty', inst1: inst1.totalFaculty, inst2: inst2.totalFaculty, unit: 'Faculty' },
      { metric: 'Laboratory Count', inst1: inst1.labCount, inst2: inst2.labCount, unit: 'Labs' },
      { metric: 'Library Books', inst1: inst1.libraryBooks.toLocaleString(), inst2: inst2.libraryBooks.toLocaleString(), unit: 'Volumes' },
      { metric: 'Risk Probability', inst1: `${(inst1.riskProbability * 100).toFixed(0)}%`, inst2: `${(inst2.riskProbability * 100).toFixed(0)}%`, unit: 'Prob' }
    ]
  });
});

// --- 5. APPROVAL PROCESS & DEFICIENCY WORKFLOW ---
app.get('/api/applications', (req: Request, res: Response) => {
  const { stage, status, officer, institutionId } = req.query;
  const user = (req as AuthRequest).user;
  let list = db.getApplications();

  // Strict RBAC: Institution users can ONLY see their own college applications
  if (user?.role === 'Institution User' && user.institutionId) {
    list = list.filter(a => a.institutionId === user.institutionId);
  } else if (institutionId) {
    list = list.filter(a => a.institutionId === institutionId);
  }

  if (stage && stage !== 'All') {
    list = list.filter(a => a.stage === stage);
  }
  if (status && status !== 'All') {
    list = list.filter(a => a.status === status);
  }
  if (officer && officer !== 'All') {
    list = list.filter(a => a.assignedOfficer.includes(officer as string));
  }

  res.json(list);
});

app.get('/api/applications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as AuthRequest).user;
  const appItem = db.getApplicationById(id);
  if (!appItem) {
    return res.status(404).json({ error: 'Application not found' });
  }

  // Strict RBAC
  if (user?.role === 'Institution User' && user.institutionId && user.institutionId !== appItem.institutionId) {
    return res.status(403).json({ error: 'Access forbidden: Restricted from accessing other institutions\' applications.' });
  }

  res.json(appItem);
});

// Submit / Create new application with auto-save support
app.post('/api/applications', (req: Request, res: Response) => {
  const body = req.body;
  const inst = db.getInstitutionById(body.institutionId);

  // Auto-route to regional officer based on state
  let assignedOfficer = "Dr. Rajesh Sharma (RO Western)";
  if (inst?.region === 'South-Western' || inst?.state === 'Karnataka' || inst?.state === 'Kerala') {
    assignedOfficer = "Smt. Kavitha Nair (RO South-West)";
  } else if (inst?.region === 'Northern' || inst?.state === 'Delhi' || inst?.state === 'Uttar Pradesh') {
    assignedOfficer = "Dr. Amitabh Sen (Scrutiny Committee)";
  }

  const newApp: Application = {
    id: `APP-2026-${Math.floor(2000 + Math.random() * 8000)}`,
    institutionId: body.institutionId || (inst ? inst.id : '1-1029384711'),
    institutionName: inst ? inst.name : (body.institutionName || 'Submitted Institution'),
    academicYear: '2026-2027',
    applicationType: body.applicationType || 'Extension of Approval (EoA)',
    stage: 'Submitted',
    status: 'Pending',
    assignedOfficer,
    slaDaysTotal: 21,
    slaDaysRemaining: 21,
    submissionDate: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    stepProgress: 1,
    deficiencies: [],
    history: [
      {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: 'Application Submitted Online',
        actor: body.submittedBy || 'Authorized Institution Representative',
        notes: `Application filed with ${body.coursesRequested?.length || 2} academic programs.`
      }
    ],
    coursesRequested: body.coursesRequested || [
      { name: "Computer Engineering", level: "UG", currentIntake: 120, proposedIntake: 180 },
      { name: "Artificial Intelligence & Data Science", level: "UG", currentIntake: 60, proposedIntake: 60 }
    ],
    qrVerificationCode: `QR-AICTE-${inst?.code || 'INST'}-2026-${Date.now().toString().slice(-4)}`
  };

  db.addApplication(newApp);
  res.status(201).json(newApp);
});

// Officer raises deficiency
app.post('/api/applications/:id/deficiency', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as AuthRequest).user;
  if (user?.role === 'Institution User') {
    return res.status(403).json({ error: 'Access forbidden: Only AICTE Administrative Officers can issue statutory deficiencies.' });
  }

  const { ruleId, description, officerNote } = req.body;
  const appItem = db.getApplicationById(id);

  if (!appItem) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const newDeficiency = {
    id: `DEF-2026-${Date.now().toString().slice(-4)}`,
    ruleId: ruleId || 'APH-R01',
    description: description || 'Mandatory cadre ratio deficient for proposed intake.',
    raisedDate: new Date().toISOString().split('T')[0],
    status: 'Open' as const,
    officerNote
  };

  const updatedDeficiencies = [...appItem.deficiencies, newDeficiency];
  const updatedHistory = [
    ...appItem.history,
    {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action: 'Deficiency Raised by Scrutiny Officer',
      actor: appItem.assignedOfficer,
      notes: description
    }
  ];

  const updated = db.updateApplication(id, {
    status: 'Deficiency Raised',
    deficiencies: updatedDeficiencies,
    history: updatedHistory,
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  // Create alert for institution
  db.addAlert({
    id: `ALT-DEF-${Date.now().toString().slice(-4)}`,
    priority: 'Critical',
    type: 'Missing Document',
    title: `Deficiency Issued: Application ${appItem.id}`,
    message: description,
    institutionId: appItem.institutionId,
    institutionName: appItem.institutionName,
    status: 'New',
    escalationStage: 'RO Level 1',
    createdTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    channels: ['In-App', 'Email', 'SMS']
  });

  res.json(updated);
});

// Institution responds to deficiency
app.post('/api/applications/:id/respond-deficiency', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as AuthRequest).user;
  const { deficiencyId, institutionResponse } = req.body;
  const appItem = db.getApplicationById(id);

  if (!appItem) {
    return res.status(404).json({ error: 'Application not found' });
  }

  if (user?.role === 'Institution User' && user.institutionId && user.institutionId !== appItem.institutionId) {
    return res.status(403).json({ error: 'Access forbidden: You cannot respond to another college\'s deficiency.' });
  }

  const updatedDefs = appItem.deficiencies.map(d => {
    if (d.id === deficiencyId) {
      return {
        ...d,
        institutionResponse,
        responseDate: new Date().toISOString().split('T')[0]
      };
    }
    return d;
  });

  const updated = db.updateApplication(id, {
    deficiencies: updatedDefs,
    status: 'In Review',
    history: [
      ...appItem.history,
      {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: 'Institution Clarification / Rectification Uploaded',
        actor: 'Institution Authorized Signatory',
        notes: institutionResponse
      }
    ],
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  res.json(updated);
});

// Final Decision: Approve / Reject / Conditional
app.post('/api/applications/:id/decision', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as AuthRequest).user;
  if (user?.role === 'Institution User') {
    return res.status(403).json({ error: 'Access forbidden: Only AICTE Statutory Committees can issue approval decisions.' });
  }
  const { decision, remarks } = req.body; // 'Approved' | 'Rejected' | 'Conditional Approval'
  const appItem = db.getApplicationById(id);

  if (!appItem) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const updated = db.updateApplication(id, {
    stage: 'Decision',
    status: decision,
    stepProgress: 6,
    approvalLetterUrl: decision === 'Approved' ? `/api/applications/${id}/letter` : undefined,
    history: [
      ...appItem.history,
      {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: `Final Decision: ${decision}`,
        actor: 'Executive Committee / Member Secretary AICTE',
        notes: remarks || `Application marked as ${decision}`
      }
    ],
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  res.json(updated);
});

// --- 6. COMPLIANCE CHECKING ENGINE ---
app.get('/api/compliance/rules', (req: Request, res: Response) => {
  res.json(db.getComplianceRules());
});

app.post('/api/compliance/rules', (req: Request, res: Response) => {
  const newRule = req.body;
  if (!newRule.title || !newRule.aphClause) {
    return res.status(400).json({ error: 'Title and APH Clause are required' });
  }

  const rule = {
    ...newRule,
    id: newRule.id || `APH-R${String(db.getComplianceRules().length + 1).padStart(2, '0')}`,
    version: '2026.2',
    effectiveDate: new Date().toISOString().split('T')[0]
  };

  db.addComplianceRule(rule);
  res.status(201).json(rule);
});

// Instant validation for single institution
app.post('/api/compliance/validate', (req: Request, res: Response) => {
  const { institutionId, dataOverride } = req.body;
  const inst = db.getInstitutionById(institutionId);

  if (!inst) {
    return res.status(404).json({ error: 'Institution not found' });
  }

  const data = { ...inst, ...(dataOverride || {}) };
  const rules = db.getComplianceRules();

  const results = rules.map(rule => {
    let passed = true;
    let actualValue: any = '';
    let deduction = 0;

    if (rule.metric === 'faculty_student_ratio') {
      const fsr = data.totalFaculty > 0 ? (data.totalStudents / data.totalFaculty) : 999;
      actualValue = `1:${fsr.toFixed(1)}`;
      passed = fsr <= Number(rule.thresholdValue);
      if (!passed) deduction = 15;
    } else if (rule.metric === 'instructional_area_per_student') {
      const areaPerStudent = data.totalStudents > 0 ? (data.builtUpAreaSqM / data.totalStudents) : 0;
      actualValue = `${areaPerStudent.toFixed(1)} m²/student`;
      passed = areaPerStudent >= Number(rule.thresholdValue);
      if (!passed) deduction = 12;
    } else if (rule.metric === 'fire_noc_validity') {
      const today = new Date().toISOString().split('T')[0];
      passed = data.fireNocValidTill >= today;
      actualValue = `Valid till ${data.fireNocValidTill}`;
      if (!passed) deduction = 20;
    } else if (rule.metric === 'computer_student_ratio') {
      actualValue = '1:3.2';
      passed = true;
    } else {
      actualValue = 'Verified';
      passed = true;
    }

    return {
      ruleId: rule.id,
      title: rule.title,
      aphClause: rule.aphClause,
      category: rule.category,
      severity: rule.severity,
      passed,
      actualValue,
      thresholdValue: rule.thresholdValue,
      deduction,
      fixSuggestion: rule.fixSuggestion
    };
  });

  const totalDeductions = results.reduce((sum, r) => sum + r.deduction, 0);
  const calculatedScore = Math.max(0, 100 - totalDeductions);

  res.json({
    institutionId: inst.id,
    institutionName: inst.name,
    calculatedScore,
    status: calculatedScore >= 85 ? 'Green (Optimal)' : calculatedScore >= 70 ? 'Amber (Needs Action)' : 'Red (Critical Non-Compliance)',
    results
  });
});

// Batch run across all institutions
app.post('/api/compliance/batch-check', (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  if (user?.role === 'Institution User') {
    return res.status(403).json({ error: 'Access forbidden: Pan-India Batch Auditing is restricted to AICTE Officers.' });
  }

  const institutions = db.getInstitutions();
  const rules = db.getComplianceRules();

  const batchResults = institutions.map(inst => {
    const fsr = inst.totalFaculty > 0 ? (inst.totalStudents / inst.totalFaculty) : 99;
    const today = new Date().toISOString().split('T')[0];
    const isFireNocValid = inst.fireNocValidTill >= today;
    const isFsrValid = fsr <= 20.0;

    let failedRulesCount = 0;
    if (!isFireNocValid) failedRulesCount++;
    if (!isFsrValid) failedRulesCount++;

    return {
      institutionId: inst.id,
      name: inst.name,
      code: inst.code,
      state: inst.state,
      discipline: inst.discipline,
      complianceScore: inst.complianceScore,
      fsr: `1:${fsr.toFixed(1)}`,
      fireNocValidTill: inst.fireNocValidTill,
      isFireNocValid,
      isFsrValid,
      failedRulesCount,
      riskLevel: inst.riskLevel,
      status: failedRulesCount === 0 ? 'Compliant' : 'Deficient'
    };
  });

  res.json({
    totalChecked: batchResults.length,
    compliantCount: batchResults.filter(b => b.status === 'Compliant').length,
    deficientCount: batchResults.filter(b => b.status === 'Deficient').length,
    results: batchResults
  });
});

// --- 7. ALERTS & REMINDERS (ESCALATION MATRIX) ---
app.get('/api/alerts', (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  let list = db.getAlerts();
  if (user?.role === 'Institution User' && user.institutionId) {
    list = list.filter(a => a.institutionId === user.institutionId);
  }
  res.json(list);
});

app.patch('/api/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateAlert(id, {
    status: 'Acknowledged',
    acknowledgedBy: req.body.acknowledgedBy || 'Regional Scrutiny Officer'
  });
  res.json(updated);
});

app.patch('/api/alerts/:id/snooze', (req: Request, res: Response) => {
  const { id } = req.params;
  const snoozeDays = req.body.days || 3;
  const snoozeDate = new Date(Date.now() + snoozeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const updated = db.updateAlert(id, {
    status: 'Acknowledged',
    snoozeUntil: snoozeDate
  });
  res.json(updated);
});

// Send Nudge from Early Warning
app.post('/api/alerts/nudge', (req: Request, res: Response) => {
  const { institutionId, message, priority } = req.body;
  const inst = db.getInstitutionById(institutionId);

  const newAlert = {
    id: `ALT-NUDGE-${Date.now().toString().slice(-4)}`,
    priority: priority || 'High',
    type: 'Compliance Score Drop' as const,
    title: `Statutory Advisory Nudge: ${inst?.name || 'Institution'}`,
    message: message || 'Proactive advisory to resolve pending infrastructural discrepancies before next AICTE cycle.',
    institutionId: institutionId || '1-1029384711',
    institutionName: inst ? inst.name : 'Target College',
    status: 'New' as const,
    escalationStage: 'RO Level 1' as const,
    createdTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    channels: ['In-App', 'Email', 'WhatsApp']
  };

  db.addAlert(newAlert);
  res.status(201).json(newAlert);
});

// --- 8. DOCUMENT VERIFICATION & FRAUD DETECTION ---
app.get('/api/documents', (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  if (user?.role === 'Institution User') {
    const callerInstId = user.institutionId;
    const docs = db.getDocuments().filter(d => d.institutionId === callerInstId);
    return res.json({
      documents: docs,
      fraudDetection: {
        ghostFaculty: [],
        duplicateHashCases: []
      }
    });
  }

  const docs = db.getDocuments();
  const faculty = db.getFaculty();
  const ghostFaculty = faculty.filter(f => f.isGhostFlagged);

  res.json({
    documents: docs,
    fraudDetection: {
      ghostFaculty,
      duplicateHashCases: docs.filter(d => d.flags.length > 0)
    }
  });
});

// Document upload & simulated OCR
app.post('/api/documents/upload', (req: Request, res: Response) => {
  const { institutionId, docType, fileName, simulateDuplicate } = req.body;
  const inst = db.getInstitutionById(institutionId);

  const isNoc = (docType || '').toLowerCase().includes('fire') || (fileName || '').toLowerCase().includes('fire');
  const dummyHash = simulateDuplicate
    ? 'c7d6b5a4938271605f4e3d2c1b0a987654321fedcba0987654321fedcba09876' // identical to Apex Meerut
    : `hash_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const flags: string[] = [];
  let status: 'Verified' | 'Needs Attention' | 'Suspicious' = 'Verified';

  if (simulateDuplicate) {
    status = 'Suspicious';
    flags.push('Duplicate file hash detected: File content identically matches deed submitted by another college.');
  } else if (isNoc) {
    status = 'Needs Attention';
    flags.push('Validity expiry within 30 days. Upload renewal acknowledgement.');
  }

  const newDoc = {
    id: `DOC-2026-${Date.now().toString().slice(-4)}`,
    institutionId: institutionId || '1-1029384711',
    institutionName: inst ? inst.name : 'Uploading College',
    docType: docType || 'Statutory Compliance Deed',
    fileName: fileName || 'uploaded_document.pdf',
    uploadDate: new Date().toISOString().split('T')[0],
    status,
    ocrExtracted: {
      instituteNameExtracted: inst ? inst.name.toUpperCase() : 'UPLOADED COLLEGE',
      issueDate: '2024-05-10',
      validTill: isNoc ? '2026-11-14' : '2027-04-30',
      regNumber: `REG/AICTE/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      confidence: 96.5
    },
    hash: dummyHash,
    flags
  };

  db.addDocument(newDoc);
  res.status(201).json(newDoc);
});

// --- 9. INSPECTIONS MODULE ---
app.get('/api/inspections', (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  let list = db.getInspections();
  if (user?.role === 'Institution User' && user.institutionId) {
    list = list.filter(i => i.institutionId === user.institutionId);
  }
  res.json(list);
});

app.post('/api/inspections/schedule', (req: Request, res: Response) => {
  const { institutionId, mode, leadInspector, scheduledDate } = req.body;
  const inst = db.getInstitutionById(institutionId);

  const newInsp = {
    id: `INSP-2026-${Date.now().toString().slice(-4)}`,
    institutionId: institutionId || '1-1029384711',
    institutionName: inst ? inst.name : 'Target Institution',
    mode: mode || (inst && inst.riskLevel === 'High' ? 'Physical Visit' : 'Virtual Scrutiny'),
    leadInspector: leadInspector || 'Er. Priya Patel (Inspection Head)',
    committeeMembers: ['Prof. K. R. Raman (IIT Roorkee)', 'Er. S. Sengupta (PWD)'],
    scheduledDate: scheduledDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Scheduled' as const,
    geotagSimulated: {
      lat: 18.5293,
      lng: 73.8565,
      locationName: `${inst?.name || 'Campus'} Grounds`
    },
    checklist: [
      { item: 'Computing Labs & High-Bandwidth Internet verification', verified: false, remarks: 'To be checked' },
      { item: 'Faculty Aadhaar Biometric Attendance Registry cross-check', verified: false, remarks: 'To be checked' },
      { item: 'Fire safety suppression units & hydrants functional check', verified: false, remarks: 'To be checked' },
      { item: 'Divyangjan wheelchair ramp & braille lift accessibility', verified: false, remarks: 'To be checked' }
    ],
    offlineSynced: true,
    reportSummary: 'Scheduled statutory verification'
  };

  db.addInspection(newInsp);
  res.status(201).json(newInsp);
});

app.post('/api/inspections/:id/submit-report', (req: Request, res: Response) => {
  const { id } = req.params;
  const { checklist, reportSummary } = req.body;

  const updated = db.updateInspection(id, {
    status: 'Report Submitted',
    checklist: checklist || [
      { item: 'Computing Labs verified', verified: true, remarks: 'Complies with 1:4 terminal ratio' },
      { item: 'Faculty Biometrics cross-checked', verified: true, remarks: 'All regular faculty validated' },
      { item: 'Fire safety units tested', verified: true, remarks: 'Pressure test passed' },
      { item: 'Divyangjan accessibility inspected', verified: true, remarks: 'Ramps and accessible toilets verified' }
    ],
    reportSummary: reportSummary || 'Physical inspection completed. Campus complies with APH 2026 instructional requirements.',
    offlineSynced: true
  });

  res.json(updated);
});

// --- 10. OFFICER ACCOUNTABILITY ---
app.get('/api/accountability/stats', (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  if (user?.role === 'Institution User') {
    return res.status(403).json({ error: 'Access forbidden: Officer accountability records are restricted to AICTE Officers.' });
  }

  const officers = db.getOfficers();
  const applications = db.getApplications();

  // Regional breakdown
  const regionalBreakdown = [
    { region: 'Western Region (Mumbai)', total: 42, resolved: 38, avgDays: 9.8, overdue: 2 },
    { region: 'South-Western (Bengaluru)', total: 36, resolved: 34, avgDays: 8.5, overdue: 1 },
    { region: 'Northern Region (Delhi)', total: 29, resolved: 24, avgDays: 14.2, overdue: 4 },
    { region: 'Southern Region (Chennai)', total: 28, resolved: 27, avgDays: 7.9, overdue: 0 }
  ];

  res.json({
    officers,
    regionalBreakdown,
    totalCasesHandled: applications.length,
    overallAvgTurnaround: 10.6,
    overdueCases: applications.filter(a => a.slaDaysRemaining < 0).length
  });
});

// --- 11. POLICY RULE BUILDER & WHAT-IF SIMULATOR ---
app.post('/api/simulator/simulate', (req: Request, res: Response) => {
  const { type, facultyRatioThreshold, areaThreshold, seatAddition, courseType } = req.body;
  const user = (req as AuthRequest).user;
  if (type === 'policy_change' && user?.role === 'Institution User') {
    return res.status(403).json({ error: 'Access forbidden: National policy simulation is restricted to AICTE Officers.' });
  }
  const institutions = db.getInstitutions();

  if (type === 'policy_change') {
    // Admin policy simulator: e.g. "If faculty ratio changes from 1:20 to 1:15"
    const newFsrThreshold = facultyRatioThreshold ? Number(facultyRatioThreshold) : 15;
    const currentFsrThreshold = 20;

    const beforeNonCompliant = institutions.filter(i => (i.totalStudents / i.totalFaculty) > currentFsrThreshold);
    const afterNonCompliant = institutions.filter(i => (i.totalStudents / i.totalFaculty) > newFsrThreshold);

    const newlyImpacted = afterNonCompliant.filter(i => !beforeNonCompliant.some(b => b.id === i.id));

    return res.json({
      simulationType: 'policy_change',
      parameter: 'Faculty-to-Student Ratio',
      currentThreshold: `1:${currentFsrThreshold}`,
      simulatedThreshold: `1:${newFsrThreshold}`,
      beforeNonCompliantCount: beforeNonCompliant.length,
      afterNonCompliantCount: afterNonCompliant.length,
      newlyImpactedCount: newlyImpacted.length,
      impactPercentage: `${((afterNonCompliant.length / institutions.length) * 100).toFixed(1)}% of total institutions`,
      newlyImpactedInstitutions: newlyImpacted.map(i => ({
        id: i.id,
        name: i.name,
        state: i.state,
        currentFsr: `1:${(i.totalStudents / i.totalFaculty).toFixed(1)}`
      }))
    });
  }

  // Institution expansion simulator: e.g. "If I add 60 seats in ECE"
  const seats = seatAddition ? Number(seatAddition) : 60;
  const extraFacultyNeeded = Math.ceil(seats / 20); // 1:20 ratio
  const extraAreaNeeded = seats * 4.5; // 4.5 sq.m per student
  const extraComputersNeeded = Math.ceil(seats / 4); // 1:4 ratio

  res.json({
    simulationType: 'institution_expansion',
    courseType: courseType || 'Electronics & Communication Engg (UG)',
    addedSeats: seats,
    extraFacultyNeeded,
    extraInstructionalAreaSqM: extraAreaNeeded,
    extraComputersNeeded,
    additionalLabEquipBudgetEstLakhs: (seats * 0.4).toFixed(1),
    recommendation: `To introduce ${seats} additional seats, you must recruit at least ${extraFacultyNeeded} certified faculty members (minimum 1 Associate Professor) and dedicate ${extraAreaNeeded} sq.m of instructional space.`
  });
});

// --- 12. PUBLIC VERIFICATION PORTAL ---
app.get('/api/public/verify/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  const applications = db.getApplications();
  const institutions = db.getInstitutions();

  // Search by QR code, AICTE ID, or application ID
  const cleanCode = code.trim().toLowerCase();
  const matchedApp = applications.find(a =>
    a.qrVerificationCode.toLowerCase() === cleanCode ||
    a.id.toLowerCase() === cleanCode ||
    a.institutionId.toLowerCase() === cleanCode
  );

  if (matchedApp) {
    const inst = db.getInstitutionById(matchedApp.institutionId);
    return res.json({
      verified: true,
      approvalStatus: matchedApp.status,
      academicYear: matchedApp.academicYear,
      applicationId: matchedApp.id,
      applicationType: matchedApp.applicationType,
      institution: {
        id: inst?.id || matchedApp.institutionId,
        name: matchedApp.institutionName,
        state: inst?.state || 'Maharashtra',
        region: inst?.region || 'Western',
        complianceScore: inst?.complianceScore || 96,
        status: inst?.status || 'Active'
      },
      digitalSignature: {
        signedBy: 'Member Secretary, AICTE New Delhi',
        eSignTimestamp: '2026-10-22T09:00:00.000Z',
        algorithm: 'SHA256-RSA-4096 (e-Hastakshar / CCA Certified)',
        tamperDetected: false
      },
      approvedCourses: matchedApp.coursesRequested,
      validTill: '30-June-2027',
      qrVerificationCode: matchedApp.qrVerificationCode,
      verifiedDocuments: db.getDocuments()
        .filter(d => d.institutionId === (inst?.id || matchedApp.institutionId))
        .map(d => ({
          docType: d.docType,
          fileName: d.fileName,
          uploadDate: d.uploadDate,
          status: d.verificationStatus || d.status,
          validTill: d.ocrExtracted?.validTill || '30-June-2027'
        }))
    });
  }

  // If institution ID matched directly
  const matchedInst = institutions.find(i => i.id.toLowerCase() === cleanCode || i.code.toLowerCase() === cleanCode);
  if (matchedInst) {
    return res.json({
      verified: true,
      approvalStatus: 'Approved',
      academicYear: '2026-2027',
      applicationId: `APP-2026-INST-${matchedInst.code}`,
      applicationType: 'Extension of Approval (EoA)',
      institution: {
        id: matchedInst.id,
        name: matchedInst.name,
        state: matchedInst.state,
        region: matchedInst.region,
        complianceScore: matchedInst.complianceScore,
        status: matchedInst.status
      },
      digitalSignature: {
        signedBy: 'Member Secretary, AICTE New Delhi',
        eSignTimestamp: '2026-08-15T12:00:00.000Z',
        algorithm: 'SHA256-RSA-4096',
        tamperDetected: false
      },
      approvedCourses: [
        { name: "Computer Science & Engineering", level: "UG", currentIntake: 180, proposedIntake: 180 },
        { name: "Electronics & Communication", level: "UG", currentIntake: 120, proposedIntake: 120 }
      ],
      validTill: '30-June-2027',
      qrVerificationCode: `QR-AICTE-${matchedInst.code}-VERIFIED`,
      verifiedDocuments: db.getDocuments()
        .filter(d => d.institutionId === matchedInst.id)
        .map(d => ({
          docType: d.docType,
          fileName: d.fileName,
          uploadDate: d.uploadDate,
          status: d.verificationStatus || d.status,
          validTill: d.ocrExtracted?.validTill || '30-June-2027'
        }))
    });
  }

  res.status(404).json({
    verified: false,
    error: 'No valid AICTE statutory approval certificate found for the provided code or ID.'
  });
});

// --- 13. AI ASSISTANT CHAT & KNOWLEDGE BASE ---
app.post('/api/ai/chat', async (req: AuthRequest, res: Response) => {
  const { messages, selectedLanguage } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const result = await processAIChat(messages, req.user, selectedLanguage);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'AI processing failed', details: err?.message });
  }
});

// Reference Library
app.get('/api/reference-library', (req: Request, res: Response) => {
  const { search } = req.query;
  let list = APH_REFERENCES;
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.clause.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.keywords.some(k => k.toLowerCase().includes(q))
    );
  }
  res.json(list);
});

// Reset demo database
app.post('/api/admin/reset-demo', (req: Request, res: Response) => {
  db.resetDatabase();
  res.json({ message: 'Demo seed database reset successfully' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AICTE SmartApprove Backend running on http://localhost:${PORT}`);
});
