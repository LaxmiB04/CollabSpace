import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore.js';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import CreateWorkspaceModal from './CreateWorkspaceModal.jsx';
import CreateChannelModal from './CreateChannelModal.jsx';
import JoinWorkspaceModal from './JoinWorkspaceModal.jsx';
import { useNavigate } from 'react-router-dom';
import InviteModal from './InviteModal.jsx';
import { io } from 'socket.io-client';

function Sidebar({ onChannelSelect, selectedChannel , onWorkspaceSelect}) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [editingWorkspace, setEditingWorkspace] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [editName, setEditName] = useState('');
const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});
  useEffect(() => {
  if (user) {
    socket.emit('userOnline', user._id);
  }

  socket.on('onlineUsers', (users) => {
    setOnlineUsers(users);
  });

  return () => {
    socket.off('onlineUsers');
  };
}, [user]);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

const fetchWorkspaces = async () => {
  try {
    const response = await api.get('/workspaces');
    setWorkspaces(response.data);
    if (response.data.length > 0) {
      const fullWorkspace = await api.get(`/workspaces/${response.data[0]._id}`);
      setSelectedWorkspace(fullWorkspace.data);
      onWorkspaceSelect(fullWorkspace.data);
      fetchChannels(response.data[0]._id);
    }
  } catch (error) {
    toast.error('Failed to load workspaces');
  }
};

  const fetchChannels = async (workspaceId) => {
    try {
      const response = await api.get(`/channels/workspace/${workspaceId}`);
      setChannels(response.data);
    } catch (error) {
      toast.error('Failed to load channels');
    }
  };

  const handleWorkspaceClick = async (workspace) => {
  try {
    const response = await api.get(`/workspaces/${workspace._id}`);
    setSelectedWorkspace(response.data);
    onWorkspaceSelect(response.data);
    fetchChannels(workspace._id);
  } catch (error) {
    toast.error('Failed to load workspace details');
  }
};

const handleRenameWorkspace = async () => {
  if (!editName.trim()) return;
  try {
    const response = await api.patch(`/workspaces/${selectedWorkspace._id}`, { name: editName });
    setWorkspaces((prev) => prev.map((w) => (w._id === response.data._id ? response.data : w)));
    setSelectedWorkspace(response.data);
    onWorkspaceSelect(response.data);
    setEditingWorkspace(false);
    toast.success('Workspace renamed!');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to rename');
  }
};

const handleDeleteWorkspace = async () => {
  if (!window.confirm(`Delete "${selectedWorkspace.name}"? This cannot be undone.`)) return;
  try {
    await api.delete(`/workspaces/${selectedWorkspace._id}`);
    const remaining = workspaces.filter((w) => w._id !== selectedWorkspace._id);
    setWorkspaces(remaining);
    setSelectedWorkspace(remaining[0] || null);
    onWorkspaceSelect(remaining[0] || null);
    setChannels([]);
    toast.success('Workspace deleted');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete');
  }
};

const handleRenameChannel = async (channel) => {
  if (!editName.trim()) return;
  try {
    const response = await api.patch(`/channels/${channel._id}`, { name: editName });
    setChannels((prev) => prev.map((c) => (c._id === response.data._id ? response.data : c)));
    setEditingChannel(null);
    toast.success('Channel renamed!');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to rename');
  }
};

const handleDeleteChannel = async (channel) => {
  if (!window.confirm(`Delete "#${channel.name}"? All messages will be lost.`)) return;
  try {
    await api.delete(`/channels/${channel._id}`);
    setChannels((prev) => prev.filter((c) => c._id !== channel._id));
    toast.success('Channel deleted');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete');
  }
};

const handleLogout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout failed');
  }
  logout();
  navigate('/login');
};


  return (
    <div className="sidebar">
      <div className="sidebar-header" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
  <h3>CollabSpace</h3>
  <div className="user-info">
    {user?.avatar ? (
      <img src={user.avatar} alt="avatar" className="sidebar-avatar" />
    ) : (
      <div className="sidebar-avatar-placeholder">{user?.name?.[0]}</div>
    )}
    <span>{user?.name}</span>
    {onlineUsers.includes(user?._id) && <span className="online-dot"></span>}
  </div>
</div>

      <div className="workspaces">
        <h4>Workspaces</h4>
      {workspaces.map((workspace) => (
  <div key={workspace._id} className="workspace-row">
    {editingWorkspace && selectedWorkspace?._id === workspace._id ? (
      <div className="inline-edit">
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleRenameWorkspace()}
          autoFocus
        />
        <span onClick={handleRenameWorkspace}>✓</span>
        <span onClick={() => setEditingWorkspace(false)}>✕</span>
      </div>
    ) : (
      <div
        className={`workspace-item ${selectedWorkspace?._id === workspace._id ? 'active' : ''}`}
        onClick={() => handleWorkspaceClick(workspace)}
      >
        {workspace.name}
        {selectedWorkspace?._id === workspace._id && (
          <span className="item-actions">
            <span onClick={(e) => { e.stopPropagation(); setEditName(workspace.name); setEditingWorkspace(true); }}>✏️</span>
            <span onClick={(e) => { e.stopPropagation(); handleDeleteWorkspace(); }}>🗑️</span>
          </span>
        )}
      </div>
    )}
  </div>
))}
        {selectedWorkspace && (
  <button className="add-btn" onClick={() => setShowInviteModal(true)}>
    🔗 Invite People
  </button>
)}
        <button className="add-btn" onClick={() => setShowWorkspaceModal(true)}>
          + New Workspace
        </button>
        <button className="add-btn" onClick={() => setShowJoinModal(true)}>
  + Join Workspace
</button>
      </div>

      <div className="channels">
        <h4>Channels</h4>
        {channels.map((channel) => (
  <div key={channel._id} className="channel-row">
    {editingChannel?._id === channel._id ? (
      <div className="inline-edit">
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleRenameChannel(channel)}
          autoFocus
        />
        <span onClick={() => handleRenameChannel(channel)}>✓</span>
        <span onClick={() => setEditingChannel(null)}>✕</span>
      </div>
    ) : (
      <div
        className={`channel-item ${selectedChannel?._id === channel._id ? 'active' : ''}`}
        onClick={() => onChannelSelect(channel)}
      >
        # {channel.name}
        <span className="item-actions">
          <span onClick={(e) => { e.stopPropagation(); setEditName(channel.name); setEditingChannel(channel); }}>✏️</span>
          <span onClick={(e) => { e.stopPropagation(); handleDeleteChannel(channel); }}>🗑️</span>
        </span>
      </div>
    )}
  </div>
))}
        {selectedWorkspace && (
          <button className="add-btn" onClick={() => setShowChannelModal(true)}>
            + New Channel
          </button>
        )}
      </div>

      <button onClick={handleLogout} className="logout-btn">Logout</button>

      {showWorkspaceModal && (
        <CreateWorkspaceModal
          onClose={() => setShowWorkspaceModal(false)}
          onCreated={(workspace) => {
            setWorkspaces((prev) => [...prev, workspace]);
            setSelectedWorkspace(workspace);
            setChannels([]);
          }}
        />
      )}

      {showChannelModal && (
        <CreateChannelModal
          workspaceId={selectedWorkspace._id}
          onClose={() => setShowChannelModal(false)}
          onCreated={(channel) => {
            setChannels((prev) => [...prev, channel]);
          }}
        />
      )}
  {showJoinModal && (
  <JoinWorkspaceModal
    onClose={() => setShowJoinModal(false)}
    onJoined={(workspace) => {
      setWorkspaces((prev) => [...prev, workspace]);
      setSelectedWorkspace(workspace);
      fetchChannels(workspace._id);
    }}
  />
)}
{showInviteModal && (
  <InviteModal
    workspace={selectedWorkspace}
    onClose={() => setShowInviteModal(false)}
  />
)}
</div>
  );
}

export default Sidebar;