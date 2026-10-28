export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Regional Officer' | 'Inspection Team Member' | 'Institution User';
  office?: string;
  region?: string;
  phone?: string;
  aicteId?: string;
  institutionId?: string;
  institutionName?: string;
  state?: string;
  accountStatus: string;
  lastLogin: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  state: string;
  region: string;
  discipline: string;
  type: string;
  establishedYear: number;
  address: string;
  contactEmail: string;
  contactPhone: string;
  principalName: string;
  complianceScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskProbability: number;
  riskReasons: string[];
  intakeApproved: number;
  totalFaculty: number;
  totalStudents: number;
  builtUpAreaSqM: number;
  labCount: number;
  libraryBooks: number;
  fireNocValidTill: string;
  lastInspectionDate: string;
  status: 'Active' | 'Under Scrutiny' | 'Deficiency Issued' | 'Approved';
  sources: {
    regionalOffice: boolean;
    inspectionCommittee: boolean;
    instituteSelfReported: boolean;
    complaintCell: boolean;
  };
}

export interface ApplicationCourse {
  name: string;
  level: 'UG' | 'PG' | 'Diploma';
  currentIntake: number;
  proposedIntake: number;
}

export interface Deficiency {
  id: string;
  ruleId: string;
  description: string;
  raisedDate: string;
  status: 'Open' | 'Resolved';
  institutionResponse?: string;
  responseDate?: string;
  officerNote?: string;
}

export interface AuditEvent {
  timestamp: string;
  action: string;
  actor: string;
  notes: string;
}

export interface Application {
  id: string;
  institutionId: string;
  institutionName: string;
  academicYear: string;
  applicationType: 'Extension of Approval (EoA)' | 'New Course Introduction' | 'Increase in Intake' | 'New Institution Approval' | 'Closure of Course';
  stage: 'Submitted' | 'Document Check' | 'Scrutiny' | 'Inspection' | 'Committee Review' | 'Decision';
  status: 'Pending' | 'In Review' | 'Deficiency Raised' | 'Approved' | 'Rejected' | 'Conditional Approval';
  assignedOfficer: string;
  slaDaysTotal: number;
  slaDaysRemaining: number;
  submissionDate: string;
  lastUpdated: string;
  deficiencies: Deficiency[];
  history: AuditEvent[];
  coursesRequested: ApplicationCourse[];
  qrVerificationCode: string;
  approvalLetterUrl?: string;
  stepProgress: number;
}

export interface ComplianceRule {
  id: string;
  title: string;
  aphClause: string;
  category: 'Faculty' | 'Infrastructure' | 'Safety' | 'Academics' | 'Governance';
  metric: string;
  operator: '>=' | '<=' | '==' | 'VALID_DATE';
  thresholdValue: string | number;
  courseType: string;
  severity: 'Critical' | 'High' | 'Medium';
  description: string;
  fixSuggestion: string;
  version: string;
  effectiveDate: string;
}

export interface AlertItem {
  id: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  type: 'SLA Overdue' | 'Missing Document' | 'Compliance Score Drop' | 'Fire NOC Expiring' | 'Ghost Faculty' | 'Inspection Scheduled';
  title: string;
  message: string;
  institutionId: string;
  institutionName: string;
  status: 'New' | 'Acknowledged' | 'Escalated' | 'Resolved';
  escalationStage: 'RO Level 1' | 'Regional Director' | 'Member Secretary AICTE';
  createdTime: string;
  acknowledgedBy?: string;
  snoozeUntil?: string;
  channels: string[];
}

export interface VerifiedDocument {
  id: string;
  institutionId: string;
  institutionName: string;
  docType: string;
  fileName: string;
  uploadDate: string;
  status: 'Verified' | 'Needs Attention' | 'Suspicious' | 'Pending' | 'Approved' | 'Rejected';
  verificationStatus?: 'Approved' | 'Pending' | 'Rejected' | 'Needs Attention';
  rejectionReason?: string;
  history?: Array<{
    date: string;
    fileName: string;
    action: string;
    remarks?: string;
  }>;
  ocrExtracted: {
    instituteNameExtracted: string;
    issueDate: string;
    validTill: string;
    regNumber: string;
    confidence: number;
  };
  hash: string;
  flags: string[];
}

export interface FacultyRecord {
  id: string;
  pan: string;
  name: string;
  designation: string;
  department: string;
  institutionId: string;
  institutionName: string;
  aadhaarVerified: boolean;
  isGhostFlagged: boolean;
  duplicateWithInstitution?: string;
}

export interface Inspection {
  id: string;
  institutionId: string;
  institutionName: string;
  mode: 'Physical Visit' | 'Virtual Scrutiny';
  leadInspector: string;
  committeeMembers: string[];
  scheduledDate: string;
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Report Submitted';
  geotagSimulated: {
    lat: number;
    lng: number;
    locationName: string;
  };
  checklist: {
    item: string;
    verified: boolean;
    remarks: string;
  }[];
  offlineSynced: boolean;
  reportSummary?: string;
}

export interface OfficerStat {
  id: string;
  name: string;
  role: string;
  region: string;
  assignedCount: number;
  resolvedCount: number;
  overdueCount: number;
  avgTurnaroundDays: number;
  satisfactionScore: number;
}
