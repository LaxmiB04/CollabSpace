import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import useAuthStore from './store/authStore.js';
import { getMe } from './services/authService.js';

function App() {
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      getMe().then((user) => setUser(user)).catch(() => {});
    }
  }, []);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}

export default App;