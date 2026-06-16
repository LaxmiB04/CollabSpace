import express from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  joinWorkspace,
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // all workspace routes are protected

router.post('/', createWorkspace);
router.get('/', getWorkspaces);
router.get('/:id', getWorkspaceById);
router.post('/join', joinWorkspace);

export default router;