import { useState, useEffect } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

function PinnedMessages({ channel, onResultClick, refreshTrigger }) {
  const [pinned, setPinned] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (channel) fetchPinned();
  }, [channel, refreshTrigger]);

  const fetchPinned = async () => {
    try {
      const response = await api.get(`/messages/${channel._id}/pinned`);
      setPinned(response.data);
    } catch (error) {
      toast.error('Failed to load pinned messages');
    }
  };

  if (!channel) return null;

  return (
    <div className="pinned-wrapper">
      <button className="pinned-toggle-btn" onClick={() => setShowPanel(!showPanel)}>
        📌 {pinned.length > 0 && <span>{pinned.length}</span>}
      </button>

      {showPanel && (
        <div className="pinned-dropdown">
          <div className="pinned-dropdown-header">Pinned Messages</div>
          {pinned.length === 0 ? (
            <p className="search-status">No pinned messages</p>
          ) : (
            pinned.map((msg) => (
              <div
                key={msg._id}
                className="pinned-item"
                onClick={() => {
                  onResultClick(msg._id);
                  setShowPanel(false);
                }}
              >
                <div className="search-result-sender">{msg.sender?.name}</div>
                <div className="search-result-content">{msg.content}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PinnedMessages;