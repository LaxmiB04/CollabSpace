import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import Sidebar from '../components/Sidebar.jsx';
import ChatArea from '../components/ChatArea.jsx';
import TaskBoard from '../components/TaskBoard.jsx';

function Dashboard() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('chat');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [token, navigate]);

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

  return (
    <div className="dashboard">
      <Sidebar onChannelSelect={setSelectedChannel} selectedChannel={selectedChannel} />
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
          </div>
        )}
        {view === 'chat' || !selectedChannel ? (
          <ChatArea channel={selectedChannel} />
        ) : (
          <TaskBoard channel={selectedChannel} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;