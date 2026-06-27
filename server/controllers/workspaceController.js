import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import Channel from '../models/Channel.js';
import { v4 as uuidv4 } from 'uuid';
import Message from '../models/Message.js';

// @route POST /api/workspaces
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      inviteCode: uuidv4(),
    });

    // Add workspace to user's workspaces array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id },
    });

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/workspaces
export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      'members.user': req.user._id,
    }).populate('owner', 'name email avatar');

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/workspaces/:id
export const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('channels');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/workspaces/join
export const joinWorkspace = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const workspace = await Workspace.findOne({ inviteCode }).populate('channels');
    if (!workspace) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    const isMember = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    // Add user to workspace
    workspace.members.push({ user: req.user._id, role: 'member' });
    await workspace.save();

    // Add user to all existing channels in the workspace
    await Channel.updateMany(
      { workspace: workspace._id },
      { $push: { members: req.user._id } }
    );

    // Add workspace to user's workspaces array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id },
    });

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PATCH /api/workspaces/:id/members/:userId/role
export const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const requesterMember = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || requesterMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change roles' });
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === req.params.userId
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role;
    await workspace.save();

    const populated = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/workspaces/:id/members/:userId
export const removeMember = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const requesterMember = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || requesterMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    if (workspace.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove the workspace owner' });
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await workspace.save();

    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { workspaces: workspace._id },
    });

    const populated = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can edit workspace' });
    }

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    await workspace.save();

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this workspace' });
    }

    await Channel.deleteMany({ workspace: workspace._id });
    await Message.deleteMany({ channel: { $in: workspace.channels } });

    const memberIds = workspace.members.map((m) => m.user);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { workspaces: workspace._id } }
    );

    await workspace.deleteOne();

    res.json({ message: 'Workspace deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};