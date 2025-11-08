// reportController

import { createPDF } from '../../util/createPDF.js';
export const generateBoardReport = (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
  const { ideaId, boardMembers, votes } = req.body;

  createPDF(req, res); // ✅ Pass both req and res
};
