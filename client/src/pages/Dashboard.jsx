import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import Sidebar from '../components/Sidebar.jsx';
import ChatArea from '../components/ChatArea.jsx';

function Dashboard() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <ChatArea channel={selectedChannel} />
    </div>
  );
}

export default Dashboard;