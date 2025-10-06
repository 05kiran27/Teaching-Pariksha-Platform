import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useProfile = () => {
  const { userId } = useParams(); // Extract userId from the route parameters
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
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

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  return { profile, loading, error };
};

export default useProfile;
