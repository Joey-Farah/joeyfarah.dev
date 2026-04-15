import { Router, Request, Response } from 'express';

const router = Router();

const RESUME_TEXT = `
JOEY FARAH
Oracle Cloud ERP Architect & Independent Developer
LinkedIn: linkedin.com/in/joeyfarah | GitHub: github.com/Joey-Farah | Email: joey@joeyfarah.dev
Portfolio: joeyfarah.dev

────────────────────────────────────────────────────────────────
EXPERIENCE
────────────────────────────────────────────────────────────────

DELOITTE — Oracle Cloud ERP Consultant                  Jul 2022 – Present
  › Led Oracle Cloud ERP data conversion for Fortune 500 clients — migrated 200K+
    invoices (AP, AR, GL) via FBDI & Python, reducing manual prep time by 75%.
  › Authored reusable Fusion SQL validators to reconcile legacy AP/AR/GL balances
    pre-cutover, ensuring sub-100-ppm error rates across 200K+ records.
  › Designed enterprise data mapping playbook with functional leads, eliminating
    40% of UAT rework cycles and accelerating sign-off.
  › Built 15+ OTBI dashboards & BIP reconciliation reports — gave hypercare team
    real-time AP exception visibility, cutting response time by 60%.

ACCENTURE — Technology Analyst, Oracle ERP              Jan 2021 – Jun 2022
  › Led data migration & reporting design for mid-market manufacturer's Oracle Cloud
    Financials go-live — covered AP, Expenses, Cash Management, 180K+ records.
  › Built parallel-run reconciliation suite in PL/SQL — validated 15K supplier &
    GL balances with sub-account precision, enabling confident cutover.
  › Designed & documented 12 FBDI conversion templates (AP Invoices, Journals,
    Suppliers, GL Balances) — coordinated offshore delivery, met 15-day UAT deadline.
  › Managed defect lifecycle across 3 release waves — triaged 120+ issues, achieved
    95% UAT sign-off on first wave.

GRANT THORNTON — ERP Implementation Associate           Jun 2020 – Dec 2020
  › Configured 50+ Oracle Cloud security roles & Financials module access for three
    concurrent client environments, ensuring day-1 user readiness.
  › Built AP & PO data migration templates and led 4 cleansing workshops with client
    SMEs — achieved 98% data quality on first submission, eliminating re-scopes.
  › Built 6 Excel reconciliation dashboards — tracked daily migration progress across
    20K records, surfaced discrepancies 3 days early, preventing UAT delay.

────────────────────────────────────────────────────────────────
SKILLS
────────────────────────────────────────────────────────────────

ERP & Data:   Oracle Cloud Financials (AP, AR, GL, PO, Assets), FBDI, OTBI, BIP,
              Oracle Fusion SQL, PL/SQL, Data Conversion, UAT

Engineering:  Python, Node.js, React, TypeScript, MongoDB, Express, Vite, Tailwind CSS,
              Framer Motion, Zod, REST APIs, Git

Infrastructure: Railway, MongoDB Atlas, GitHub Actions, Docker (basic)

────────────────────────────────────────────────────────────────
PROJECTS
────────────────────────────────────────────────────────────────

joeyfarah.dev (this site)
  MERN stack portfolio with terminal boot sequence, bento grid layout, and
  animated ERD tile. Deployed on Railway. github.com/Joey-Farah/joeyfarah.dev

Slippi Ranked Stats — slippi-dashboard.up.railway.app
  Ranked Melee stats dashboard powered by Slippi API. Tracks win rates by
  character & matchup, stage performance, and rank trajectory.
  Stack: Python, Streamlit, Plotly, Slippi API

Fitness Ring Analytics — ringconn-dashboard.up.railway.app
  RingConn biometric dashboard. Visualizes sleep architecture, HRV trends,
  SpO2, and resting heart rate. Supports CSV import.
  Stack: Python, Streamlit, Plotly, pandas

Oracle Database Mapper
  Interactive ERD explorer for Oracle Fusion. Visualizes FK chains across
  200+ Financials tables. Cuts SQL dev time by ~40%.

The Lombardi Project — patreon.com/joeydonuts
  Premium Melee coaching curriculum. Advanced neutral theory, character-specific
  matchups, frame-perfect breakdowns, and VOD reviews.

────────────────────────────────────────────────────────────────
EDUCATION
────────────────────────────────────────────────────────────────

Bachelor of Science — Information Systems
`.trim();

router.get('/resume', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="joey-farah-resume.txt"');
  res.send(RESUME_TEXT);
});

export { router as resumeRouter };
