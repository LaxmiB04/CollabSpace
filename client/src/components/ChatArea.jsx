import { useState, useEffect, useRef } from 'react';
import api from '../services/api.js';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function ChatArea({ channel }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');


  useEffect(() => {
    if (!channel) return;

    socket.emit('joinChannel', channel._id);
    fetchMessages();

    socket.on('receiveMessage', (message) => {
      if (message.isReactionUpdate) {
        setMessages((prev) => prev.map((m) => (m._id === message._id ? message : m)));
      } else if (message.sender?._id !== user._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('userTyping', (data) => {
      setTypingUser(data.userName);
      setTimeout(() => setTypingUser(''), 2000);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
    };
  }, [channel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${channel._id}`);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await api.post('/messages', {
        content: newMessage,
        channelId: channel._id,
      });

      socket.emit('sendMessage', {
        ...response.data,
        channelId: channel._id,
      });

      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const messageResponse = await api.post('/messages', {
        content: `📎 ${response.data.filename}`,
        channelId: channel._id,
        attachments: [{ url: response.data.url, type: response.data.type }],
      });

      socket.emit('sendMessage', {
        ...messageResponse.data,
        channelId: channel._id,
      });

      setMessages((prev) => [...prev, messageResponse.data]);
      toast.success('File uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleTyping = () => {
    socket.emit('typing', {
      channelId: channel._id,
      userName: user.name,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const response = await api.patch(`/messages/${messageId}/react`, { emoji });
      setMessages((prev) => prev.map((m) => (m._id === messageId ? response.data : m)));

      socket.emit('sendMessage', {
        ...response.data,
        channelId: channel._id,
        isReactionUpdate: true,
      });
    } catch (error) {
      toast.error('Failed to react');
    }
  };

  if (!channel) {
    return (
      <div className="main-content">
        <h2>Welcome, {user?.name}!</h2>
        <p>Select a channel to start chatting.</p>
      </div>
    );
  }

  const handleEditStart = (msg) => {
  setEditingId(msg._id);
  setEditText(msg.content);
};

const handleEditCancel = () => {
  setEditingId(null);
  setEditText('');
};

const handleEditSave = async (messageId) => {
  if (!editText.trim()) return;
  try {
    const response = await api.patch(`/messages/${messageId}`, { content: editText });
    setMessages((prev) => prev.map((m) => (m._id === messageId ? response.data : m)));

    socket.emit('sendMessage', {
      ...response.data,
      channelId: channel._id,
      isReactionUpdate: true,
    });

    setEditingId(null);
    setEditText('');
  } catch (error) {
    toast.error('Failed to edit message');
  }
};

const handleDelete = async (messageId) => {
  try {
    await api.delete(`/messages/${messageId}`);
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    toast.success('Message deleted');
  } catch (error) {
    toast.error('Failed to delete message');
  }
};

  return (
    <div className="chat-area">
      <div className="chat-header">
        <h3># {channel.name}</h3>
        <p>{channel.description}</p>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => {
          const reactionCounts = {};
          (msg.reactions || []).forEach((r) => {
            reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
          });

          return (
            <div key={index} className={`message ${msg.sender?._id === user?._id ? 'own' : ''}`}>
              <div className="message-sender">{msg.sender?.name}</div>
              {editingId === msg._id ? (
                <div className="message-edit-box">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleEditSave(msg._id)}
                    autoFocus
                  />
                  <button onClick={() => handleEditSave(msg._id)}>Save</button>
                  <button onClick={handleEditCancel}>Cancel</button>
                </div>
              ) : msg.attachments && msg.attachments.length > 0 ? (
                <div className="message-content">
                  {msg.attachments[0].type?.startsWith('image') ? (
                    <a href={msg.attachments[0].url} target="_blank" rel="noopener noreferrer">
                      <img src={msg.attachments[0].url} alt="attachment" className="message-image" />
                    </a>
                  ) : (
                    <a href={msg.attachments[0].url} download target="_blank" rel="noopener noreferrer" className="message-file-link">
                      📄 {msg.content}
                    </a>
                  )}
                </div>
              ) : (
                <div className="message-content">
                  {msg.content} {msg.isEdited && <span className="edited-label">(edited)</span>}
                </div>
              )}

              <div className="message-footer">
                <div className="reaction-picker">
                  {['👍', '❤️', '😂', '🎉', '😮'].map((emoji) => (
                    <span key={emoji} className="reaction-option" onClick={() => handleReaction(msg._id, emoji)}>
                      {emoji}
                    </span>
                  ))}
                </div>
                {Object.keys(reactionCounts).length > 0 && (
                  <div className="reactions-display">
                    {Object.entries(reactionCounts).map(([emoji, count]) => (
                      <span key={emoji} className="reaction-badge" onClick={() => handleReaction(msg._id, emoji)}>
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                )}
                {msg.sender?._id === user?._id && !msg.attachments?.length && editingId !== msg._id && (
    <div className="message-actions">
      <span onClick={() => handleEditStart(msg)}>✏️</span>
      <span onClick={() => handleDelete(msg._id)}>🗑️</span>
    </div>
  )}
              </div>

              <div className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        {typingUser && <div className="typing-indicator">{typingUser} is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
        <button onClick={() => fileInputRef.current.click()} disabled={uploading}>
          📎
        </button>
        <input
          type="text"
          placeholder={`Message # ${channel.name}`}
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatArea;
