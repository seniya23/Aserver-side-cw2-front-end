import axios from "axios";
import { useEffect, useState } from "react";
import { BiRefresh, BiTrash } from "react-icons/bi";
import Loader from "../../components/loader";
import toast from "react-hot-toast";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
	Filler,
} from "chart.js";
import {
	exportChartImage,
	generatePDFReport,
} from "../../utils/exportUtils";
import { BiDownload } from "react-icons/bi";
import DashboardStatCard from "../../components/dashboardStatCard";
import DashboardChartCard from "../../components/dashboardChartCard";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
	Filler
);

export default function AdminBiddingPage() {
	const [biddingData, setBiddingData] = useState({
		allBids: [],
		activeBids: [],
		winners: [],
		biddingStats: {},
	});
	const [isLoading, setIsLoading] = useState(false);
	const [apiKey, setApiKey] = useState("");
	const [showApiKeyInput, setShowApiKeyInput] = useState(false);
	const [filter, setFilter] = useState("all");
	const [isExporting, setIsExporting] = useState(false);

	const apiBase = import.meta.env.VITE_BACKEND_URL;
	const apiKeyHeader = import.meta.env.VITE_API_KEY_HEADER;
	const token = localStorage.getItem("token");

	async function loadBiddingData(key) {
		if (!key) {
			toast.error("API key is required");
			return;
		}

		setIsLoading(true);
		try {
			const headers = {
				[apiKeyHeader]: key,
				Authorization: `Bearer ${token}`,
			};

			
			const bidsRes = await axios.get(`${apiBase}/bidding/admin/all-bids`, {
				headers,
			});
			const activeBidsRes = await axios.get(`${apiBase}/bidding/admin/active-bids`, {
				headers,
			});
			const winnersRes = await axios.get(`${apiBase}/bidding/admin/winners`, {
				headers,
			});
			const statsRes = await axios.get(`${apiBase}/bidding/admin/stats`, {
				headers,
			});

			setBiddingData({
				allBids: bidsRes.data || [],
				activeBids: activeBidsRes.data || [],
				winners: winnersRes.data || [],
				biddingStats: statsRes.data || {},
			});

			setShowApiKeyInput(false);
			toast.success("Bidding data loaded successfully");
		} catch (error) {
			console.error(error);
			if (error.response?.status === 401) {
				toast.error("Invalid API key. Please check and try again.");
				setShowApiKeyInput(true);
			} else if (error.response?.status === 403) {
				toast.error("Insufficient permissions. Ensure your API key has read:bidding permission.");
			} else {
				toast.error("Unable to load bidding data. Try again.");
			}
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		
		const savedApiKey = localStorage.getItem("biddingApiKey");
		if (savedApiKey) {
			setApiKey(savedApiKey);
			loadBiddingData(savedApiKey);
		} else {
			setShowApiKeyInput(true);
		}
		
	}, []);

	const handleApiKeySubmit = (e) => {
		e.preventDefault();
		if (apiKey.trim()) {
			localStorage.setItem("biddingApiKey", apiKey);
			loadBiddingData(apiKey);
		}
	};

	const handleExportChartImage = async (chartId, title) => {
		setIsExporting(true);
		await exportChartImage(chartId, title);
		toast.success(`Chart image '${title}' exported!`);
		setIsExporting(false);
	};

	const handleGeneratePDFReport = async () => {
		setIsExporting(true);
		const summaryData = calculateInsights();
		
		// Prepare bidding records data for PDF
		const biddingRecords = biddingData.allBids.map((bid) => ({
			Name: `${bid.firstName} ${bid.lastName}`,
			Email: bid.email,
			"Bid Amount": `$${bid.bidAmount}`,
			Date: bid.bidDate ? new Date(bid.bidDate).toLocaleDateString() : "-",
			Status: bid.status || "Pending",
		}));

		await generatePDFReport({
			title: "Bidding Management Report",
			tables: [
				{
					title: "Bidding Summary Statistics",
					data: [
						{
							Metric: "Total Bids",
							Value: summaryData.totalBids,
							Status: "✓",
						},
						{
							Metric: "Active Bids",
							Value: summaryData.activeBids,
							Status: "🔴",
						},
						{
							Metric: "Winners",
							Value: summaryData.totalWinners,
							Status: "🏆",
						},
						{
							Metric: "Avg Bid Amount",
							Value: `$${summaryData.avgBidAmount}`,
							Status: "📊",
						},
						{
							Metric: "Highest Bid",
							Value: `$${summaryData.highestBid}`,
							Status: "⭐",
						},
					],
				},
				{
					title: "Top 10 Bidders",
					data: biddingData.allBids
						.sort((a, b) => (b.bidAmount || 0) - (a.bidAmount || 0))
						.slice(0, 10)
						.map((bid) => ({
							Name: `${bid.firstName} ${bid.lastName}`,
							"Bid Amount": `$${bid.bidAmount}`,
							Status: bid.status,
						})),
				},
				{
					title: "All Bidding Records (First 20)",
					data: biddingRecords.slice(0, 20),
				},
			],
			charts: [
				{ id: "bid-status-chart", title: "1. Bid Status Distribution (Pie Chart)" },
				{ id: "bid-amount-chart", title: "2. Bid Amount Trend (Line Chart)" },
				{ id: "top-bidders-chart", title: "3. Top 8 Bidders (Bar Chart)" },
				{ id: "monthly-trend-chart", title: "4. Monthly Bidding Trend (Line Chart)" },
			],
			filename: "bidding-report",
		});
		toast.success("PDF report generated!");
		setIsExporting(false);
	};

	async function deleteBidById(bid) {
		if (!apiKey) {
			toast.error("API key is required");
			setShowApiKeyInput(true);
			return;
		}

		if (!confirm(`Delete bid #${bid.id} by ${bid.firstName} ${bid.lastName}?`)) {
			return;
		}

		try {
			const headers = {
				[apiKeyHeader]: apiKey,
				Authorization: `Bearer ${token}`,
			};
			await axios.delete(`${apiBase}/bidding/admin/${bid.id}`, { headers });
			toast.success("Bid deleted successfully");
			loadBiddingData(apiKey);
		} catch (error) {
			if (error.response?.status === 403) {
				toast.error("Your API key must have write:bidding permission to delete bids.");
				return;
			}
			toast.error(error.response?.data?.message || "Failed to delete bid");
		}
	}

	// Chart color schemes
	const colors = {
		primary: "rgba(139, 92, 246, 1)",
		primaryLight: "rgba(139, 92, 246, 0.1)",
		secondary: "rgba(30, 41, 59, 1)",
		accent: "rgba(249, 115, 22, 1)",
		success: "rgba(34, 197, 94, 1)",
		warning: "rgba(245, 158, 11, 1)",
		danger: "rgba(239, 68, 68, 1)",
	};

	const chartColors = [
		"rgba(139, 92, 246, 0.8)",
		"rgba(249, 115, 22, 0.8)",
		"rgba(34, 197, 94, 0.8)",
		"rgba(59, 130, 246, 0.8)",
		"rgba(236, 72, 153, 0.8)",
		"rgba(14, 165, 233, 0.8)",
		"rgba(245, 158, 11, 0.8)",
		"rgba(168, 85, 247, 0.8)",
	];

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: {
				position: "top",
				labels: {
					font: { size: 12, weight: "500" },
					color: colors.secondary,
					padding: 15,
				},
			},
			tooltip: {
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				padding: 12,
				titleFont: { size: 14, weight: "600" },
				bodyFont: { size: 13 },
				borderColor: colors.accent,
				borderWidth: 1,
			},
		},
		animation: {
			duration: 750,
			easing: "easeInOutQuart",
		},
	};

	// Calculate insights
	const calculateInsights = () => {
		const totalBids = biddingData.allBids.length;
		const activeBids = biddingData.activeBids.length;
		const totalWinners = biddingData.winners.length;
		const avgBidAmount =
			totalBids > 0
				? (
						biddingData.allBids.reduce((sum, bid) => sum + (bid.bidAmount || 0), 0) /
						totalBids
				  ).toFixed(2)
				: 0;
		const highestBid =
			biddingData.allBids.length > 0
				? Math.max(...biddingData.allBids.map((b) => b.bidAmount || 0))
				: 0;

		return {
			totalBids,
			activeBids,
			totalWinners,
			avgBidAmount,
			highestBid,
		};
	};

	const insights = calculateInsights();

	
	const bidStatusData = {
		labels: ["Active", "Won", "Pending"],
		datasets: [
			{
				data: [
					biddingData.activeBids.length,
					biddingData.winners.length,
					Math.max(0, biddingData.allBids.length - biddingData.activeBids.length - biddingData.winners.length),
				],
				backgroundColor: [colors.warning, colors.success, colors.primary],
				borderColor: [
					colors.warning.replace("0.8", "1"),
					colors.success.replace("0.8", "1"),
					colors.primary.replace("0.8", "1"),
				],
				borderWidth: 2,
			},
		],
	};

	
	const bidAmountData = {
		labels: biddingData.allBids.map((_, i) => `Bid ${i + 1}`).slice(0, 10),
		datasets: [
			{
				label: "Bid Amount ($)",
				data: biddingData.allBids.map((b) => b.bidAmount || 0).slice(0, 10),
				borderColor: colors.primary,
				backgroundColor: colors.primaryLight,
				borderWidth: 3,
				fill: true,
				tension: 0.4,
				pointBackgroundColor: colors.primary,
				pointBorderColor: "#fff",
				pointBorderWidth: 2,
				pointRadius: 6,
			},
		],
	};

	// Top bidders
	const topBidders = biddingData.allBids
		.sort((a, b) => (b.bidAmount || 0) - (a.bidAmount || 0))
		.slice(0, 8);

	const topBiddersData = {
		labels: topBidders.map((b) => b.firstName || "Unknown"),
		datasets: [
			{
				label: "Bid Amount ($)",
				data: topBidders.map((b) => b.bidAmount || 0),
				backgroundColor: chartColors,
				borderColor: chartColors.map((c) => c.replace("0.8", "1")),
				borderWidth: 2,
				borderRadius: 8,
			},
		],
	};

	// Monthly bid trend
	const monthlyBidData = {
		labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
		datasets: [
			{
				label: "Number of Bids",
				data: [12, 19, 8, 5, 2, 3],
				borderColor: colors.success,
				backgroundColor: "rgba(34, 197, 94, 0.1)",
				borderWidth: 3,
				fill: true,
				tension: 0.4,
				pointBackgroundColor: colors.success,
				pointBorderColor: "#fff",
				pointBorderWidth: 2,
				pointRadius: 6,
			},
		],
	};

	if (showApiKeyInput && !isLoading) {
		return (
			<div className="w-full min-h-screen p-10 bg-linear-to-b from-primary to-white">
				<div className="max-w-7xl mx-auto">
					<div className="bg-white/70 rounded-2xl shadow-xl p-8 max-w-md">
						<h2 className="text-2xl font-bold text-secondary mb-4">
							Bidding API Key Required
						</h2>
						<p className="text-secondary/60 mb-6">
							Enter your bidding API key to view bidding data. Make sure your API key has
							the <code className="bg-primary/20 px-2 py-1 rounded">read:bidding</code>
							permission.
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
								Load Bidding Data
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

	const filteredBids =
		filter === "active"
			? biddingData.activeBids
			: filter === "winners"
			? biddingData.winners
			: biddingData.allBids;

	return (
		<div className="w-full min-h-screen p-10 bg-linear-to-b from-primary to-white">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl font-bold text-secondary mb-2">Bidding Management Dashboard</h1>
					

					{/* Export & Preset Buttons */}
					<div className="flex flex-wrap gap-3 mb-6">
						<button
							onClick={handleGeneratePDFReport}
							disabled={isExporting}
							className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition flex items-center gap-2 disabled:opacity-50"
						>
							<BiDownload /> PDF Report
						</button>
					</div>

					<div className="flex gap-4">
						<button
							onClick={() => loadBiddingData(apiKey)}
							className="text-sm px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition flex items-center gap-2"
						>
							<BiRefresh /> Refresh Data
						</button>
						<button
							onClick={() => {
								localStorage.removeItem("biddingApiKey");
								setShowApiKeyInput(true);
								setApiKey("");
							}}
							className="text-sm px-4 py-2 text-accent hover:text-accent/80 underline"
						>
							Change API Key
						</button>
					</div>
				</div>

				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
					<DashboardStatCard
						title="Total Bids"
						value={insights.totalBids}
						icon="💰"
						trend="All bids placed"
						colorClass="border-primary"
					/>
					<DashboardStatCard
						title="Active Bids"
						value={insights.activeBids}
						icon="🔴"
						trend="Currently active"
						colorClass="border-warning"
					/>
					<DashboardStatCard
						title="Winners"
						value={insights.totalWinners}
						icon="🏆"
						trend="Successful bids"
						colorClass="border-success"
					/>
					<DashboardStatCard
						title="Avg Bid ($)"
						value={`$${insights.avgBidAmount}`}
						icon="📊"
						trend="Average bid amount"
						colorClass="border-accent"
					/>
					<DashboardStatCard
						title="Highest Bid ($)"
						value={`$${insights.highestBid}`}
						icon="⭐"
						trend="Maximum bid placed"
						colorClass="border-danger"
					/>
				</div>

				{/* Charts Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					{/* Bid Status Distribution */}
					{biddingData.allBids.length > 0 && (
					<DashboardChartCard title="1. Bid Status Distribution " chartId="bid-status-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Pie data={bidStatusData} options={chartOptions} />
						</DashboardChartCard>
					)}

					{/* Bid Amount Trend */}
					{biddingData.allBids.length > 0 && (
					<DashboardChartCard title="2. Bid Amount Trend " chartId="bid-amount-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Line
								data={bidAmountData}
								options={{
									...chartOptions,
									scales: {
										y: {
											beginAtZero: true,
											ticks: { color: colors.secondary },
											grid: { color: colors.primaryLight },
										},
										x: {
											ticks: { color: colors.secondary },
											grid: { color: colors.primaryLight },
										},
									},
								}}
							/>
						</DashboardChartCard>
					)}

					{/* Top Bidders */}
					{topBidders.length > 0 && (
					<DashboardChartCard title="3. Top 8 Bidders " chartId="top-bidders-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Bar
								data={topBiddersData}
								options={{
									...chartOptions,
									indexAxis: "x",
									scales: {
										y: {
											beginAtZero: true,
											ticks: { color: colors.secondary },
											grid: { color: colors.primaryLight },
										},
										x: {
											ticks: { color: colors.secondary },
											grid: { color: colors.primaryLight },
										},
									},
								}}
							/>
						</DashboardChartCard>
					)}

					{/* Monthly Bid Trend */}
					{biddingData.allBids.length > 0 && (
					<DashboardChartCard title="4. Monthly Bidding Trend " chartId="monthly-trend-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Line
								data={monthlyBidData}
								options={{
									...chartOptions,
									scales: {
										y: {
											beginAtZero: true,
											ticks: { color: colors.secondary },
											grid: { color: colors.primaryLight },
										},
										x: {
											ticks: { color: colors.secondary },
											grid: { color: colors.primaryLight },
										},
									},
								}}
							/>
						</DashboardChartCard>
					)}
				</div>

				{/* Bids Table */}
				<div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-secondary/10">
					<div className="mb-6 flex justify-between items-center">
						<h3 className="text-xl font-bold text-secondary">Bidding Records</h3>
						<div className="flex gap-2">
							<button
								onClick={() => setFilter("all")}
								className={`px-4 py-2 rounded-lg font-semibold transition ${
									filter === "all"
										? "bg-primary text-white"
										: "bg-secondary/10 text-secondary hover:bg-secondary/20"
								}`}
							>
								All ({biddingData.allBids.length})
							</button>
							<button
								onClick={() => setFilter("active")}
								className={`px-4 py-2 rounded-lg font-semibold transition ${
									filter === "active"
										? "bg-warning text-white"
										: "bg-secondary/10 text-secondary hover:bg-secondary/20"
								}`}
							>
								Active ({biddingData.activeBids.length})
							</button>
							<button
								onClick={() => setFilter("winners")}
								className={`px-4 py-2 rounded-lg font-semibold transition ${
									filter === "winners"
										? "bg-success text-white"
										: "bg-secondary/10 text-secondary hover:bg-secondary/20"
								}`}
							>
								Winners ({biddingData.winners.length})
							</button>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full table-auto border-separate border-spacing-0 rounded-lg overflow-hidden">
							<thead>
								<tr className="bg-secondary text-white">
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase">
										Name
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase">
										Email
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase">
										Bid Amount
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase">
										Date
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase">
										Status
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-secondary/10">
								{filteredBids.length === 0 ? (
									<tr>
										<td colSpan="6" className="px-6 py-8 text-center text-secondary/70">
											No bids found.
										</td>
									</tr>
								) : (
									filteredBids.map((bid, index) => (
										<tr
											key={index}
											className="odd:bg-primary/60 even:bg-white hover:bg-primary/90 transition-colors"
										>
											<td className="px-6 py-4 text-sm font-semibold text-secondary">
												{bid.firstName} {bid.lastName}
											</td>
											<td className="px-6 py-4 text-sm text-secondary/80">{bid.email}</td>
											<td className="px-6 py-4 text-sm font-bold text-accent">
												${bid.bidAmount}
											</td>
											<td className="px-6 py-4 text-sm text-secondary/80">
												{bid.bidDate
													? new Date(bid.bidDate).toLocaleDateString()
													: "-"}
											</td>
											<td className="px-6 py-4 text-sm">
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold ${
														bid.status === "won"
															? "bg-success/20 text-success"
															: bid.status === "active"
															? "bg-warning/20 text-warning"
															: "bg-secondary/20 text-secondary"
													}`}
												>
													{bid.status || "Pending"}
												</span>
											</td>
											<td className="px-6 py-4 text-sm">
												<button
													onClick={() => deleteBidById(bid)}
													className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center gap-1"
												>
													<BiTrash />
													Delete
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
