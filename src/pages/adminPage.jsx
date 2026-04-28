import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { LuBoxes, LuClipboardList } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { MdOutlineRateReview } from "react-icons/md";
// import AdminProductPage from "./admin/adminProductsPage";
// import AdminAddProductPage from "./admin/adminAddProductPage";
// import AdminUpdateProductPage from "./admin/adminUpdateProductPage";
// import AdminOrdersPage from "./admin/adminOrdersPage.jsx";
import { useEffect } from "react";
import Loader from "../components/loader.jsx";
import AdminUsersPage from "./admin/adminUserPage.jsx";
import toast from "react-hot-toast";

export default function AdminPage(){
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;

    useEffect(()=>{                                                //me reacthook eka use karanne page eka load weddi user ge data genna ganna
        if(!isAuthenticated){
            toast.error("Please log in as admin.");
            navigate("/login");
        }
    },[isAuthenticated, navigate])

    return(
    
    <div  className="w-full h-full flex bg-accent">
        {!isAuthenticated ? <Loader /> :  //sagalawarahan welin user wrap kerela thiyenne, if user data eka thiyenawanam(null nemenam) admin page eka display karanawa
        <>
        <div  className="w-[300px] h-full bg-accent">
            <div  className="w-full h-[100px] text-primary flex items-center">
                <img src="/logo.png" className="h-full"/>
                <h1 className="text-2xl">Admin </h1>
            </div>

            <div  className="w-full h-[400px] text-white text-2xl flex flex-col pl-[20px] pt-[20px]">
                
                {/* use <Link> tag instid of usinkg <a href> becuase you can stop refreshing when moving among pages */}
                <Link to="/admin" className="w-full flex items-center h-[50px] gap-[10px]"><LuClipboardList/>Orders</Link>
                <Link to="/admin/products" className="w-full flex items-center h-[50px] gap-[10px]"><LuBoxes/>Products</Link>
                <Link to="/admin/users" className="w-full flex items-center h-[50px] gap-[10px]"><FiUsers/>Users</Link>
                <Link to="/admin/reviews" className="w-full flex items-center h-[50px] gap-[10px]"><MdOutlineRateReview />Reviews</Link>
                
            </div>


        </div>

        {/* you can use calc option in css to do calculations for colors, becuase pixel size
         depend on monitor size but using this method soleve that problem */}
        <div className="w-[calc(100%-300px)] bg-primary h-full max-h-full border-[10px] rounded-3xl border-accent overflow-y-scroll">
            <Routes>
                {/* <Route path="/" element={<AdminOrdersPage/>}/>
                <Route path="products" element={<AdminProductPage/>}/>
                <Route path="add-product" element={<AdminAddProductPage/>}/> */}
                <Route path="/" element={<AdminUsersPage/>}/>
                <Route path="reviews" element={<h1>Reviews</h1>}/>
                {/* <Route path="update-product" element={<AdminUpdateProductPage/>}/> */}
            </Routes>
            
        </div>
        </>}
        

    </div>
    )
}