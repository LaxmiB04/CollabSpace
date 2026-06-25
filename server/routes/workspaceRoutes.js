import express from 'express';
import { createWorkspace, getWorkspaces, getWorkspaceById, joinWorkspace, updateMemberRole, removeMember } from '../controllers/workspaceController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // all workspace routes are protected

router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.post('/join', joinWorkspace);
router.patch('/:id/members/:userId/role', updateMemberRole);
router.delete('/:id/members/:userId', removeMember);

export default router;