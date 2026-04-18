import { Router, Request, Response } from 'express';

const router = Router();

const RESUME_TEXT = `
JOEY FARAH
Oracle Cloud Technical Consultant
joeyefarah@gmail.com | linkedin.com/in/joeyfarah | github.com/Joey-Farah | joeyfarah.dev

Driven, process-oriented professional with strength in translating technology to integrate
with key stakeholder needs while developing engaging relationships to support an
organizational mission.

────────────────────────────────────────────────────────────────────
EXPERIENCE
────────────────────────────────────────────────────────────────────

Elire — Oracle Cloud Technical Consultant                     June 2019 – Present
  • Developed data models and formatted reports in BIP and OTBI to meet client needs
  • Developed, tested, and maintained queries for integrations with third-party systems
  • Built scripts to scrub data extracts from client legacy systems and prepare for loading
    into Oracle Cloud
  • Developed conversion scripts to accelerate testing efforts
  • Gathered requirements, configured, tested, and maintained documentation for the
    Recruiting, Performance, and Payroll modules
  • Used Page Composer and Design Studio to build customizations
  • Completed knowledge transfers for smooth transition of customization responsibility
  • Developed Fast Formulas to meet requirements around government regulations

LifeSource — Learning Management System Administrator        June 2018 – May 2019
  • Recommended best practices to streamline processes, departmentally and organizationally
  • Incorporated quality and regulatory requirements into appropriate reporting measures
  • Led transition of instructor-led and paper training files to a cloud LMS
  • Became the subject matter expert for LMS configuration, implementation, and maintenance
  • Acted as liaison between three department educators and the learning management system

University of Saint Thomas HR Dept — Talent Management & Training Intern
                                                          November 2017 – May 2019
  • Created eLearning courses deployed across the university
  • Developed reporting, analysis, and designs for The Leadership Academy and New
    Employee Orientation

────────────────────────────────────────────────────────────────────
EDUCATION
────────────────────────────────────────────────────────────────────

University of Saint Thomas, St. Paul, MN
B.S. Business Administration & Human Resources Management     2015 – 2019

────────────────────────────────────────────────────────────────────
SKILLS
────────────────────────────────────────────────────────────────────

Oracle Cloud HCM & ERP Implementations
Data Conversions — FBDI, HDL, REST APIs
Python · Java · HTML/CSS/JS · SQL

────────────────────────────────────────────────────────────────────
CERTIFICATIONS
────────────────────────────────────────────────────────────────────

Oracle Fusion AI Agent Studio
Oracle Redwood Application Developer Associate
Oracle Recruiting Cloud Implementation Specialist
Oracle Global Human Resources Cloud Implementation Specialist
`.trim();

router.get('/resume', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="joey-farah-resume.txt"');
  res.send(RESUME_TEXT);
});

export { router as resumeRouter };
