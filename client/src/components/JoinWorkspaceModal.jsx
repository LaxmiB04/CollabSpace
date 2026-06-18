import { useState } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

function JoinWorkspaceModal({ onClose, onJoined }) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    try {
      const response = await api.post('/workspaces/join', { inviteCode });
      toast.success('Joined workspace!');
      onJoined(response.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Join Workspace</h3>
        <input
          type="text"
          placeholder="Enter invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleJoin} disabled={loading}>
            {loading ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinWorkspaceModal;