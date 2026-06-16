import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

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

    const workspace = await Workspace.findOne({ inviteCode });
    if (!workspace) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    const isMember = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    workspace.members.push({ user: req.user._id, role: 'member' });
    await workspace.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id },
    });

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};