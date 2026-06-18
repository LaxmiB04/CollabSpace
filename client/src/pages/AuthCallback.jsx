import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import { getMe } from '../services/authService.js';

function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      getMe().then((user) => {
        login(user, token);
        navigate('/dashboard');
      }).catch(() => {
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
      Logging you in...
    </div>
  );
}

export default AuthCallback;