import React, { useState } from 'react';
import toast from 'react-hot-toast'; 
import { useAuthContext } from '../context/AuthContext';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const useLogout = () => {
    const [loading, setLoading] = useState(false);
    const { setAuthUser } = useAuthContext();

    const logout = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                throw new Error('Failed to logout. Please try again.');
            }

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            localStorage.removeItem('dv-user');
            setAuthUser(null);
            toast.success('Logout successful');
        } catch (error) {
            toast.error(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return { loading, logout };
};

export default useLogout;
