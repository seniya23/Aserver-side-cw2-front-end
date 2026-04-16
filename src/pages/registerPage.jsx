import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/loader";

export default function RegisterPage() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading , setIsLoading] = useState(false);

	const navigate = useNavigate();

	async function register() {


        if(firstName.trim()== ""){   //trim use for remove spaces from front and end of the string , ex: "  hello  "  ----> "hello"
            toast.error("First name is required");
            return;
        }
        if(lastName.trim()== ""){
            toast.error("Last name is required");
            return;
        }
        if(email.trim()== ""){
            toast.error("Email is required");
            return;
        }
        if(password.trim()== ""){
            toast.error("Password is required");
            return;
        }   
        if(password !== confirmPassword){
            toast.error("Passwords do not match");
            return;
        }

        if(password != confirmPassword){
            toast.error("Passwords do not match");
            return;
        }
        setIsLoading(true);
		try {
			await axios.post(
				import.meta.env.VITE_BACKEND_URL + "/users/",
				{
					email: email.trim(),
					password: password.trim(),
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
				}
			);
			console.log();
            navigate("/login");
			//alert("Login successful! Welcome back.");

			toast.success("Registration successful! Welcome to I computers.");
            setIsLoading(false);
		} catch (err) {
			//alert("Login failed! Please check your credentials and try again.");
			toast.error("Registration failed! Please check your data and try again.");
			console.log(err);
            setIsLoading(false);
		}
	}

	return (
		<div className="w-full h-screen bg-[url('/bg.jpg')] bg-center bg-cover bg-no-repeat flex">            
			<div className="w-[50%] h-full flex justify-center items-center flex-col p-[50px]">
				<img
					src="/logo.png"
					alt="logo"
					className="w-[200px] h-[200px] mb-[20px] object-cover"
				/>
				<h1 className="text-[50px] text-gold text-shadow-accent text-shadow-2xs text-center font-bold">
					Plug In. Power Up. Play Hard.
				</h1>
				<p className="text-[30px] text-white italic">
					Your Ultimate Destination for Gaming Gear
				</p>
			</div>
			<div className="w-[50%] h-full flex justify-center items-center">
				<div className="w-[450px] h-[600px] backdrop-blur-lg shadow-2xl rounded-2xl flex flex-col justify-center items-center p-[30px]">
					<h1 className="text-[20px] font-semibold mb-[20px] text-white text-shadow-white ">
						Register
					</h1>
					<input
						onChange={(e) => {
							setFirstName(e.target.value);
						}}
						type="text"
						placeholder="your first name"
						className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"
					/>
                    <input
                        onChange={(e) => {  
                            setLastName(e.target.value);
                        }}
                        type="text"
                        placeholder="your last name"
                        className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"
                    />
					<input
						onChange={(e) => {
							setEmail(e.target.value);
						}}
						type="email"
						placeholder="your email"
						className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"
					/>
					<input
						onChange={(e) => {
							setPassword(e.target.value);
						}}
						type="password"
						placeholder="your password"
						className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"
					/>
                    <input
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                        }}
                        type="password"
                        placeholder="confirm your password"
                        className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"
                    />

					
					<button
						onClick={register}
						className="w-full h-[50px] bg-accent text-white font-bold text-[20px] rounded-lg border-[2px] border-accent hover:bg-transparent hover:text-accent"
					>
						Register Now
					</button>
					<p className="text-white not-italic">
						Already have an account?
						<Link to="/login" className="text-gold italic">
							Login here
						</Link>
					</p>
				</div>
			</div>
            {isLoading && <Loader />}
		</div>
	);
}