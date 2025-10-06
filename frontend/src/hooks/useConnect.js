import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useConnect = (currentUserId, ownerId) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Track if users are already connected
  const [error, setError] = useState(null);

  // Fetch the initial connection status when the component mounts
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/connect/user/${currentUserId}/isConnected/${ownerId}`);
        setIsConnected(response.data.isConnected); // Update the connection status
      } catch (err) {
        setError(err.response ? err.response.data.message : 'An error occurred');
      }
    };

    checkConnectionStatus();
  }, [currentUserId, ownerId]);

  // Function to send a connection request
  const sendConnectionRequest = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/connect/user/${currentUserId}/connect/${ownerId}`);
      setIsConnected(true); // Set connected status to true after a successful request
      return response.data;
    } catch (err) {
      setIsConnecting(false);
      setError(err.response ? err.response.data.message : 'An error occurred');
    } finally {
      setIsConnecting(false); // End loading state
    }
  };

  return { sendConnectionRequest, isConnecting, isConnected, error };
};

export default useConnect;
