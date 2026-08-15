import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { Bell, Check, Clock, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';

const NotificationBell = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      if (response.data && response.data.success) {
        setNotifications(response.data.data);
        const unreads = response.data.data.filter(n => !n.read).length;
        setUnreadCount(unreads);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Close dropdown on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      console.log('Socket event: notification:received ->', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(c => c + 1);

      // Play soft notification sound if available
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-100.wav');
        audio.volume = 0.2;
        audio.play();
      } catch (e) {
        // Safe to ignore if blocked by browser autoplay rules
      }
    };

    socket.on('notification:received', handleNewNotification);

    return () => {
      socket.off('notification:received', handleNewNotification);
    };
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      if (response.data && response.data.success) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'task-assigned':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'status-changed':
        return <Clock className="w-4 h-4 text-purple-400" />;
      case 'deadline-approaching':
        return <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-100 flex items-center justify-center focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-rose-600 border-2 border-slate-950 text-[10px] font-black text-white rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden flex flex-col max-h-[400px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-950/40">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Notifications</span>
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* List content */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-850 [color-scheme:dark]">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500">All caught up! No notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 flex items-start space-x-3 transition-colors ${
                    n.read ? 'bg-transparent text-slate-400' : 'bg-primary-500/[0.02] text-slate-100'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 bg-slate-950 rounded-lg border border-slate-850">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs leading-relaxed font-medium">{n.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-500">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="flex items-center space-x-1 text-[10px] text-primary-400 hover:text-primary-300 font-semibold"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
