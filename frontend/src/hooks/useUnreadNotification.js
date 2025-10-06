import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useUnreadNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/notification/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('dv-token')}`,
          },
        });
        setUnreadCount(response.data.unreadCount);
      } catch (err) {
        console.error('Failed to fetch unread notification count', err);
      }
    };

    fetchUnreadCount();

    // Polling or interval to keep checking unread count (optional)
    const intervalId = setInterval(fetchUnreadCount, 60000); // Poll every 60 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return unreadCount;
};

export default useUnreadNotification;
