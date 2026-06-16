import express from 'express';
import { sendMessage, getMessages, deleteMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/:channelId', getMessages);
router.delete('/:id', deleteMessage);

export default router;