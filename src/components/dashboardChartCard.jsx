import { BiDownload } from "react-icons/bi";

export default function DashboardChartCard({
	title,
	chartId,
	onExport,
	isExporting = false,
	children,
	className = "",
}) {
	return (
		<div className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-secondary/10 ${className}`.trim()}>
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-xl font-bold text-secondary">{title}</h3>
				{chartId && onExport && (
					<button
						onClick={() => onExport(chartId, title.replace(/[^a-zA-Z0-9]/g, "-"))}
						disabled={isExporting}
						className="p-2 text-accent hover:text-accent/80 transition disabled:opacity-50"
						title="Export chart as PNG"
					>
						<BiDownload size={18} />
					</button>
				)}
			</div>
			<div className="h-80" id={chartId}>
				{children}
			</div>
		</div>
	);
}
