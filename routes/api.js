import express from 'express';
import { generateExploit } from '../controllers/exploitController.js';

const router = express.Router();

router.post('/chat', generateExploit);

export default router;