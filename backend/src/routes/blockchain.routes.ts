import { Router } from 'express';
import { blockchainController } from '../controllers/blockchain.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/verify/:contractId', blockchainController.verifyContract);
router.get('/status/:contractId', blockchainController.getStatus);
router.post('/check-hash', blockchainController.checkHash);

export default router;
