
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useLogin from '../../hooks/useLogin';  // Import the login hook

import logo from '../../assets/logo1.jfif';
import growth from '../../assets/growth.jfif';
import innove from '../../assets/innove.jfif';
import invest from '../../assets/invest.jfif';

const Login = () => {
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const { loading, login } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await login(inputs.email, inputs.password);

    if (user) {
      if (user.accountType?.toLowerCase() === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  };



    return (
        <div className='w-full h-screen bg-blue-950'>
            {/* Navbar */}
            <header className='navbar flex w-full h-[80px] items-center px-32 pt-6'>
                <div className='text-white flex justify-center w-1/4 bg-transparent ml-10 pl-10'>
                    <img src={logo} alt="Logo" className='h-10 w-10 bg-transparent rounded-full' />
                    <p className='text-2xl font-bold pl-3'>Dev&Innove</p>
                </div>

                <div className='flex w-2/4 justify-center'>
                    <Link className='text-white text-xl px-5 cursor-pointer'>Home</Link>
                    <Link className='text-white text-xl px-5 cursor-pointer'>About Us</Link>
                    <Link className='text-white text-xl px-5 cursor-pointer'>Contact Us</Link>
                </div>

                <div className='flex items-center px-2'>
                    <Link to={'/signup'} className='py-2 px-5 text-white text-md border border-blue-400 font-bold rounded-md transform transition-transform duration-300 hover:scale-105' onClick={() => navigate('/Signup')}>
                        Sign up
                    </Link>
                </div>
            </header>

            {/* Main Section */}
            <div className='container flex mx-[100px] mt-10 w-full'>
                <div className='left flex w-1/2 h-[500px] text-white flex-col mt-10'>
                    {/* Info Boxes */}
                    <div className='first border p-5 w-[500px] mb-10 rounded-2xl transform transition-transform duration-300 hover:scale-105 hover:border hover:border-blue-400'>
                        <img src={growth} alt='growth' className='w-[50px] h-[50px] rounded-full' />
                        <p className='text-xl'>Growth: Elevate Your Ideas</p>
                    </div>
                    <div className='second border p-5 w-[500px] mt-5 mb-10 rounded-2xl transform transition-transform duration-300 hover:scale-105 hover:border hover:border-blue-400'>
                        <img src={innove} alt='innove' className='w-[50px] h-[50px] rounded-full' />
                        <p className='text-xl'>Innove: Build Your Ideas</p>
                    </div>
                    <div className='third border p-5 w-[500px] mt-5 mb-10 rounded-2xl transform transition-transform duration-300 hover:scale-105 hover:border hover:border-blue-400'>
                        <img src={invest} alt='invest' className='w-[50px] h-[50px] rounded-full' />
                        <p className='text-xl'>Invest in the world's best startups</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className='right flex items-center justify-center w-1/2 h-[500px] text-white flex-col'>
                    <div className='flex flex-col h-[400px] border transform transition-transform duration-300 hover:scale-105 hover:border hover:border-blue-400 p-8 bg-white rounded-lg shadow-md shadow-cyan-200'>
                        <p className='font-bold text-3xl space-x-3 mb-10'>
                            <span className='text-gray-500'>Welcome To </span>
                            <span className='text-blue-500'>Dev&Innove</span>
                        </p>

                        {/* Input Fields */}
                        <input
                            className='h-[40px] px-6 mb-4 text-lg bg-gray-100 text-black border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                            placeholder='Enter your email'
                            value={inputs.email}
                            onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                        />

                        <input
                            className='h-[40px] px-6 mb-4 text-lg bg-gray-100 text-black border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                            placeholder='Enter your password'
                            type='password'
                            value={inputs.password}
                            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                        />

                        <div className='flex justify-between'>
                            <Link to={'/signup'} className='text-blue-400 mb-4 cursor-pointer'>
                                Don't have an account?
                            </Link>
                            <Link className='text-blue-500'>Forgot password</Link>
                        </div>

                        <div className='flex items-center justify-center'>
                            <button className='w-1/2 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-300' disabled={loading}>
                                {loading ? <span className='loading loading-spinner'></span> : "Login"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
