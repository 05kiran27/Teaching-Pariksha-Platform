// import React, { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import { useAuthContext } from '../context/AuthContext';
// import { useSocketContext } from '../context/SocketContext'; // Import socket context

// const useGetConversations = () => {
//   const [loading, setLoading] = useState(false);
//   const [conversations, setConversations] = useState([]);
//   const { authUser } = useAuthContext();
//   const { socket } = useSocketContext(); // Use socket context to listen for real-time events

//   // Fetch conversations from the API
//   const getConversations = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('dv-token');
//       const userId = authUser?.user?.id;

//       if (!token) {
//         throw new Error('Token not found');
//       }

//       const res = await fetch('http://localhost:4000/api/v1/messages/message', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();
//       console.log('data in useGetConversation => ', data);

//       if (!res.ok) {
//         throw new Error(data.message || 'Failed to fetch conversations');
//       }

//       setConversations(data); // Update conversation state
//     } catch (error) {
//       toast.error(error.message || 'An unexpected error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (authUser) {
//       // Fetch conversations initially
//       getConversations();

//       // Listen for WebSocket events when a new message is sent or received
//       if (socket) {
//         socket.on('newMessage', () => {
//           console.log('New message received, fetching updated conversations...');
//           getConversations(); // Fetch updated conversations when a new message is received
//         });

//         // Cleanup the socket listener when the component unmounts
//         return () => {
//           socket.off('newMessage');
//         };
//       }
//     }
//   }, [authUser, socket]); // Re-run when authUser or socket changes

//   return { loading, conversations };
// };

// export default useGetConversations;



import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext'; // Import socket context
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext(); // Use socket context to listen for real-time events

  // Fetch conversations from the API
  const getConversations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('dv-token');
      const userId = authUser?.user?.id;

      if (!token) {
        throw new Error('Token not found');
      }

      const res = await fetch(`${BACKEND_URL}/api/v1/messages/message`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log('data in useGetConversation => ', data);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch conversations');
      }

      setConversations(data); // Update conversation state
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      // Fetch conversations initially
      getConversations();

      // Listen for WebSocket events when a new message is sent or received
      if (socket) {
        // Listen for incoming messages
        socket.on('newMessage', () => {
          console.log('New message received, fetching updated conversations...');
          getConversations(); // Fetch updated conversations when a new message is received
        });

        // Listen for messages sent by the user
        socket.on('messageSent', () => {
          console.log('Message sent by the user, fetching updated conversations...');
          getConversations(); // Fetch updated conversations when the user sends a message
        });

        // Cleanup the socket listeners when the component unmounts
        return () => {
          socket.off('newMessage');
          socket.off('messageSent');
        };
      }
    }
  }, [authUser, socket]); // Re-run when authUser or socket changes

  return { loading, conversations };
};

export default useGetConversations;
