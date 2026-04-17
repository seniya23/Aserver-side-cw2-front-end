import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "../components/loader";
import { useNavigate } from "react-router-dom";

export default function ForgetPasswordPage() {
	const [otpSent, setOtpSent] = useState(false); //patan gaddi otp eka send wela na eka nisa false.
	const [loading, setLoading] = useState(false);
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [email, setEmail] = useState("");
	const navigate = useNavigate();
	const apiBase = import.meta.env.VITE_BACKEND_URL;

	async function resetPassword() {
		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}
		setLoading(true);
		try {
			await axios.post(
				`${apiBase}/users/verify-otp/`,
				{
					email: email,
					otp: otp,
					newpassword: newPassword,
				}
			);
			toast.success("Password reset successful");
			navigate("/login");
		} catch (err) {
			console.log(err);
			toast.error("Error resetting password. Try again later");
		} finally {
			setLoading(false);
		}
	}

	async function sendOtp() {
		setLoading(true);
		try {
			await axios.get(
				`${apiBase}/users/send-otp/${email}`
			);
			toast.success("OTP sent to your email");
            
			setOtpSent(true);

            
		} catch (err) {
			console.log(err);
			toast.error("Error sending OTP Try again later");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="w-full h-screen bg-[url('/bg.jpg')] bg-center bg-no-repeat flex flex-col justify-center items-center">
			
			{otpSent ? (  //if otp eka send wela thiyenawanam me eka pennanawa
				<div className="w-[450px] h-[600px] backdrop-blur-lg shadow-2xl rounded-xl flex flex-col justify-center items-center p-[30px]">
					<h2 className="text-[40px] text-white text-shadow-white font-bold mb-[20px]">
						Enter OTP and New Password
					</h2>
					<input
						type="text"
						placeholder="Enter OTP"
						className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"
						onChange={(e) => setOtp(e.target.value)}
					/>
					<input
						type="password"
						placeholder="Enter New Password"
						className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"
						onChange={(e) => setNewPassword(e.target.value)}
					/>
					<input
						type="password"
						placeholder="Confirm New Password"
						className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>
					<button
						onClick={resetPassword}
						className="w-full h-[50px] bg-accent font-bold rounded-lg text-[20px] text-white border border[2px] border-accent hover:bg-transparent hover:text-accent mb-[20px]"
					>
						Reset Password
					</button>
				</div>
			) : ( //otp eka send wela naththam me eka pennanawa
				<div className="w-[450px] h-[600px] backdrop-blur-lg shadow-2xl rounded-xl flex flex-col justify-center items-center p-[30px]">
					<h2 className="text-[40px] text-white text-shadow-white font-bold mb-[20px]">Reset Your Password</h2>
					<input
						type="email"
						placeholder="Enter your email"
						className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[20px] focus:outline-none focus:ring-2 focus:ring-gold"
						onChange={(e) => setEmail(e.target.value)}
					/>
					<button
						onClick={sendOtp}
						className="w-full h-[50px] bg-accent font-bold rounded-lg text-[20px] text-white border border[2px] border-accent hover:bg-transparent hover:text-accent mb-[20px]"
					>
						Send OTP
					</button>
				</div>
			)}
            {loading && <Loader />}
		</div>
	);
}