import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendMessage, getMessages, deleteMessage, toggleReaction } from '../controllers/messageController.js';

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/:channelId', getMessages);
router.delete('/:id', deleteMessage);
router.patch('/:id/react', toggleReaction);


export default router;