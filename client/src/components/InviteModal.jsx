import { useState } from 'react';
import toast from 'react-hot-toast';

function InviteModal({ workspace, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(workspace.inviteCode);
    setCopied(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Invite to {workspace.name}</h3>
        <p style={{ color: '#888', fontSize: '13px' }}>
          Share this code with people you want to invite to this workspace.
        </p>
        <div className="invite-code-box">
          <span>{workspace.inviteCode}</span>
          <button onClick={handleCopy}>{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default InviteModal;