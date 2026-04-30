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
		<nav className="w-full border-b border-accent/20 bg-secondary text-white px-6 py-4 flex items-center justify-between">
			<div className="flex items-center gap-3">
				<img src="/logo.png" alt="logo" className="h-10 w-10 rounded-full object-cover" />
				<div>
					<p className="font-bold">PHANTASMAGORIA LTD</p>
					<p className="text-xs text-white/70">Alumni Platform</p>
				</div>
			</div>

			<div className="flex items-center gap-4 text-sm">
				{commonLinks.concat(user ? userLinks : []).map((item) => (
					<Link key={item.to} to={item.to} className="hover:text-gold transition-colors">
						{item.label}
					</Link>
				))}
				{role === "admin" && (
					<Link to="/admin" className="text-gold">
						Admin Dashboard
					</Link>
				)}
			</div>

			<div className="flex items-center gap-3">
				{user ? (
					<>
						<p className="text-sm">
							{user.firstName} <span className="text-white/60">({user.role})</span>
						</p>
						<button
							onClick={logout}
							className="px-3 py-1 rounded bg-accent text-primary font-semibold"
						>
							Logout
						</button>
					</>
				) : (
					<>
						<Link to="/login" className="px-3 py-1 rounded bg-accent text-primary font-semibold">
							Login
						</Link>
						<Link to="/register" className="text-gold">
							Register
						</Link>
					</>
				)}
			</div>
		</nav>
	);
}
