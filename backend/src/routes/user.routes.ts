import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.get('/:id', userController.getUser);
router.patch('/:id', userController.updateUser);

// Admin only routes
router.get('/', authorize('ADMIN'), userController.getAllUsers);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

export default router;
