import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import PlatformHeader from "../components/platformHeader";
import { getCurrentUser } from "../utils/auth";

export default function BiddingPage() {
	const user = getCurrentUser();
	const token = localStorage.getItem("token");
	const [bidAmount, setBidAmount] = useState("");
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const isAlumni = user?.role === "alumni";

	async function loadBiddingData() {
		if (!token || !isAlumni) return;
		setIsLoading(true);
		try {
			const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/bidding`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setData(res.data);
		} catch (error) {
			toast.error(error?.response?.data?.message || "Failed to load bidding details");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		loadBiddingData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!token) return <Navigate to="/login" replace />;
	if (!isAlumni) return <Navigate to="/" replace />;

	async function placeBid() {
		if (!bidAmount) return;
		try {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/bidding`,
				{ bidAmount: Number(bidAmount) },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			toast.success("Bid placed successfully");
			setBidAmount("");
			loadBiddingData();
		} catch (error) {
			toast.error(error?.response?.data?.message || "Unable to place bid");
		}
	}

	async function updateBid() {
		if (!bidAmount) return;
		try {
			await axios.put(
				`${import.meta.env.VITE_BACKEND_URL}/bidding`,
				{ bidAmount: Number(bidAmount) },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			toast.success("Bid increased successfully");
			setBidAmount("");
			loadBiddingData();
		} catch (error) {
			toast.error(error?.response?.data?.message || "Unable to update bid");
		}
	}

	return (
		<div className="min-h-screen bg-primary">
			<PlatformHeader />
			<div className="max-w-4xl mx-auto p-6">
				<h1 className="text-2xl font-bold text-secondary">Blind Bidding Program</h1>
				<p className="text-secondary/70 mb-4">
					You cannot see highest bids. Increase-only updates are supported. Monthly win limit: 3.
				</p>

				<div className="bg-white rounded-xl p-6 shadow mb-4">
					<p className="text-secondary">
						Current Active Bid:{" "}
						<span className="font-semibold">
							{data?.currentBid?.bidAmount ? `$${data.currentBid.bidAmount}` : "No active bid"}
						</span>
					</p>
					<p className="text-secondary">Monthly Wins: {data?.monthlyWins ?? 0}</p>
					<p className="text-secondary">Remaining Slots: {data?.remainingSlots ?? 3}</p>
				</div>

				<div className="bg-white rounded-xl p-6 shadow">
					<input
						type="number"
						min="1"
						placeholder="Enter your bid amount"
						value={bidAmount}
						onChange={(e) => setBidAmount(e.target.value)}
						className="w-full border border-secondary/30 rounded-md p-2 mb-3"
					/>
					<div className="flex gap-3">
						<button onClick={placeBid} className="px-4 py-2 bg-accent text-primary rounded-md font-semibold">
							Place Bid
						</button>
						<button
							onClick={updateBid}
							className="px-4 py-2 bg-secondary text-white rounded-md font-semibold"
						>
							Increase Existing Bid
						</button>
					</div>
					{isLoading && <p className="text-sm mt-3 text-secondary/70">Loading...</p>}
				</div>
			</div>
		</div>
	);
}
