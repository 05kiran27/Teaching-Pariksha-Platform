import { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useSendOtp = () => {
    const [loading, setLoading] = useState(false);

    const sendOtp = async (userData) => {
        setLoading(true);
        try {
            // Call the backend API to send OTP
            await axios.post(`${BACKEND_URL}/api/v1/auth/sendOtp`, userData);
            setLoading(false);
            return true;
        } catch (error) {
            setLoading(false);
            console.error('Error sending OTP:', error);
            return false;
        }
    };

    return { loading, sendOtp };
};

export default useSendOtp;
