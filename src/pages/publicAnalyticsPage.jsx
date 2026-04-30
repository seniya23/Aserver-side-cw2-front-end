import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
} from "chart.js";
import PlatformHeader from "../components/platformHeader";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function PublicAnalyticsPage() {
	const [industry, setIndustry] = useState([]);
	const [certifications, setCertifications] = useState([]);
	const [degrees, setDegrees] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadPublicAnalytics() {
			setIsLoading(true);
			try {
				const apiBase = import.meta.env.VITE_BACKEND_URL;
				const [industryRes, certificationsRes, degreesRes] = await Promise.all([
					axios.get(`${apiBase}/users/industry`),
					axios.get(`${apiBase}/users/certifications`),
					axios.get(`${apiBase}/users/degrees`),
				]);
				setIndustry(industryRes.data || []);
				setCertifications(certificationsRes.data || []);
				setDegrees(degreesRes.data || []);
			} catch (error) {
				toast.error(
					error?.response?.data?.message ||
						"Unable to load analytics. Please verify backend routes."
				);
			} finally {
				setIsLoading(false);
			}
		}

		loadPublicAnalytics();
	}, []);

	const topIndustry = useMemo(() => {
		if (!industry.length) return null;
		return [...industry].sort((a, b) => (b.count || 0) - (a.count || 0))[0];
	}, [industry]);

	const industryChart = {
		labels: industry.map((item) => item.industry || "Unknown"),
		datasets: [
			{
				label: "Alumni Count",
				data: industry.map((item) => item.count || 0),
				backgroundColor: "rgba(139, 92, 246, 0.8)",
				borderColor: "rgba(139, 92, 246, 1)",
				borderWidth: 1,
			},
		],
	};

	const certsChart = {
		labels: certifications.map((item) => item.certification || "Not specified").slice(0, 8),
		datasets: [
			{
				label: "Certification Count",
				data: certifications.map((item) => item.count || 0).slice(0, 8),
				backgroundColor: [
					"rgba(249, 115, 22, 0.8)",
					"rgba(139, 92, 246, 0.8)",
					"rgba(34, 197, 94, 0.8)",
					"rgba(59, 130, 246, 0.8)",
				],
				borderWidth: 1,
			},
		],
	};

	const degreeChart = {
		labels: degrees.map((item) => item.degree || "Not specified").slice(0, 8),
		datasets: [
			{
				label: "Degree Count",
				data: degrees.map((item) => item.count || 0).slice(0, 8),
				backgroundColor: [
					"rgba(34, 197, 94, 0.8)",
					"rgba(245, 158, 11, 0.8)",
					"rgba(168, 85, 247, 0.8)",
					"rgba(20, 184, 166, 0.8)",
				],
				borderWidth: 1,
			},
		],
	};

	return (
		<div className="min-h-screen bg-linear-to-b from-primary to-white">
			<PlatformHeader />
			<div className="max-w-7xl mx-auto p-6">
				<h1 className="text-3xl font-bold text-secondary">Public Alumni Analytics</h1>
				<p className="text-secondary/70 mb-6">
					Accessible for users and alumni without API key scoping.
				</p>

				{isLoading ? (
					<div className="bg-white rounded-xl p-6 shadow">Loading analytics...</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							<StatCard
								title="Top Industry"
								value={topIndustry?.industry || "-"}
								note={`${topIndustry?.count || 0} alumni`}
							/>
							<StatCard
								title="Top Certifications"
								value={certifications?.[0]?.certification || "-"}
								note={`${certifications?.[0]?.count || 0} alumni`}
							/>
							<StatCard
								title="Top Degree"
								value={degrees?.[0]?.degree || "-"}
								note={`${degrees?.[0]?.count || 0} alumni`}
							/>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<ChartCard title="Industry Distribution">
								<Bar data={industryChart} />
							</ChartCard>
							<ChartCard title="Top Certifications">
								<Pie data={certsChart} />
							</ChartCard>
							<ChartCard title="Degree Distribution">
								<Doughnut data={degreeChart} />
							</ChartCard>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

function StatCard({ title, value, note }) {
	return (
		<div className="bg-white rounded-xl p-5 shadow">
			<p className="text-sm text-secondary/60">{title}</p>
			<p className="text-xl font-bold text-secondary">{value}</p>
			<p className="text-sm text-secondary/70">{note}</p>
		</div>
	);
}

function ChartCard({ title, children }) {
	return (
		<div className="bg-white rounded-xl p-5 shadow min-h-[320px]">
			<h2 className="text-lg font-semibold text-secondary mb-4">{title}</h2>
			<div className="h-[260px]">{children}</div>
		</div>
	);
}
