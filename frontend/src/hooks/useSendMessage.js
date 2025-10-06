// useSendMessage hook (frontend)
import React, { useState } from 'react';
import useConversation from '../zustand/useConversation';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useSendMessage = () => {
    const [loading, setLoading] = useState(false);
    const { messages, setMessages, selectedConversation } = useConversation();

    const sendMessage = async (message) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('dv-token');
            if (!token) throw new Error('Token not found in useSendMessage hook');

            const res = await fetch(`${BACKEND_URL}/api/v1/messages/message/send/${selectedConversation._id}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ message })
            });

            // console.log("response from backend after sending message => ", res);

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            // Assuming data.newMessage includes senderId
            setMessages([...messages, data.newMessage]); // Add new message to state
        } catch (error) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return { sendMessage, loading };
};

export default useSendMessage;
