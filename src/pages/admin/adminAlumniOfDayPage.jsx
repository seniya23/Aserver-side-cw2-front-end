import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../components/loader";

export default function AdminAlumniOfDayPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [apiKey, setApiKey] = useState("");
	const [showApiKeyInput, setShowApiKeyInput] = useState(false);
	const [winner, setWinner] = useState(null);

	const apiBase = import.meta.env.VITE_BACKEND_URL;
	const apiKeyHeader = import.meta.env.VITE_API_KEY_HEADER;

	async function loadWinner(key) {
		if (!key) {
			toast.error("API key is required");
			return;
		}

		setIsLoading(true);
		try {
			const headers = {
				[apiKeyHeader]: key,
			};
			const response = await axios.get(`${apiBase}/alumni/alumni-of-the-day`, { headers });
			setWinner(response?.data?.message || response?.data || null);
			setShowApiKeyInput(false);
			toast.success("Current winner loaded");
		} catch (error) {
			const msg = error?.response?.data?.message || "Unable to load alumni of the day";
			toast.error(msg);
			setWinner(null);
			setShowApiKeyInput(true);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		const savedApiKey = localStorage.getItem("alumniDayApiKey");
		if (savedApiKey) {
			setApiKey(savedApiKey);
			loadWinner(savedApiKey);
		} else {
			setShowApiKeyInput(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handleApiKeySubmit(e) {
		e.preventDefault();
		if (!apiKey.trim()) {
			toast.error("API key is required");
			return;
		}
		localStorage.setItem("alumniDayApiKey", apiKey);
		loadWinner(apiKey);
	}

	if (showApiKeyInput && !isLoading) {
		return (
			<div className="w-full min-h-screen p-10 bg-linear-to-b from-primary to-white">
				<div className="max-w-7xl mx-auto">
					<div className="bg-white/70 rounded-2xl shadow-xl p-8 max-w-md">
						<h2 className="text-2xl font-bold text-secondary mb-4">
							Mobile AR API Key Required
						</h2>
						<p className="text-secondary/60 mb-6">
							Enter API key with <code className="bg-primary/20 px-2 py-1 rounded">read:alumni_of_day</code> permission.
						</p>
						<form onSubmit={handleApiKeySubmit} className="space-y-4">
							<div>
								<label className="block text-secondary font-semibold mb-2">API Key</label>
								<input
									type="password"
									value={apiKey}
									onChange={(e) => setApiKey(e.target.value)}
									placeholder="Paste your API key here..."
									className="w-full px-4 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
									required
								/>
							</div>
							<button
								type="submit"
								className="w-full px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition"
							>
								Load Current Winner
							</button>
						</form>
					</div>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="w-full min-h-screen p-10 bg-linear-to-b from-primary to-white">
			<div className="max-w-5xl mx-auto">
				<div className="mb-6 flex justify-between items-center">
					<h1 className="text-4xl font-bold text-secondary">Alumni of the Day</h1>
					<div className="flex gap-3">
						<button
							onClick={() => loadWinner(apiKey)}
							className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition"
						>
							Refresh
						</button>
						<button
							onClick={() => {
								localStorage.removeItem("alumniDayApiKey");
								setApiKey("");
								setShowApiKeyInput(true);
							}}
							className="px-4 py-2 text-accent underline"
						>
							Change API Key
						</button>
					</div>
				</div>

				{winner ? (
					<div className="bg-white/70 rounded-2xl shadow-xl p-8 border border-secondary/10">
						<div className="flex items-start gap-5">
							<img
								src={winner.image || "/default.jpg"}
								alt={winner.firstName || "winner"}
								className="w-24 h-24 rounded-full object-cover"
								onError={(e) => {
									e.currentTarget.src = "/default.jpg";
								}}
							/>
							<div>
								<h2 className="text-2xl font-bold text-secondary">
									{winner.firstName} {winner.lastName}
								</h2>
								<p className="text-secondary/80">{winner.email}</p>
								<p className="text-accent font-semibold mt-2">
									Bid wins: {winner.bidWins ?? 0}
								</p>
							</div>
						</div>
						<div className="grid md:grid-cols-2 gap-4 mt-6">
							<Info label="Industry" value={winner.industry} />
							<Info label="Graduation Year" value={winner.graduationYear} />
							<Info label="Degree" value={winner.degrees} />
							<Info label="LinkedIn" value={winner.linkedinUrl} />
						</div>
					</div>
				) : (
					<div className="bg-white/70 rounded-2xl shadow-xl p-8 border border-secondary/10 text-secondary/70">
						No current winner available.
					</div>
				)}
			</div>
		</div>
	);
}

function Info({ label, value }) {
	return (
		<div className="border border-secondary/20 rounded-lg p-3 bg-white/70">
			<p className="text-xs uppercase text-secondary/60">{label}</p>
			<p className="font-medium text-secondary">{value || "-"}</p>
		</div>
	);
}
