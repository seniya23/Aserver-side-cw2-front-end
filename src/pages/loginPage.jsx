import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/loader.jsx";
import { GrGoogle } from "react-icons/gr";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginPage(){

    // useState use for get every time changing input values input by the user
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [isLoading , setIsLoading] = useState(false);
    const googleLogin = useGoogleLogin({
        onSuccess: (response) => {
          //  console.log(response) you can see after login it provides access token and other details in the response({access_token: 'ya29.a0Aa7pC....)
                setIsLoading(true);
			axios.post(import.meta.env.VITE_BACKEND_URL + "/users/google-login", {
				token: response.access_token,
			}).then((res) => {
				localStorage.setItem("token", res.data.token);
				if (res.data.role == "admin") {
					navigate("/admin");
				} else {
					navigate("/");
				}
				toast.success("Login successful!.");
				setIsLoading(false);
			}).catch((err) => {
				console.log(err);
                toast.error("Google Login Failed");
			});
			setIsLoading(false);
            }, 
        onError: () => {toast.error("Google Login Failed");},
        onNonOAuthError: () => {toast.error("Non OAuth Error");},
    }); //from this get google login function, click the button and see google login popup

    async function login(){
        console.log("login button click");
        console.log("Email:", email);
        console.log("Password:", password);
        setIsLoading(true);

        try{
            const res = await axios.post(import.meta.env.VITE_BACKEND_URL + "/users/login", {
            email: email,
            password : password
        })

        console.log(res);
            
        // save the token in the localStorage(function that store data localy)coming from body of res.data 
        localStorage.setItem("token", res.data.token); 
        

        // if login credentials == admin got to adminPage , if not go to normal homePage
        if(res.data.role == "admin"){
            //window.location.href = "/admin";
            navigate("/admin")
        }
        else{
            //window.location.href = "/";
            navigate("/")
        }

        toast.success("Login successfull! Welcome back")
        setIsLoading(false);

        }catch (err){
            toast.error("Login failed! Please check your credentials and try again")
            console.log("Error during login:");
            console.log(err);
            setIsLoading(false);
        }
        
    }

    return(
        // bg-no-repeat use for not showing the same image again and again when scrolling down
    <div className="w-full h-screen bg-[url('/bg.jpg')] bg-center bg-no-repeat flex">
        <div className="w-[50%] h-full flex justify-center items-center flex-col p-[50px]">
            
            {/* you can use object-cover if image looks like shrunk */}
            <img src="/logo.png" className="object-cover w-[200px] h-[200px] mb-[20px]" alt="logo" />
            <h1 className="text-[50px] text-gold text-shadow-accent text-shadow-2xs text-center
             font-bold">PHANTASMAGORIA LTD ALUMNI PLATFORM</h1>
            <p className="text-[30px] text-white italic ">Where Prestige Shine and Community Unites</p>

        </div>
        <div className="w-[50%] h-full flex justify-center items-center">

            {/* use backdrop-blur-lg for blur the div and p-[30px] use for change the width of the components inside the div tag ex: input fiels & login button*/}
            <div className="w-[450px] h-[600px] backdrop-blur-lg shadow-2xl rounded-xl flex flex-col justify-center items-center p-[30px]">

                <h1 className="text-[40px] text-white text-shadow-white font-bold mb-[20px]">Login</h1>

                {/* focus:ring-2 is use for when type in input field the border will blow in another color with this code focus:ring-gold, so it uses for that blowing color border size , 
                And focus:outline-none this means disable orginel outline when appearing colord outline */}
                {/* onChange={(e) will get all the details in <input> , (e.target.value) is a function inside e(event) it has the details what the user have type in the input field */}
                <input 
                onChange={(e)=>{
                    setEmail(e.target.value);
                }}
                type="email" 
                placeholder="Your email" 
                className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"/>
                
                <input 
                onChange={(e)=>{
                    setPassword(e.target.value);
                }}
                type="password" 
                placeholder="Your password" 
                className="w-full h-[50px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"/>
                <p className="text-white w-full text-right mb-[20px]">Forgot your password? <Link to="/forget-password" className="text-gold italic">Reset it here</Link></p>

                <button 
                onClick={login}
                className="w-full h-[50px] bg-accent font-bold rounded-lg text-[20px] text-white border border[2px] border-accent hover:bg-transparent hover:text-accent mb-[20px]">Login</button>
                <button onClick={googleLogin} className="w-full h-[50px] bg-accent text-white font-bold text-[20px] rounded-lg border-[2px] border-accent hover:bg-transparent hover:text-accent">
						Login with <GrGoogle className="inline ml-2 mb-1" />
					</button>

                {/* To write different text color in a pragraph you have to use <span>  */}
                <p className="text-white ">Don't have an account? <Link to="/register" className="text-gold italic">Register here</Link></p>
            </div>
        </div>
        {isLoading && <Loader />}
        

    </div>
    )
}