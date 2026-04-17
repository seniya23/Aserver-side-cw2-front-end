import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import Header from './components/header.jsx'
//import { ProductCard } from './components/productCard.jsx'
//import Test from './components/test..jsx';
import HomePage from './pages/homePage.jsx';
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage.jsx';
import AdminPage from './pages/adminPage.jsx';
//import TestPage from './pages/test.jsx';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ForgetPasswordPage from './pages/forgetPasswordPage.jsx';



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

          <Route path="/*" element={<HomePage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/admin/*" element={<AdminPage/>}/>
          {/* <Route path="/test" element={<TestPage/>}/> */}
          <Route path="/forget-password" element={<ForgetPasswordPage/>}/>
          
        </Routes>
      </div>
    </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
