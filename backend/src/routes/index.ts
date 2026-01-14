import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import contractRoutes from './contract.routes';
import aiRoutes from './ai.routes';
import blockchainRoutes from './blockchain.routes';
import collaborationRoutes from './collaboration.routes';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/contracts', contractRoutes);
router.use('/contracts/:contractId', collaborationRoutes);
router.use('/ai', aiRoutes);
router.use('/blockchain', blockchainRoutes);

export default router;
