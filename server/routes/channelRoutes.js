import express from 'express';
import {
  createChannel,
  getChannels,
  getChannelById,
} from '../controllers/channelController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createChannel);
router.get('/workspace/:workspaceId', getChannels);
router.get('/:id', getChannelById);

export default router;