import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthContext } from './context/AuthContext';
import Home from './Pages/homePages/Home';
import Login from './Pages/authPages/Login';
import Signup from './Pages/authPages/Signup';
import VerifyOtp from './Pages/authPages/VerifyOtp';
import PostDetails from './components/Post/PostDetails';
import AddPost from './Pages/homePages/AddPost';
import UserProfile from './components/user/UserProfile';
import LandingPage from './Pages/LandingPage/LandingPage'; 
import Message from './Pages/homePages/Message';
import ReelsFeed from './components/Home/Explore/ReelsFeed';
import Explore from './Pages/homePages/Explore';
import Upload from './components/WebcamFeed'
import AdminRoute from './components/Home/HomeMain/AdminRoute';
import AdminPage from './Pages/homePages/AdminPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminUserProfile from './components/Home/Admin/AdminUserProfile';
import AdminFeed from './components/Home/Admin/AdminFeed';
import AdminQuizCreator from './components/Home/Admin/AdminQuizCreator';
import AdminQuizDetail from './components/Home/Admin/AdminQuizDetail';
import AdminQuizEdit from './components/Home/Admin/AdminQuizEdit';
import QuizFeed from './components/Home/HomeMain/QuizFeed';
import QuizDetail from './components/Home/HomeMain/QuizDetail';
import HomeLayout from './components/Home/HomeMain/HomeLayout';


function App() {
  const { authUser } = useAuthContext(); // Assuming authUser contains authentication status

  return (
    <div className='p-4 h-screen flex flex-col'>
      <Routes>
        {/* Landing Page */}
        <Route path='/landing-page' element={<LandingPage />} />

        {/* OTP Verification */}
        <Route path='/verify-otp' element={<VerifyOtp />} />

        {/* Home Route - Protected */}
        {/* Home route */}
        <Route
          path="/"
          element={
            authUser?.success
              ? authUser?.user?.accountType?.toLowerCase() === "admin"
                ? <Navigate to="/admin" />
                : <Home />
              : <LandingPage />
          }
        />

        {/* Admin route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          }
        /> */}

        {/* Admin User Profile */}
        <Route path="/admin/user/:userId" element={<AdminUserProfile />} />

        <Route path="/admin/feed" element={<AdminFeed />} />
        <Route path="/admin/quiz" element={<AdminQuizCreator />} />
        <Route path="/admin/quiz/:quizId" element={<AdminQuizDetail />} />
        <Route path="/admin/quiz/edit/:quizId" element={<AdminQuizEdit />} />



        <Route
          path="/quiz"
          element={
            <HomeLayout>
              <QuizFeed />
            </HomeLayout>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <HomeLayout>
              <QuizDetail />
            </HomeLayout>
          }
        />




        {/* Auth Routes */}
        <Route path='/login' element={authUser?.success ? <Navigate to='/' /> : <Login />} />
        <Route path='/signup' element={authUser?.success ? <Navigate to='/' /> : <Signup />} />

        {/* Post Details Route */}
        <Route path='/post/:postId' element={<PostDetails />} />

        {/* Add Post Route */}
        <Route path='/add-post' element={authUser?.success ? <AddPost /> : <Navigate to="/login" />} />

        {/* User Profile Route with Dynamic ID */}
        <Route path='/profile/:userId' element={<UserProfile />} />

        <Route path='/messaging' element={authUser?.success ? <Message /> : <Navigate to="/login" />}/>

        <Route path='explore' element={authUser?.success ? <Explore/> : <Navigate to='/login'/>}/>

      </Routes>

      {/* Toaster Notifications */}
      <Toaster />
    </div>
  );
}

export default App;



