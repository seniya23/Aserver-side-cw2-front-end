export default function DashboardStatCard({ title, value, icon, trend, colorClass = "border-secondary/10" }) {
	return (
		<div className={`bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border ${colorClass}`}>
			<div className="flex justify-between items-start mb-3">
				<p className="text-secondary/60 text-sm uppercase tracking-wide font-semibold">{title}</p>
				{icon && <span className="text-2xl">{icon}</span>}
			</div>
			<p className="text-3xl font-bold text-secondary mb-2">{value}</p>
			{trend && <p className="text-xs text-secondary/60">{trend}</p>}
		</div>
	);
}
