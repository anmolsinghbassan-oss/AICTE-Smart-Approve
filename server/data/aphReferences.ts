export interface APHReferenceDoc {
  id: string;
  chapter: string;
  clause: string;
  title: string;
  summary: string;
  content: string;
  keywords: string[];
}

export const APH_REFERENCES: APHReferenceDoc[] = [
  {
    id: "APH-DOC-701",
    chapter: "Chapter VII: Norms for Faculty Requirements and Cadre Ratio",
    clause: "Clause 7.1 & Table 7.1",
    title: "Faculty to Student Ratio (FSR) for Technical Programs",
    summary: "Specifies 1:20 ratio for UG Engineering, 1:15 for PG Engineering/Management, 1:25 for Diploma, and mandatory cadre ratio of 1:2:6.",
    keywords: ["faculty", "cadre", "fsr", "professor", "associate professor", "ratio"],
    content: `### AICTE Approval Process Handbook (APH) - Clause 7.1
**Faculty to Student Ratio Norms:**
1. **Undergraduate (UG) Degree in Engineering & Technology:** Minimum Faculty-to-Student Ratio shall be **1:20** based on sanctioned intake.
2. **Postgraduate (PG) Degree in Engineering / M.Tech / MBA / MCA:** Minimum Faculty-to-Student Ratio shall be **1:15**.
3. **Diploma in Engineering & Technology:** Minimum Faculty-to-Student Ratio shall be **1:25**.
4. **Cadre Distribution:** For every 9 faculty members in a department, the ideal cadre proportion is **1 Professor : 2 Associate Professors : 6 Assistant Professors**.
5. **Qualifications:** All faculty appointments must comply with AICTE minimum qualifications (M.Tech/Ph.D. for UG/PG, B.E./B.Tech for Diploma).
*Note: Any institution claiming faculty members who are simultaneously registered in another institution's Aadhaar/PAN master roll will face immediate de-recognition proceedings under Chapter X.*`
  },
  {
    id: "APH-DOC-402",
    chapter: "Chapter IV: Land, Building, and Statutory Fire Safety Clearances",
    clause: "Clause 4.2 & Appendix 2",
    title: "Fire & Life Safety Measures and Statutory NOC",
    summary: "Mandatory valid Fire Safety Certificate issued by State/Municipal Fire Services. Expired certificates trigger immediate deficiency.",
    keywords: ["fire", "noc", "safety", "building", "clearance", "disaster"],
    content: `### AICTE Approval Process Handbook (APH) - Clause 4.2
**Fire Safety NOC & Life Safety Clearances:**
1. Every institution campus must possess an unconditional, currently valid **Fire Safety Certificate / NOC** issued by the competent Fire Service Authority of the respective State / UT or Municipal Corporation.
2. The Fire NOC must clearly cover all instructional blocks, administrative buildings, laboratories, workshops, auditoriums, and student hostels.
3. If an NOC is due to expire within 30 days of the approval processing window, the institution must upload the formal renewal application along with an interim inspection acknowledgement.
4. Absence of a valid Fire NOC constitutes a **Critical Non-Compliance (Level 1 Deficiency)** resulting in freezing of intake or withholding of Extension of Approval (EoA).`
  },
  {
    id: "APH-DOC-803",
    chapter: "Chapter VIII: Norms for Infrastructure, Laboratories & Equipment",
    clause: "Clause 8.3 & Appendix 4",
    title: "Instructional Area and Laboratory Carpet Space Standards",
    summary: "Built-up instructional area standards (4.5 sq.m/student), lab equipment norms, and computer terminal ratios (1:4).",
    keywords: ["infrastructure", "lab", "carpet area", "built up", "computer", "terminals"],
    content: `### AICTE Approval Process Handbook (APH) - Clause 8.3
**Instructional Area and Laboratory Carpet Space Requirements:**
1. The total instructional area (comprising classrooms, tutorial rooms, specialized laboratories, workshops, and computer centers) must meet minimum **4.5 square meters per student enrolled**.
2. **Laboratories:** Each undergraduate department must maintain minimum 6 dedicated physical laboratories with licensed operational equipment aligned with model syllabus experiments.
3. **Computing Facilities:** Minimum **1 computing node per 4 students** with minimum 100 Mbps dedicated broadband line (NKN / OFC) and legal licensed or approved open-source software stacks.
4. Institutions seeking expansion or new course approval must furnish registered building completion plans certified by local municipal town planning officers.`
  },
  {
    id: "APH-DOC-901",
    chapter: "Chapter IX: Barrier-Free Campus and Divyangjan Inclusion",
    clause: "Clause 9.1 & Appendix 6",
    title: "Accessible Architecture for Persons with Disabilities (Divyangjan)",
    summary: "Mandatory wheelchair access ramps, tactile paving, Braille signage in elevators, and dedicated accessible sanitation facilities.",
    keywords: ["barrier free", "divyangjan", "disability", "ramp", "wheelchair", "accessible"],
    content: `### AICTE Approval Process Handbook (APH) - Clause 9.1
**Mandatory Divyangjan Facilities:**
1. Ramps with non-slip flooring and handrails with slope not exceeding 1:12 at all ground-floor entrances.
2. Dedicated accessible restrooms with grab bars and emergency call buzzers on every instructional floor.
3. Braille embossed elevator control plates and audible floor announcements.
4. Designated parking stalls within 30 meters of instructional building portals.
*Non-compliance with Clause 9.1 attracts score deductions and delays in approval endorsement.*`
  },
  {
    id: "APH-DOC-301",
    chapter: "Chapter III: Mandatory Public Disclosures & Transparency",
    clause: "Clause 3.1 & Appendix 1",
    title: "Public Web Disclosure of Approvals, Fees and Governance",
    summary: "Institutions must publish an un-gated Mandatory Disclosure link on their homepage detailing AICTE approvals, faculty lists, and fees.",
    keywords: ["disclosure", "website", "transparency", "fees", "governance"],
    content: `### AICTE Approval Process Handbook (APH) - Clause 3.1
**Mandatory Public Disclosure Guidelines:**
1. The official website of the institution must display a prominent, permanent hyperlink titled **'AICTE Mandatory Disclosure'** on the homepage.
2. The disclosure must detail:
   - Approved intake and EoA letters for the past 5 academic years.
   - Complete faculty roll with designation, qualification, Aadhaar/PAN validation status, and joining date.
   - Fee structure approved by State Fee Regulatory Committee (no hidden or capitation levies).
   - Composition of Anti-Ragging Committee and Internal Complaint Committee (ICC).
3. Failure to update disclosure annually by 31st October results in automated statutory warning alerts.`
  }
];
