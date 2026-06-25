import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendMessage, getMessages, deleteMessage, toggleReaction, editMessage, searchMessages, markAsRead ,getPinnedMessages,togglePin } from '../controllers/messageController.js';


const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/:channelId', getMessages);
router.delete('/:id', deleteMessage);
router.patch('/:id/react', toggleReaction);
router.patch('/:id', editMessage);
router.get('/:channelId/search', searchMessages);
router.get('/:channelId', getMessages);
router.patch('/:id/read', markAsRead);
router.get('/:channelId/search', searchMessages);
router.get('/:channelId/pinned', getPinnedMessages);
router.get('/:channelId', getMessages);
router.patch('/:id/pin', togglePin);


export default router;