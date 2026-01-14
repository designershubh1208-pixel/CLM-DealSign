import { Router } from 'express';
import * as collabController from '../controllers/collaboration.controller';
import { authenticate } from '../middleware/auth.middleware';

// Note: These routes are mounted under /contracts/:contractId/ via index routing approach, 
// OR we can define them here relative to root and use mergeParams: true if mounted under contracts.
// Given strict structure, I'll mount them separately or expect contractId in params.
// User requested: /api/contracts/:contractId/comments

const router = Router({ mergeParams: true });

router.use(authenticate);

// Comments
router.get('/comments', collabController.getComments);
router.post('/comments', collabController.addComment);
router.delete('/comments/:commentId', collabController.deleteComment);

// Approvals
router.get('/approvals', collabController.getApprovals);
router.post('/approvals', collabController.requestApproval);
router.patch('/approvals/:approvalId', collabController.updateApproval);

// Activities
router.get('/activities', collabController.getActivities);

export default router;
