import express from 'express';
import { createWorkspace, getWorkspaces, getWorkspaceById, joinWorkspace, updateMemberRole, removeMember, updateWorkspace, deleteWorkspace } from '../controllers/workspaceController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // all workspace routes are protected

router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.post('/join', joinWorkspace);
router.patch('/:id/members/:userId/role', updateMemberRole);
router.delete('/:id/members/:userId', removeMember);
router.patch('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

export default router;