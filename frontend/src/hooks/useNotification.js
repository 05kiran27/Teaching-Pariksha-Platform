// import { useState, useEffect } from 'react';
// import axios from 'axios';

// // Custom hook to fetch notifications and mark them as read when opened
// const useNotification = (isOpen) => {
//   const [notifications, setNotifications] = useState({
//     loading: false,
//     error: null,
//     data: [],
//     unreadCount: 0,
//   });

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       setNotifications((prevState) => ({ ...prevState, loading: true }));
//       try {
//         // Fetch all notifications with pagination and unread count
//         const notificationResponse = await axios.get('http://localhost:4000/api/v1/notification/notifications?page=1&limit=10', {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('dv-token')}`,
//           },
//         });
//         console.log('notification response => ', notificationResponse);

//         const unreadResponse = await axios.get('http://localhost:4000/api/v1/notification/notifications/unread-count', {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('dv-token')}`,
//           },
//         });

//         const unreadNotifications = notificationResponse.data.notifications.filter(n => !n.isRead);
//         const unreadIds = unreadNotifications.map(n => n._id);

//         // If there are unread notifications and the modal is open, mark them as read
//         if (isOpen && unreadIds.length > 0) {
//           await markAllAsRead(unreadIds);
//         }

//         setNotifications({
//           loading: false,
//           error: null,
//           data: notificationResponse.data.notifications,
//           unreadCount: unreadResponse.data.unreadCount,
//         });
//       } catch (err) {
//         setNotifications({
//           loading: false,
//           error: 'Failed to fetch notifications',
//           data: [],
//           unreadCount: 0,
//         });
//       }
//     };

//     const markAllAsRead = async () => {
//       try {
//         const token = localStorage.getItem('dv-token');
    
//         await axios.patch(
//           'http://localhost:4000/api/v1/notification/notifications/mark-as-read', 
//           {}, 
//           {
//             headers: {
//               'Authorization': `Bearer ${token}`, // Pass the token in headers
//             },
//           }
//         );
    
//         setNotifications((prev) => ({
//           ...prev,
//           unreadCount: 0, // Update the unread count to 0
//         }));
//       } catch (err) {
//         console.error('Error marking notifications as read', err);
//       }
//     };
    

//     if (isOpen) {
//       fetchNotifications();
//     }
//   }, [isOpen]);

//   return notifications;
// };

// export default useNotification;



// /hooks/useNotification.js
import { useState, useEffect } from 'react';
import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useNotification = (isOpen) => {
  const [notifications, setNotifications] = useState({
    loading: false,
    error: null,
    data: [],
    unreadCount: 0,
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      setNotifications((prevState) => ({ ...prevState, loading: true }));
      try {
        // Fetch notifications with pagination, including sender details (profilePic, name)
        const notificationResponse = await axios.get(`${BACKEND_URL}/api/v1/notification/notifications?page=1&limit=10`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('dv-token')}`,
          },
        });

        const unreadResponse = await axios.get(`${BACKEND_URL}/api/v1/notification/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('dv-token')}`,
          },
        });

        const unreadNotifications = notificationResponse.data.notifications.filter(n => !n.isRead);
        const unreadIds = unreadNotifications.map(n => n._id);

        // If there are unread notifications and the modal is open, mark them as read
        if (isOpen && unreadIds.length > 0) {
          await markAllAsRead(unreadIds);
        }

        // Update state with the fetched notifications and unread count
        setNotifications({
          loading: false,
          error: null,
          data: notificationResponse.data.notifications.map(notification => ({
            ...notification,
            senderName: notification.sender.name,
            senderProfilePic: notification.sender.images, // Extract profilePic and name from sender
          })),
          unreadCount: unreadResponse.data.unreadCount,
        });
      } catch (err) {
        setNotifications({
          loading: false,
          error: 'Failed to fetch notifications',
          data: [],
          unreadCount: 0,
        });
      }
    };

    const markAllAsRead = async () => {
      try {
        const token = localStorage.getItem('dv-token');
    
        await axios.patch(
          `${BACKEND_URL}/api/v1/notification/notifications/mark-as-read`, 
          {}, 
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass the token in headers
            },
          }
        );
    
        setNotifications((prev) => ({
          ...prev,
          unreadCount: 0, // Update unread count to 0
        }));
      } catch (err) {
        console.error('Error marking notifications as read', err);
      }
    };
    
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  return notifications;
};

export default useNotification;
