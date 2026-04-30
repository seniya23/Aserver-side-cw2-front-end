import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import HomePage from './pages/homePage.jsx';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage.jsx';
import AdminPage from './pages/adminPage.jsx';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ForgetPasswordPage from './pages/forgetPasswordPage.jsx';
import AlumniProfilePage from './pages/alumniProfilePage.jsx';
import AlumniProfileFormPage from './pages/alumniProfileFormPage.jsx';
import BiddingPage from './pages/biddingPage.jsx';
import MyProfilePage from './pages/myProfilePage.jsx';
import PublicAnalyticsPage from './pages/publicAnalyticsPage.jsx';



function App() {
  
  return (

    // rap with browser router after install react-dom 
    //rap with GoogleOAuthProvider after install @react-oauth/google
    <GoogleOAuthProvider clientId="132930278699-oh8ffu0sdpjpn70b3ee3ufn4jl8ioo49.apps.googleusercontent.com">
    <BrowserRouter> 
      <Toaster position='top-right'/>
      
      {/* here you need to give h-screen for hight beacuse it doesn't have another <div> to predict what is hight */}
      <div className='w-full h-screen bg-primary text-secondary'>

        <Routes>

          <Route path="/" element={<HomePage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/admin/*" element={<AdminPage/>}/>
          <Route path="/alumni/:email" element={<AlumniProfilePage/>}/>
          <Route path="/my-profile" element={<MyProfilePage/>}/>
          <Route path="/profile-form" element={<AlumniProfileFormPage/>}/>
          <Route path="/bidding" element={<BiddingPage/>}/>
          <Route path="/analytics" element={<PublicAnalyticsPage/>}/>
          <Route path="/forget-password" element={<ForgetPasswordPage/>}/>
          <Route path="*" element={<HomePage/>}/>
          
        </Routes>
      </div>
    </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
