import { useState, useEffect } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark as read');
      }
    }
  };

  return (
    <div className="notification-bell-wrapper">
      <button className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="no-notifications">No notifications yet</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <p>{notif.message}</p>
                <span className="notification-time">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;