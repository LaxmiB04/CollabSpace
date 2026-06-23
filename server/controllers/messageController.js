import Message from '../models/Message.js';
import Channel from '../models/Channel.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @route POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { content, channelId, attachments } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const message = await Message.create({
      content,
      sender: req.user._id,
      channel: channelId,
      attachments: attachments || [],
    });

    const populated = await message.populate('sender', 'name email avatar');

    // Check for @mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);

    if (mentions) {
      for (const mention of mentions) {
        const username = mention.slice(1);
        const mentionedUser = await User.findOne({
          name: { $regex: new RegExp(`^${username}$`, 'i') },
        });

        if (mentionedUser && mentionedUser._id.toString() !== req.user._id.toString()) {
          await Notification.create({
            recipient: mentionedUser._id,
            sender: req.user._id,
            type: 'mention',
            message: `${req.user.name} mentioned you in #${channel.name}`,
            link: `/dashboard?channel=${channelId}`,
          });
        }
      }
    }

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

// @route PATCH /api/messages/:id/react
export const toggleReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const existingReaction = message.reactions.find(
      (r) => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction (toggle off)
      message.reactions = message.reactions.filter(
        (r) => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
      );
    } else {
      // Add reaction
      message.reactions.push({ emoji, user: req.user._id });
    }

    await message.save();
    const populated = await message.populate('sender', 'name email avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};