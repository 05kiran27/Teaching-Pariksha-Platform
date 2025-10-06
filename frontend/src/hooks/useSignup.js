import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext(); // Use the setter for authUser

  const signup = async ({ firstName, lastName, email, password, confirmPassword, accountType, otp }) => {
    const success = handleInputErrors({ firstName, lastName, email, password, confirmPassword, accountType, otp });
    if (!success) return false;

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, confirmPassword, accountType, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Display error message on failure
        throw new Error(data.message || "Signup failed. Please try again.");
      }

      // Store user data and token in localStorage
      localStorage.setItem('dv-user', JSON.stringify(data));
      // console.log('data => ', data);
      
      localStorage.setItem('dv-token', data.token);
      localStorage.setItem('user-id',data.user._id );
      // console.log('user id => ', data.user._id);

      // Update authentication context
      setAuthUser(data);
      
      return true; // Indicate success

    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, signup };
};

export default useSignup;

function handleInputErrors({ firstName, lastName, email, password, confirmPassword, accountType, otp }) {
  if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
    toast.error("All fields are required");
    return false;
  }
  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return false;
  }
  return true;
}
