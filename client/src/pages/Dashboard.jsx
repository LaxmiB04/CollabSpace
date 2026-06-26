import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import Sidebar from '../components/Sidebar.jsx';
import ChatArea from '../components/ChatArea.jsx';
import TaskBoard from '../components/TaskBoard.jsx';
import MemberList from '../components/MemberList.jsx';
import { io } from 'socket.io-client';
import NotificationBell from '../components/NotificationBell.jsx';
import { getMe } from '../services/authService.js';

const socket = io('http://localhost:5000');

function Dashboard() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('chat');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileMembers, setShowMobileMembers] = useState(false);

  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        navigate('/login');
      });
  }, []);

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
      <button className="mobile-menu-btn" onClick={() => setShowMobileSidebar(true)}>
        ☰
      </button>

      <div className={`sidebar-wrapper ${showMobileSidebar ? 'mobile-open' : ''}`}>
        <button className="mobile-close-btn" onClick={() => setShowMobileSidebar(false)}>
          ✕
        </button>
        <Sidebar
          onChannelSelect={(channel) => {
            setSelectedChannel(channel);
            setShowMobileSidebar(false);
          }}
          selectedChannel={selectedChannel}
          onWorkspaceSelect={setSelectedWorkspace}
        />
      </div>
      {showMobileSidebar && <div className="mobile-overlay" onClick={() => setShowMobileSidebar(false)}></div>}

      <div className="main-panel">
        {selectedChannel && (
          <div className="view-toggle">
            <button className={view === 'chat' ? 'active' : ''} onClick={() => setView('chat')}>
              💬 Chat
            </button>
            <button className={view === 'tasks' ? 'active' : ''} onClick={() => setView('tasks')}>
              ✅ Tasks
            </button>
            <button className="mobile-members-btn" onClick={() => setShowMobileMembers(true)}>
              👥
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

      <div className={`member-list-wrapper ${showMobileMembers ? 'mobile-open' : ''}`}>
        <button className="mobile-close-btn" onClick={() => setShowMobileMembers(false)}>
          ✕
        </button>
        <MemberList workspace={selectedWorkspace} onlineUsers={onlineUsers} />
      </div>
      {showMobileMembers && <div className="mobile-overlay" onClick={() => setShowMobileMembers(false)}></div>}
    </div>
  );
}

export default Dashboard;