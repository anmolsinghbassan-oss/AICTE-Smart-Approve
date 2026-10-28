import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_INSTITUTIONS,
  INITIAL_APPLICATIONS,
  INITIAL_COMPLIANCE_RULES,
  INITIAL_ALERTS,
  INITIAL_DOCUMENTS,
  INITIAL_FACULTY,
  INITIAL_INSPECTIONS,
  INITIAL_OFFICERS,
  Institution,
  Application,
  ComplianceRule,
  AlertItem,
  VerifiedDocument,
  FacultyRecord,
  Inspection,
  OfficerStat
} from './data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

export interface DatabaseState {
  institutions: Institution[];
  applications: Application[];
  complianceRules: ComplianceRule[];
  alerts: AlertItem[];
  documents: VerifiedDocument[];
  faculty: FacultyRecord[];
  inspections: Inspection[];
  officers: OfficerStat[];
}

let state: DatabaseState = {
  institutions: [...INITIAL_INSTITUTIONS],
  applications: [...INITIAL_APPLICATIONS],
  complianceRules: [...INITIAL_COMPLIANCE_RULES],
  alerts: [...INITIAL_ALERTS],
  documents: [...INITIAL_DOCUMENTS],
  faculty: [...INITIAL_FACULTY],
  inspections: [...INITIAL_INSPECTIONS],
  officers: [...INITIAL_OFFICERS]
};

// Initialize or load from db.json if exists
export function initDataStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(data);
      state = { ...state, ...loaded };
      console.log('Loaded database state from db.json');
    } else {
      saveDataStore();
    }
  } catch (err) {
    console.warn('Error initializing db.json, using seed state:', err);
  }
}

export function saveDataStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

export const db = {
  getInstitutions: () => state.institutions,
  getInstitutionById: (id: string) => state.institutions.find(i => i.id === id || i.code === id),
  updateInstitution: (id: string, updates: Partial<Institution>) => {
    const idx = state.institutions.findIndex(i => i.id === id);
    if (idx !== -1) {
      state.institutions[idx] = { ...state.institutions[idx], ...updates };
      saveDataStore();
      return state.institutions[idx];
    }
    return null;
  },

  getApplications: () => state.applications,
  getApplicationById: (id: string) => state.applications.find(a => a.id === id || a.qrVerificationCode === id),
  addApplication: (app: Application) => {
    state.applications.unshift(app);
    saveDataStore();
    return app;
  },
  updateApplication: (id: string, updates: Partial<Application>) => {
    const idx = state.applications.findIndex(a => a.id === id);
    if (idx !== -1) {
      state.applications[idx] = { ...state.applications[idx], ...updates };
      saveDataStore();
      return state.applications[idx];
    }
    return null;
  },

  getComplianceRules: () => state.complianceRules,
  addComplianceRule: (rule: ComplianceRule) => {
    state.complianceRules.unshift(rule);
    saveDataStore();
    return rule;
  },
  updateComplianceRule: (id: string, updates: Partial<ComplianceRule>) => {
    const idx = state.complianceRules.findIndex(r => r.id === id);
    if (idx !== -1) {
      state.complianceRules[idx] = { ...state.complianceRules[idx], ...updates };
      saveDataStore();
      return state.complianceRules[idx];
    }
    return null;
  },

  getAlerts: () => state.alerts,
  addAlert: (alert: AlertItem) => {
    state.alerts.unshift(alert);
    saveDataStore();
    return alert;
  },
  updateAlert: (id: string, updates: Partial<AlertItem>) => {
    const idx = state.alerts.findIndex(a => a.id === id);
    if (idx !== -1) {
      state.alerts[idx] = { ...state.alerts[idx], ...updates };
      saveDataStore();
      return state.alerts[idx];
    }
    return null;
  },

  getDocuments: () => state.documents,
  addDocument: (doc: VerifiedDocument) => {
    state.documents.unshift(doc);
    saveDataStore();
    return doc;
  },
  updateDocument: (id: string, updates: Partial<VerifiedDocument>) => {
    const idx = state.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      state.documents[idx] = { ...state.documents[idx], ...updates };
      saveDataStore();
      return state.documents[idx];
    }
    return null;
  },

  getFaculty: () => state.faculty,
  addFaculty: (f: FacultyRecord) => {
    state.faculty.push(f);
    saveDataStore();
    return f;
  },

  getInspections: () => state.inspections,
  addInspection: (insp: Inspection) => {
    state.inspections.unshift(insp);
    saveDataStore();
    return insp;
  },
  updateInspection: (id: string, updates: Partial<Inspection>) => {
    const idx = state.inspections.findIndex(i => i.id === id);
    if (idx !== -1) {
      state.inspections[idx] = { ...state.inspections[idx], ...updates };
      saveDataStore();
      return state.inspections[idx];
    }
    return null;
  },

  getOfficers: () => state.officers,

  resetDatabase: () => {
    state = {
      institutions: [...INITIAL_INSTITUTIONS],
      applications: [...INITIAL_APPLICATIONS],
      complianceRules: [...INITIAL_COMPLIANCE_RULES],
      alerts: [...INITIAL_ALERTS],
      documents: [...INITIAL_DOCUMENTS],
      faculty: [...INITIAL_FACULTY],
      inspections: [...INITIAL_INSPECTIONS],
      officers: [...INITIAL_OFFICERS]
    };
    saveDataStore();
    return true;
  }
};
