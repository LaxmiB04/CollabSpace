import Message from '../models/Message.js';
import Channel from '../models/Channel.js';

// @route POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { content, channelId } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const message = await Message.create({
      content,
      sender: req.user._id,
      channel: channelId,
    });

    const populated = await message.populate('sender', 'name email avatar');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/messages/:channelId
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ channel: req.params.channelId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/messages/:id
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};