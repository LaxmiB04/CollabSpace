import { useEffect, useState } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';

function MemberList({ workspace, onlineUsers, onWorkspaceUpdate }) {
  const [members, setMembers] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    if (workspace) setMembers(workspace.members || []);
  }, [workspace]);

  const currentUserRole = members.find((m) => m.user._id === user?._id)?.role;
  const isAdmin = currentUserRole === 'admin';

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await api.patch(`/workspaces/${workspace._id}/members/${userId}/role`, {
        role: newRole,
      });
      setMembers(response.data.members);
      toast.success('Role updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemove = async (userId, name) => {
    if (!window.confirm(`Remove ${name} from this workspace?`)) return;
    try {
      const response = await api.delete(`/workspaces/${workspace._id}/members/${userId}`);
      setMembers(response.data.members);
      toast.success('Member removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  if (!workspace) return null;

  return (
    <div className="member-list">
      <h4>Members ({members.length})</h4>
      {members.map((m) => (
        <div key={m.user._id} className="member-item">
          {m.user.avatar ? (
            <img src={m.user.avatar} alt="avatar" className="member-avatar" />
          ) : (
            <div className="member-avatar-placeholder">{m.user.name?.[0]}</div>
          )}
          <div className="member-info">
            <span className="member-name">{m.user.name}</span>
            {isAdmin && m.user._id !== user._id ? (
              <select
                className="role-select"
                value={m.role}
                onChange={(e) => handleRoleChange(m.user._id, e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="guest">Guest</option>
              </select>
            ) : (
              <span className="member-role">{m.role}</span>
            )}
          </div>
          {onlineUsers.includes(m.user._id) ? (
            <span className="online-dot"></span>
          ) : (
            <span className="offline-dot"></span>
          )}
          {isAdmin && m.user._id !== user._id && (
            <button className="remove-member-btn" onClick={() => handleRemove(m.user._id, m.user.name)}>
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default MemberList;