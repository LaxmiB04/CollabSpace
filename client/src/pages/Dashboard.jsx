import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import Sidebar from '../components/Sidebar.jsx';
import ChatArea from '../components/ChatArea.jsx';

function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedChannel, setSelectedChannel] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="dashboard">
      <Sidebar onChannelSelect={setSelectedChannel} selectedChannel={selectedChannel} />
      <ChatArea channel={selectedChannel} />
    </div>
  );
}

export default Dashboard;