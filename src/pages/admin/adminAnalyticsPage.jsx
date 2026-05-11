import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "../../components/loader";
import toast from "react-hot-toast";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	ArcElement,
	RadarController,
	Filler,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar, Line, Pie, Doughnut, Radar } from "react-chartjs-2";
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
	RadarController,
	Filler,
	Tooltip,
	Legend
);

export default function AdminAnalyticsPage() {
	const [analyticsData, setAnalyticsData] = useState({
		industry: [],
		graduationYear: [],
		certifications: [],
		bidWins: [],
		degrees: [],
		employmentStartDate: [],
		employmentDuration: [],
	});
	const [isLoading, setIsLoading] = useState(false);
	const [apiKey, setApiKey] = useState("");
	const [showApiKeyInput, setShowApiKeyInput] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	const apiBase = import.meta.env.VITE_BACKEND_URL;
	const apiKeyHeader = import.meta.env.VITE_API_KEY_HEADER;

	async function loadAnalyticsData(key) {
		if (!key) {
			toast.error("API key is required");
			return;
		}

		setIsLoading(true);
		try {
			const headers = {
				[apiKeyHeader]: key,
			};

			const [
				industryRes,
				graduationYearRes,
				certificationsRes,
				bidWinsRes,
				degreesRes,
				employmentStartDateRes,
				employmentDurationRes,
			] = await Promise.all([
				axios.get(`${apiBase}/analytics/industry`, { headers }),
				axios.get(`${apiBase}/analytics/graduation-year`, { headers }),
				axios.get(`${apiBase}/analytics/certifications`, { headers }),
				axios.get(`${apiBase}/analytics/bid-wins`, { headers }),
				axios.get(`${apiBase}/analytics/degrees`, { headers }),
				axios.get(`${apiBase}/analytics/employment-start-date`, { headers }),
				axios.get(`${apiBase}/analytics/employment-duration`, { headers }),
			]);

			setAnalyticsData({
				industry: industryRes.data || [],
				graduationYear: graduationYearRes.data || [],
				certifications: certificationsRes.data || [],
				bidWins: bidWinsRes.data || [],
				degrees: degreesRes.data || [],
				employmentStartDate: employmentStartDateRes.data || [],
				employmentDuration: employmentDurationRes.data || [],
			});

			setShowApiKeyInput(false);
			toast.success("Analytics data loaded successfully");
		} catch (error) {
			console.error(error);
			if (error.response?.status === 401) {
				toast.error("Invalid API key. Please check and try again.");
				setShowApiKeyInput(true);
			} else {
				toast.error("Unable to load analytics data. Try again.");
			}
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		
		const savedApiKey = localStorage.getItem("analyticsApiKey");
		if (savedApiKey) {
			setApiKey(savedApiKey);
			loadAnalyticsData(savedApiKey);
		} else {
			setShowApiKeyInput(true);
		}
		
	}, []);

	const handleApiKeySubmit = (e) => {
		e.preventDefault();
		if (apiKey.trim()) {
			localStorage.setItem("analyticsApiKey", apiKey);
			loadAnalyticsData(apiKey);
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
		await generatePDFReport({
			title: "Alumni Analytics Report",
			tables: [
				{
					title: "Industry Distribution",
					data: analyticsData.industry.map((item) => ({
						Industry: item.industry,
						"Alumni Count": item.count,
					})),
				},
				{
					title: "Summary Statistics",
					data: [
						{
							Metric: "Total Alumni",
							Value: summaryData.totalAlumni,
							Status: "✓",
						},
						{
							Metric: "Top Industry",
							Value: summaryData.topIndustry?.industry || "-",
							Status: `${summaryData.topIndustry?.count || 0} alumni`,
						},
						{
							Metric: "Avg Employment Duration",
							Value: `${summaryData.avgEmploymentDuration} months`,
							Status: "✓",
						},
						{
							Metric: "Total Certifications",
							Value: summaryData.totalCertifications,
							Status: `${summaryData.totalCertifications} credentials`,
						},
						{
							Metric: "Total Degrees",
							Value: summaryData.totalDegrees,
							Status: `${summaryData.totalDegrees} degrees`,
						},
					],
				},
			],
			charts: [
				{ id: "industry-chart", title: "1. Industry Distribution (Bar Chart)" },
				{ id: "graduation-chart", title: "2. Graduation Year Timeline (Line Chart)" },
				{ id: "top-industries-chart", title: "3. Top 8 Industries (Pie Chart)" },
				{ id: "degrees-chart", title: "4. Degrees Distribution (Doughnut Chart)" },
				{ id: "certifications-chart", title: "5. Top Certifications (Horizontal Bar)" },
				{ id: "bidwins-chart", title: "6. Bid Wins Distribution (Bar Chart)" },
				{ id: "employment-dates-chart", title: "7. Employment Start Dates (Bar Chart)" },
				{ id: "duration-chart", title: "8. Employment Duration Distribution (Pie Chart)" },
			],
			filename: "alumni-analytics-report",
		});
		toast.success("PDF report generated!");
		setIsExporting(false);
	};

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

	//Industry Distribution Bar Chart
	const industryChartData = {
		labels: analyticsData.industry.map((item) => item.industry),
		datasets: [
			{
				label: "Number of Alumni",
				data: analyticsData.industry.map((item) => item.count),
				backgroundColor: chartColors,
				borderColor: chartColors.map((c) => c.replace("0.8", "1")),
				borderWidth: 2,
				borderRadius: 8,
				hoverBackgroundColor: chartColors.map((c) => c.replace("0.8", "1")),
			},
		],
	};

	//Graduation Year Distribution Line Chart
	const graduationChartData = {
		labels: analyticsData.graduationYear
			.sort((a, b) => a.graduationYear - b.graduationYear)
			.map((item) => item.graduationYear),
		datasets: [
			{
				label: "Alumni Count",
				data: analyticsData.graduationYear
					.sort((a, b) => a.graduationYear - b.graduationYear)
					.map((item) => item.count),
				borderColor: colors.primary,
				backgroundColor: colors.primaryLight,
				borderWidth: 3,
				fill: true,
				tension: 0.4,
				pointBackgroundColor: colors.primary,
				pointBorderColor: "#fff",
				pointBorderWidth: 2,
				pointRadius: 6,
				pointHoverRadius: 8,
			},
		],
	};

	//Top Industries Pie Chart
	const topIndustries = analyticsData.industry
		.sort((a, b) => b.count - a.count)
		.slice(0, 8);
	const industryPieData = {
		labels: topIndustries.map((item) => item.industry),
		datasets: [
			{
				data: topIndustries.map((item) => item.count),
				backgroundColor: chartColors,
				borderColor: "#fff",
				borderWidth: 2,
				hoverBackgroundColor: chartColors.map((c) => c.replace("0.8", "1")),
			},
		],
	};

	//Degrees Distribution Doughnut Chart
	const topDegrees = analyticsData.degrees
		.sort((a, b) => b.count - a.count)
		.slice(0, 8);
	const degreesDoughnutData = {
		labels: topDegrees.map((item) => item.degree),
		datasets: [
			{
				data: topDegrees.map((item) => item.count),
				backgroundColor: chartColors,
				borderColor: "#fff",
				borderWidth: 2,
				hoverBackgroundColor: chartColors.map((c) => c.replace("0.8", "1")),
			},
		],
	};

	//Certifications Horizontal Bar Chart
	const topCerts = analyticsData.certifications
		.sort((a, b) => b.count - a.count)
		.slice(0, 8);
	const certificationsChartData = {
		labels: topCerts.map((item) => item.certification),
		datasets: [
			{
				label: "Certification Count",
				data: topCerts.map((item) => item.count),
				backgroundColor: colors.accent,
				borderColor: colors.accent.replace("0.8", "1"),
				borderWidth: 2,
				borderRadius: 6,
				hoverBackgroundColor: colors.accent.replace("0.8", "1"),
			},
		],
	};

	//Bid Wins Bar Chart
	const bidWinsChartData = {
		labels: analyticsData.bidWins.map((item) => item.bidWins),
		datasets: [
			{
				label: "Alumni Count",
				data: analyticsData.bidWins.map((item) => item.count),
				backgroundColor: colors.success,
				borderColor: colors.success.replace("0.8", "1"),
				borderWidth: 2,
				borderRadius: 8,
				hoverBackgroundColor: colors.success.replace("0.8", "1"),
			},
		],
	};

	// Calculate additional insights
	const calculateInsights = () => {
		const totalAlumni = analyticsData.industry.reduce(
			(sum, item) => sum + item.count,
			0
		);
		const topIndustry =
			analyticsData.industry.length > 0
				? analyticsData.industry.reduce((prev, current) =>
						prev.count > current.count ? prev : current
				  )
				: null;
		const avgEmploymentDuration =
			analyticsData.employmentDuration.length > 0
				? Math.round(
						analyticsData.employmentDuration.reduce(
							(sum, item) => sum + item.durationInMonths,
							0
						) / analyticsData.employmentDuration.length
				  )
				: 0;
		const totalCertifications = analyticsData.certifications.reduce(
			(sum, item) => sum + item.count,
			0
		);
		const totalDegrees = analyticsData.degrees.reduce(
			(sum, item) => sum + item.count,
			0
		);

		return {
			totalAlumni,
			topIndustry,
			avgEmploymentDuration,
			totalCertifications,
			totalDegrees,
		};
	};

	const insights = calculateInsights();

	if (showApiKeyInput && !isLoading) {
		return (
		<div className="w-full min-h-screen p-10 bg-linear-to-b from-primary to-white">
				<div className="max-w-7xl mx-auto">
					<div className="bg-white/70 rounded-2xl shadow-xl p-8 max-w-md">
						<h2 className="text-2xl font-bold text-secondary mb-4">
							Analytics API Key Required
						</h2>
						<p className="text-secondary/60 mb-6">
							Enter your analytics API key to view analytics data. Create one in the API
							Keys section.
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
								Load Analytics
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
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl font-bold text-secondary mb-2">Analytics Dashboard</h1>
					

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

					<button
						onClick={() => {
							localStorage.removeItem("analyticsApiKey");
							setShowApiKeyInput(true);
							setApiKey("");
						}}
						className="text-sm px-4 py-2 text-accent hover:text-accent/80 underline"
					>
						Change API Key
					</button>
				</div>

				{/* Key Metrics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
					<DashboardStatCard
						title="Total Alumni"
						value={insights.totalAlumni}
						icon="👥"
						trend="Total records in database"
					/>
					<DashboardStatCard
						title="Top Industry"
						value={insights.topIndustry?.industry || "-"}
						icon="🏢"
						trend={`${insights.topIndustry?.count || 0} alumni`}
					/>
					<DashboardStatCard
						title="Avg Employment"
						value={`${insights.avgEmploymentDuration}m`}
						icon="💼"
						trend="Average duration"
					/>
					<DashboardStatCard
						title="Certifications"
						value={insights.totalCertifications}
						icon="📚"
						trend="Professional credentials"
					/>
					<DashboardStatCard
						title="Degrees"
						value={insights.totalDegrees}
						icon="🎓"
						trend="Academic qualifications"
					/>
				</div>

				{/* Charts Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					{/* Industry Distribution - Bar Chart */}
					{analyticsData.industry.length > 0 && (
						<DashboardChartCard title="1. Industry Distribution " chartId="industry-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Bar
								data={industryChartData}
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

					{/* Graduation Year - Line Chart */}
					{analyticsData.graduationYear.length > 0 && (
						<DashboardChartCard title="2. Graduation Year Timeline " chartId="graduation-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Line
								data={graduationChartData}
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

					{/*Top Industries - Pie Chart */}
					{topIndustries.length > 0 && (
						<DashboardChartCard title="3. Top 8 Industries " chartId="top-industries-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Pie data={industryPieData} options={chartOptions} />
						</DashboardChartCard>
					)}

					{/* Degrees Distribution - Doughnut Chart */}
					{topDegrees.length > 0 && (
						<DashboardChartCard title="4. Degrees Distribution " chartId="degrees-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Doughnut data={degreesDoughnutData} options={chartOptions} />
						</DashboardChartCard>
					)}

					{/*Top Certifications - Horizontal Bar Chart */}
					{topCerts.length > 0 && (
						<DashboardChartCard title="5. Top Certifications " chartId="certifications-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Bar
								data={certificationsChartData}
								options={{
									...chartOptions,
									indexAxis: "y",
									scales: {
										x: {
											beginAtZero: true,
											ticks: { color: colors.secondary },
											grid: { color: colors.primaryLight },
										},
										y: {
											ticks: { color: colors.secondary },
											grid: { color: colors.primaryLight },
										},
									},
								}}
							/>
						</DashboardChartCard>
					)}

					{/* Bid Wins Distribution - Bar Chart */}
					{analyticsData.bidWins.length > 0 && (
						<DashboardChartCard title="6. Bid Wins Distribution " chartId="bidwins-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Bar
								data={bidWinsChartData}
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

					{/*Employment Start Dates - Bar Chart */}
					{analyticsData.employmentStartDate.length > 0 && (
						<DashboardChartCard title="7. Employment Start Dates " chartId="employment-dates-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Bar
								data={{
									labels: analyticsData.employmentStartDate
										.slice(0, 10)
										.map((item) => item.employmentStartDate),
									datasets: [
										{
											label: "Alumni Count",
											data: analyticsData.employmentStartDate
												.slice(0, 10)
												.map((item) => item.count),
											backgroundColor: colors.warning,
											borderColor: colors.warning.replace("0.8", "1"),
											borderWidth: 2,
											borderRadius: 8,
											hoverBackgroundColor: colors.warning.replace("0.8", "1"),
										},
									],
								}}
								options={{
									...chartOptions,
									scales: {
										y: {
											beginAtZero: true,
											ticks: { color: colors.secondary },
											grid: { color: colors.primaryLight },
										},
										x: {
											ticks: { color: colors.secondary, maxRotation: 45, minRotation: 0 },
											grid: { color: colors.primaryLight },
										},
									},
								}}
							/>
						</DashboardChartCard>
					)}

					{/* Employment Duration Distribution - Pie Chart */}
					{analyticsData.employmentDuration.length > 0 && (
						<DashboardChartCard title="8. Employment Duration Distribution " chartId="duration-chart" onExport={handleExportChartImage} isExporting={isExporting}>
							<Pie
								data={{
									labels: [
										"< 6 Months",
										"6-12 Months",
										"1-2 Years",
										"2-5 Years",
										"5+ Years",
									],
									datasets: [
										{
											data: [
												analyticsData.employmentDuration.filter(
													(d) => d.durationInMonths < 6
												).length,
												analyticsData.employmentDuration.filter(
													(d) => d.durationInMonths >= 6 && d.durationInMonths <= 12
												).length,
												analyticsData.employmentDuration.filter(
													(d) => d.durationInMonths > 12 && d.durationInMonths <= 24
												).length,
												analyticsData.employmentDuration.filter(
													(d) => d.durationInMonths > 24 && d.durationInMonths <= 60
												).length,
												analyticsData.employmentDuration.filter(
													(d) => d.durationInMonths > 60
												).length,
											],
											backgroundColor: [
												"rgba(239, 68, 68, 0.8)",
												"rgba(245, 158, 11, 0.8)",
												"rgba(250, 204, 21, 0.8)",
												"rgba(74, 222, 128, 0.8)",
												"rgba(34, 197, 94, 0.8)",
											],
											borderColor: [
												"rgba(239, 68, 68, 1)",
												"rgba(245, 158, 11, 1)",
												"rgba(250, 204, 21, 1)",
												"rgba(74, 222, 128, 1)",
												"rgba(34, 197, 94, 1)",
											],
											borderWidth: 2,
											hoverBackgroundColor: [
												"rgba(239, 68, 68, 1)",
												"rgba(245, 158, 11, 1)",
												"rgba(250, 204, 21, 1)",
												"rgba(74, 222, 128, 1)",
												"rgba(34, 197, 94, 1)",
											],
										},
									],
								}}
								options={chartOptions}
							/>
						</DashboardChartCard>
					)}
				</div>

				{/* Summary Statistics Table */}
				<div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-secondary/10">
					<h3 className="text-xl font-bold text-secondary mb-6">Summary Statistics</h3>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-secondary/10">
									<th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
										Metric
									</th>
									<th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
										Value
									</th>
									<th className="px-4 py-3 text-left text-sm font-semibold text-secondary">
										Insight
									</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-b border-secondary/10 hover:bg-secondary/5">
									<td className="px-4 py-3 text-sm text-secondary">Total Alumni</td>
									<td className="px-4 py-3 text-sm font-semibold text-secondary">
										{insights.totalAlumni}
									</td>
									<td className="px-4 py-3 text-sm text-secondary/70">
										{insights.totalAlumni > 100 ? "✓ Large dataset" : "Limited data"}
									</td>
								</tr>
								<tr className="border-b border-secondary/10 hover:bg-secondary/5">
									<td className="px-4 py-3 text-sm text-secondary">Top Industry</td>
									<td className="px-4 py-3 text-sm font-semibold text-secondary">
										{insights.topIndustry?.industry || "-"} ({insights.topIndustry?.count || 0})
									</td>
									<td className="px-4 py-3 text-sm text-secondary/70">
										{insights.topIndustry
											? `${(
													(insights.topIndustry.count / insights.totalAlumni) *
													100
											  ).toFixed(1)}% concentration`
											: "-"}
									</td>
								</tr>
								<tr className="border-b border-secondary/10 hover:bg-secondary/5">
									<td className="px-4 py-3 text-sm text-secondary">Average Employment Duration</td>
									<td className="px-4 py-3 text-sm font-semibold text-secondary">
										{insights.avgEmploymentDuration} months
									</td>
									<td className="px-4 py-3 text-sm text-secondary/70">
										{insights.avgEmploymentDuration > 24
											? "✓ Strong job retention"
											: "Career transitions common"}
									</td>
								</tr>
								<tr className="hover:bg-secondary/5">
									<td className="px-4 py-3 text-sm text-secondary">Total Certifications</td>
									<td className="px-4 py-3 text-sm font-semibold text-secondary">
										{insights.totalCertifications}
									</td>
									<td className="px-4 py-3 text-sm text-secondary/70">
										{insights.totalAlumni > 0
											? `${(
													(insights.totalCertifications / insights.totalAlumni) *
													100
											  ).toFixed(1)}% certified`
											: "-"}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
