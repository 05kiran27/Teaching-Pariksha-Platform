// import { useState } from 'react';
// import toast from 'react-hot-toast';
// import { useAuthContext } from '../context/AuthContext';

// const useLogin = () => {
//   const [loading, setLoading] = useState(false);
//   const { setAuthUser } = useAuthContext();

//   const login = async (email, password) => {
//     setLoading(true);
//     try {
//       // Perform the login API request
//       const res = await fetch('http://localhost:4000/api/v1/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       // Parse the response
//       const data = await res.json();
//       // console.log(data);

//       // Check if response is okay
//       if (!res.ok) {
//         throw new Error(data.message || 'Login failed');
//       }

//       // Ensure the token is present in the response
//       if (!data.token) {
//         // console.log("if not token printing data -> ", data)
//         throw new Error('No token received in useLogin hook');
//       }

//       // Store user data and token in localStorage
//       localStorage.setItem('dv-user', JSON.stringify(data));
//       // console.log('data => ', data);
      
//       localStorage.setItem('dv-token', data.token);
//       localStorage.setItem('user-id',data.user._id );
//       // console.log('user id => ', data.user._id);

//       // Update authentication context
//       setAuthUser(data);

//       // Notify user of successful login
//       toast.success('Login successful');
//     } catch (error) {
//       // Notify user of error
//       toast.error(error.message || 'An unexpected error occurred');
//     } finally {
//       // Reset loading state
//       setLoading(false);
//     }
//   };

//   return { loading, login };
// };

// export default useLogin;




import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.token) {
        throw new Error('No token received in useLogin hook');
      }

      // Store data
      localStorage.setItem('dv-user', JSON.stringify(data));
      localStorage.setItem('dv-token', data.token);
      localStorage.setItem('user-id', data.user._id);

      // Update auth context
      setAuthUser(data);

      toast.success('Login successful');

      // ✅ Return user object so caller can use accountType
      return data.user;
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
      return null; // ✅ return null on error
    } finally {
      setLoading(false);
    }
  };

  return { loading, login };
};

export default useLogin;
