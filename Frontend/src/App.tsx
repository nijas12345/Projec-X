
import { BrowserRouter as Router,Routes,Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/Login"
import SignIn from "./pages/SignIn"
import OtpVerificationPage from "./pages/OtpVerification"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google"
import TimeTrackingTable from "./pages/clockStatus"
import ChatPage from "./pages/Chatpage"
import MeetingPage from "./pages/meetingPage"
import VideoCallPage from "./pages/videoCallPage"
import AdminLandingPage from "./pages/adminLandingPage"
import PremiumPage from "./pages/premiumPage"
import AdminLogin from "./pages/adminLogin"
import AdminSignIn from "./pages/adminRegister"
import AdminOtpVerificationPage from "./pages/adminOtpVerification"
import AdminHome from "./pages/AdminHome"
import UserManagement from "./pages/userManagement"
import AdminChatPage from "./pages/adminChatPage"
import AdminMeetingPage from "./pages/adminMeetingPage"
import AdminProfile from "./pages/adminProfile"
import SuccessPage from "./pages/successPage"
import CancelPage from "./pages/cancelPage"
import MeetingExit from "./pages/meetingExit"
import AdminMeetingExit from "./pages/admin-meetingExit"
import { ForgotPage } from "./pages/forgotPage"
import { ResetPasswordPage } from "./pages/resetPasswordPage"
import { AdminForgotPage } from "./pages/admin-forgotPage"
import { AdminResetPasswordPage } from "./pages/admin-resetPasswordPage"


function App() {
  const googleClientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <>
    <GoogleOAuthProvider clientId={googleClientID}>
    <Router>
      <Routes>
        <Route path="/" element={<AdminLandingPage/>}></Route>
        <Route path="/login" element={<LoginPage/>}></Route>
        <Route path="/sign-in" element={<SignIn/>}></Route>
        <Route path="/admin/login" element={<AdminLogin/>}></Route>
        <Route path="/admin/sign-in" element={<AdminSignIn/>}></Route>
        <Route path='/otp' element={<OtpVerificationPage/>}></Route>
        <Route path='/admin/otp' element={<AdminOtpVerificationPage/>}></Route>
        <Route path="/home" element={<Home/>}></Route>
        <Route path="/admin/home" element={<AdminHome/>}></Route>
        <Route path='/profile'element={<Profile/>}></Route>
        <Route path='/admin/profile'element={<AdminProfile/>}></Route>
        <Route path="/clock-details" element={<TimeTrackingTable/>}></Route>
        <Route path='/chat' element={<ChatPage/>}></Route>
        <Route path='/admin/chat' element={<AdminChatPage/>}></Route>
        <Route path='/admin/meetings' element={<AdminMeetingPage/>}></Route>
        <Route path='/meetings' element={<MeetingPage/>}></Route>
        <Route path='/videoCall' element={<VideoCallPage/>}></Route>
        <Route path='/admin' element={<LandingPage/>}></Route>
        <Route path="/premium" element={<PremiumPage/>}></Route>
        <Route path="/admin/management" element={<UserManagement/>}></Route>
        <Route path="/admin/success" element={<SuccessPage/>}></Route>
        <Route path="/admin/cancel" element={<CancelPage/>}></Route>
        <Route path="/meetingexit/:roomId" element={<MeetingExit/>}></Route>
        <Route path="/admin/meetingexit/:roomId" element={<AdminMeetingExit/>}></Route>
        <Route path="/forgot" element={<ForgotPage/>}></Route>
        <Route path="/admin/forgot" element={<AdminForgotPage/>}></Route>
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/admin/reset-password/:token" element={<AdminResetPasswordPage />} />
      </Routes>
    </Router>
    <ToastContainer />
    </GoogleOAuthProvider>
    </>
  )
}

export default App
