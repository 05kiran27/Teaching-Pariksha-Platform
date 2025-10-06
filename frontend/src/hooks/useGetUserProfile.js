// hooks/useGetUserProfile.js
import { useState, useEffect } from 'react';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useGetUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      const userId = localStorage.getItem('user-id');
      // console.log("logged in user id => ", userId);
      try {
        const token = localStorage.getItem('dv-token');
        const res = await fetch(`${BACKEND_URL}/api/v1/user/get-profile/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setProfile(data.user);
        } else {
          throw new Error(data.message || 'Failed to fetch user profile');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return { profile, loading, error };
};

export default useGetUserProfile;
