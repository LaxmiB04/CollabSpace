import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore.js';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import CreateWorkspaceModal from './CreateWorkspaceModal.jsx';
import CreateChannelModal from './CreateChannelModal.jsx';
import JoinWorkspaceModal from './JoinWorkspaceModal.jsx';

function Sidebar({ onChannelSelect, selectedChannel }) {
  const { user, logout } = useAuthStore();
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get('/workspaces');
      setWorkspaces(response.data);
      if (response.data.length > 0) {
        setSelectedWorkspace(response.data[0]);
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

  const handleWorkspaceClick = (workspace) => {
    setSelectedWorkspace(workspace);
    fetchChannels(workspace._id);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>CollabSpace</h3>
        <span>{user?.name}</span>
      </div>

      <div className="workspaces">
        <h4>Workspaces</h4>
        {workspaces.map((workspace) => (
          <div
            key={workspace._id}
            className={`workspace-item ${selectedWorkspace?._id === workspace._id ? 'active' : ''}`}
            onClick={() => handleWorkspaceClick(workspace)}
          >
            {workspace.name}
          </div>
        ))}
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
          <div
            key={channel._id}
            className={`channel-item ${selectedChannel?._id === channel._id ? 'active' : ''}`}
            onClick={() => onChannelSelect(channel)}
          >
            # {channel.name}
          </div>
        ))}
        {selectedWorkspace && (
          <button className="add-btn" onClick={() => setShowChannelModal(true)}>
            + New Channel
          </button>
        )}
      </div>

      <button onClick={logout} className="logout-btn">Logout</button>

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
</div>
  );
}

export default Sidebar;