import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import Sidebar from '../components/Sidebar.jsx';
import ChatArea from '../components/ChatArea.jsx';
import TaskBoard from '../components/TaskBoard.jsx';
import MemberList from '../components/MemberList.jsx';
import { io } from 'socket.io-client';
import NotificationBell from '../components/NotificationBell.jsx';

const socket = io('http://localhost:5000');

function Dashboard() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('chat');
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [token, navigate]);

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

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

  return (
    <div className="dashboard">
      <Sidebar
        onChannelSelect={setSelectedChannel}
        selectedChannel={selectedChannel}
        onWorkspaceSelect={setSelectedWorkspace}
      />
      <div className="main-panel">
        {selectedChannel && (
          <div className="view-toggle">
            <button
              className={view === 'chat' ? 'active' : ''}
              onClick={() => setView('chat')}
            >
              💬 Chat
            </button>
            <button
              className={view === 'tasks' ? 'active' : ''}
              onClick={() => setView('tasks')}
            >
              ✅ Tasks
            </button>
             <div style={{ marginLeft: 'auto' }}>
                <NotificationBell />
             </div>
          </div>
        )}
        {view === 'chat' || !selectedChannel ? (
  <ChatArea channel={selectedChannel} />
) : (
  <TaskBoard channel={selectedChannel} workspace={selectedWorkspace} />
)}
      </div>
      <MemberList workspace={selectedWorkspace} onlineUsers={onlineUsers} />
    </div>
  );
}

export default Dashboard;