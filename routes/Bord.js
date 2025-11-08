// backend/routes/Bord.js

// Use ES6 import syntax
import express from 'express';
import { generateBoardReport } from '../controllers/bord/reportController.js'; // Assuming default export or named export
import { getBoardMembersForIdea } from '../controllers/bord/BoardController.js'; // Import the specific function
import { authenticate } from '../middleware/Authenticate.js'; // Import middleware
import {
  submitOrCancelVote,
  getVotes,
} from '../controllers/bord/VoteController.js';

const router = express.Router();

// Make sure generateBoardReport is correctly exported from reportController.js
router.post('/generate-report', authenticate, generateBoardReport);

router.get('/:ideaId/members', getBoardMembersForIdea);
router.post('/votes', submitOrCancelVote);
router.get('/votes/:ideaId', getVotes);

// Use ES6 export default syntax
export default router;
