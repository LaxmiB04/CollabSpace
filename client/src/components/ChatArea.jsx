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
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!channel) return;

    // Join the channel room
    socket.emit('joinChannel', channel._id);

    // Fetch existing messages
    fetchMessages();

    // Listen for new messages
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing
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

      // Emit to socket
      socket.emit('sendMessage', {
        content: newMessage,
        channelId: channel._id,
        sender: user,
      });

      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
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

  if (!channel) {
    return (
      <div className="main-content">
        <h2>Welcome, {user?.name}!</h2>
        <p>Select a channel to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <h3># {channel.name}</h3>
        <p>{channel.description}</p>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender?._id === user?._id ? 'own' : ''}`}>
            <div className="message-sender">{msg.sender?.name}</div>
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {typingUser && <div className="typing-indicator">{typingUser} is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
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