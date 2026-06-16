import Channel from '../models/Channel.js';
import Workspace from '../models/Workspace.js';

// @route POST /api/channels
export const createChannel = async (req, res) => {
  try {
    const { name, description, workspaceId, isPrivate } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    const isMember = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    const channel = await Channel.create({
      name,
      description,
      workspace: workspaceId,
      createdBy: req.user._id,
      members: [req.user._id],
      isPrivate: isPrivate || false,
    });

    // Add channel to workspace
    await Workspace.findByIdAndUpdate(workspaceId, {
      $push: { channels: channel._id },
    });

    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/channels/workspace/:workspaceId
export const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({
      workspace: req.params.workspaceId,
      members: req.user._id,
    }).populate('createdBy', 'name email avatar');

    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/channels/:id
export const getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};