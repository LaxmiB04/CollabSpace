import { useEffect, useState } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

function MemberList({ workspace, onlineUsers }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (workspace) fetchMembers();
  }, [workspace]);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/workspaces/${workspace._id}`);
      setMembers(response.data.members);
    } catch (error) {
      toast.error('Failed to load members');
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
            <span className="member-role">{m.role}</span>
          </div>
          {onlineUsers.includes(m.user._id) ? (
            <span className="online-dot"></span>
          ) : (
            <span className="offline-dot"></span>
          )}
        </div>
      ))}
    </div>
  );
}

export default MemberList;