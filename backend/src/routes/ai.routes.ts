import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/analyze/:contractId', aiController.analyzeContract);
router.post('/ask', aiController.askQuestion);
router.post('/compare', aiController.compareContracts);

export default router;
