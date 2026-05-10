import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { LuBoxes, LuClipboardList } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { MdOutlineRateReview } from "react-icons/md";
import { useEffect } from "react";
import Loader from "../components/loader.jsx";
import AdminUsersPage from "./admin/adminUserPage.jsx";
import toast from "react-hot-toast";
import { BiAnalyse, BiData, BiKey, BiUser } from "react-icons/bi";
import AdminAnalyticsPage from "./admin/adminAnalyticsPage.jsx";
import AdminApiKeysPage from "./admin/adminApiKeysPage.jsx";
import AdminBiddingPage from "./admin/adminBiddingPage.jsx";
import { BsCash } from "react-icons/bs";
import { FaTrophy } from "react-icons/fa";
import AdminAlumniOfDayPage from "./admin/adminAlumniOfDayPage.jsx";

export default function AdminPage(){
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;

    useEffect(()=>{                                               
        if(!isAuthenticated){
            toast.error("Please log in as admin.");
            navigate("/login");
        }
    },[isAuthenticated, navigate])

    return(
    
    <div  className="w-full h-full flex bg-accent">
        {!isAuthenticated ? <Loader /> :  
        <>
        <div  className="w-[300px] h-full bg-accent">
            <div  className="w-full h-[100px] text-primary flex items-center">
                <img src="/logo.png" className="h-full"/>
                <h1 className="text-2xl">Admin </h1>
            </div>

            <div  className="w-full h-[400px] text-white text-2xl flex flex-col pl-[20px] pt-[20px]">
                
                {/* use <Link> tag instid of usinkg <a href> becuase you can stop refreshing when moving among pages */}
                <Link to="/admin" className="w-full flex items-center h-[50px] gap-[10px]"><BiUser/>Users</Link>
                <Link to="/admin/analytics" className="w-full flex items-center h-[50px] gap-[10px]"><BiAnalyse/>Analytics</Link>
                <Link to="/admin/api-keys" className="w-full flex items-center h-[50px] gap-[10px]"><BiKey/>Api Keys</Link>
                <Link to="/admin/bidding" className="w-full flex items-center h-[50px] gap-[10px]"><BsCash/>Bidding</Link>
                <Link to="/admin/alumni-of-the-day" className="w-full flex items-center h-[50px] gap-[10px]"><FaTrophy/>Alumni of Day</Link>
                
            </div>


        </div>

        {/* you can use calc option in css to do calculations for colors, becuase pixel size
         depend on monitor size but using this method soleve that problem */}
        <div className="w-[calc(100%-300px)] bg-primary h-full max-h-full border-[10px] rounded-3xl border-accent overflow-y-scroll">
            <Routes>
               
                <Route path="analytics" element={<AdminAnalyticsPage/>}/>
                <Route path="api-keys" element={<AdminApiKeysPage/>}/>
                <Route path="bidding" element={<AdminBiddingPage/>}/>
                <Route path="alumni-of-the-day" element={<AdminAlumniOfDayPage/>}/>
                <Route path="/" element={<AdminUsersPage/>}/>
                <Route path="reviews" element={<h1>Reviews</h1>}/>
                
            </Routes>
            
        </div>
        </>}
        

    </div>
    )
}