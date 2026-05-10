export default function CommonCard({ children, className = "" }) {
	return (
		<div className={`bg-white rounded-xl shadow p-4 sm:p-5 ${className}`.trim()}>
			{children}
		</div>
	);
}
