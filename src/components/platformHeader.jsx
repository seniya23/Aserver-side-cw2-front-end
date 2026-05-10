import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

export default function PlatformHeader() {
	const user = getCurrentUser();
	const navigate = useNavigate();

	const role = user?.role;

	const commonLinks = [
		{ to: "/", label: "Home" },
		{ to: "/analytics", label: "Charts" },
	];

	const userLinks =
		role === "alumni"
			? [
					{ to: "/my-profile", label: "My Profile" },
					{ to: "/profile-form", label: "Create/Update Profile" },
					{ to: "/bidding", label: "Blind Bidding" },
			  ]
			: [
					{ to: "/profile-form", label: "Become Alumni" },
			  ];

	function logout() {
		localStorage.removeItem("token");
		navigate("/login");
	}

	return (
		<nav className="w-full border-b border-accent/20 bg-secondary text-white px-3 sm:px-6 py-3 sm:py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
			<div className="flex items-center gap-3 w-full lg:w-auto">
				<img src="/logo.png" alt="logo" className="h-10 w-10 rounded-full object-cover" />
				<div>
					<p className="font-bold text-sm sm:text-base">PHANTASMAGORIA LTD</p>
					<p className="text-xs text-white/70">Alumni Platform</p>
				</div>
			</div>

			<div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm w-full lg:w-auto overflow-x-auto">
				{commonLinks.concat(user ? userLinks : []).map((item) => (
					<Link key={item.to} to={item.to} className="hover:text-gold transition-colors whitespace-nowrap">
						{item.label}
					</Link>
				))}
				{role === "admin" && (
					<Link to="/admin" className="text-gold whitespace-nowrap">
						Admin Dashboard
					</Link>
				)}
			</div>

			<div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto justify-end">
				{user ? (
					<>
						<p className="text-xs sm:text-sm whitespace-nowrap">
							{user.firstName} <span className="text-white/60">({user.role})</span>
						</p>
						<button
							onClick={logout}
							className="px-3 py-1 rounded bg-accent text-primary font-semibold text-xs sm:text-sm"
						>
							Logout
						</button>
					</>
				) : (
					<>
						<Link to="/login" className="px-3 py-1 rounded bg-accent text-primary font-semibold text-xs sm:text-sm">
							Login
						</Link>
						<Link to="/register" className="text-gold text-xs sm:text-sm">
							Register
						</Link>
					</>
				)}
			</div>
		</nav>
	);
}
