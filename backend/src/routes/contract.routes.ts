import { Router } from 'express';
import * as contractController from '../controllers/contract.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { createContractSchema, updateContractSchema } from '../validators/contract.validator';

const router = Router();

router.use(authenticate);

router.get('/', contractController.getContracts);
router.get('/stats', contractController.getStats);
router.get('/:id', contractController.getContract);
router.post(
    '/upload',
    upload.single('file'),
    // We validate body manually in controller for multipart due to complexity or use a multipart-aware validator middleware
    contractController.uploadContract
);
router.patch('/:id', validate(updateContractSchema), contractController.updateContract);
router.delete('/:id', contractController.deleteContract);

export default router;
