import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import Sidebar from '../components/Sidebar.jsx';

function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <h2>Welcome, {user?.name}!</h2>
        <p>Select a channel to start chatting.</p>
      </div>
    </div>
  );
}

export default Dashboard;