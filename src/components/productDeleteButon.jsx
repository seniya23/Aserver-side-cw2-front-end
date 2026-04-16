import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProductDeleteButton(props){
    const reload = props.reload; // reload function eka gannawa props walin
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const productID = props.productid;
    
    async function handleDelete(){
        setIsDeleting(true);
        const token = localStorage.getItem("token");
                        axios.delete(import.meta.env.VITE_BACKEND_URL + "/products/" + productID, {
                          headers: {
                            Authorization: `Bearer ${token}`
                          }
                        })
                        .then(()=>{
                          toast.success("Product deleted successfully!");
                          setIsDeleting(false); // this where we change the value in loaded dependancy array, so it will run the function inside useEffect
                            setIsMessageOpen(false);
                            reload(); // call the reload function to set loaded to false in the parent component
                          
                        }).catch(()=>{
                          toast.error("There was an error deleting the product!");
                          setIsDeleting(false);
                        });
    }
    return(  //use empty tag to wrap multiple elements like in the below button and div tag
        <>
        <button onClick={()=>{setIsMessageOpen(true)}}
        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
            Delete
        </button>
        {isMessageOpen&&<div className="w-[100vw] h-screen fixed inset-0 z-[9999] top-0 left-0 bg-black/55 flex items-center justify-center">Are you sure you want to delete
            <div className="w-[600px] h-[300px] bg-primary rounded-2xl relative flex flex-col items-center justify-center p-10 shadow-xl">
                <button
							onClick={() => {
								setIsMessageOpen(false);
							}}
							className="w-[40px] h-[40px] bg-red-600 rounded-full text-white text-xl font-bold cursor-pointer hover:bg-red-800 absolute right-[-32px] top-[-32px]"
						>
							X
						</button>
                        <h1 className="text-2xl text-center mb-6">
							Are you sure you want to delete product {productID}?
						</h1>
                        <div className="w-full flex justify-center gap-10">
							<button
								disabled={isDeleting}  //disable the button when isDeleting is true (no multiple click)
								onClick={handleDelete}
								className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
							>
								Delete
							</button>
							<button
								onClick={() => {
									setIsMessageOpen(false);
								}}
								className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
							>
								Cancel
							</button>
						</div>
            </div>
        </div>}
        </>
    )
}

//supabase project database password : 1234
