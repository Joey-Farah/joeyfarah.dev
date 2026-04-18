import { Router, Request, Response } from 'express';

const router = Router();

const RESUME_TEXT = `
JOEY FARAH
Oracle Cloud Technical Consultant

Resume coming soon.

Contact: joey@joeyfarah.dev
LinkedIn: linkedin.com/in/joeyfarah
GitHub: github.com/Joey-Farah
Portfolio: joeyfarah.dev
`.trim();

router.get('/resume', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="joey-farah-resume.txt"');
  res.send(RESUME_TEXT);
});

export { router as resumeRouter };
