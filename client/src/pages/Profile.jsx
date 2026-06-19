import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import api from '../services/api.js';
import toast from 'react-hot-toast';

function Profile() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const response = await api.patch('/auth/profile', { avatar: uploadRes.data.url });
      setUser(response.data);
      toast.success('Avatar updated!');
    } catch (error) {
      toast.error('Failed to update avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!name.trim()) return;
    try {
      const response = await api.patch('/auth/profile', { name });
      setUser(response.data);
      toast.success('Name updated!');
    } catch (error) {
      toast.error('Failed to update name');
    }
  };

  return (
    <div className="profile-page">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>

      <div className="profile-card">
        <h2>My Profile</h2>

        <div className="avatar-section">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">{user?.name?.[0]}</div>
          )}
          <label className="upload-avatar-btn">
            {uploading ? 'Uploading...' : 'Change Avatar'}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
          </label>
        </div>

        <div className="profile-field">
          <label>Name</label>
          <div className="profile-input-row">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={handleNameUpdate}>Save</button>
          </div>
        </div>

        <div className="profile-field">
          <label>Email</label>
          <p>{user?.email}</p>
        </div>

        <div className="profile-field">
          <label>Joined</label>
          <p>{new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;