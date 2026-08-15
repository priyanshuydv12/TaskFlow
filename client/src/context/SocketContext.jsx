import { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect only if a valid authenticated user session is active
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('token');
    // Derive base server URL from VITE_API_URL (e.g. "http://localhost:5001/api" -> "http://localhost:5001")
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const socketUrl = apiBaseUrl.replace('/api', '');

    const newSocket = io(socketUrl, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      console.log(`Socket connected successfully: ${newSocket.id}`);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    setSocket(newSocket);

    // Clean up connections on logout / user changes / unmounts
    return () => {
      newSocket.disconnect();
      console.log('Socket disconnected from cleanup hook.');
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  // We can return null if not connected, but it helps to be ready
  return context;
};
