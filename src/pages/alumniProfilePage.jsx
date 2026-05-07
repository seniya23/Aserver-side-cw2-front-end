import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PlatformHeader from "../components/platformHeader";
import Loader from "../components/loader";

export default function AlumniProfilePage() {
	const { email } = useParams();
	const token = localStorage.getItem("token");
	const [profile, setProfile] = useState(null);
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!email) return;
		const headers = token
			? {
					Authorization: `Bearer ${token}`,
			  }
			: {};

		Promise.all([
			axios.get(`${import.meta.env.VITE_BACKEND_URL}/alumni/${email}`, { headers }),
			axios.get(`${import.meta.env.VITE_BACKEND_URL}/alumni/${email}/posts`, { headers }),
		])
			.then(([profileResponse, postsResponse]) => {
				const profileData = profileResponse?.data?.massage || null;
				setProfile(profileData);
				if (Array.isArray(postsResponse?.data)) {
					setPosts(postsResponse.data);
				} else {
					setPosts(postsResponse?.data?.posts || []);
				}
			})
			.catch((err) => setError(err?.response?.data?.message || "Unable to load alumni profile."))
			.finally(() => setIsLoading(false));
	}, [email, token]);

	return (
		<div className="min-h-screen bg-primary">
			<PlatformHeader />
			<div className="max-w-3xl mx-auto p-6">
				<Link to="/" className="text-accent text-sm">
					Back to home
				</Link>
				{isLoading && <Loader />}
				{error && <div className="bg-red-100 text-red-700 rounded-xl p-6 mt-3">{error}</div>}
				{profile && (
					<div className="bg-white rounded-xl p-6 mt-3 shadow">
						<div className="flex items-start gap-4">
							<img
								src={profile.image || "/logo.png"}
								alt={profile.firstName}
								className="w-24 h-24 rounded-full object-cover"
							/>
							<div>
								<h1 className="text-2xl font-bold text-secondary">
									{profile.firstName} {profile.lastName}
								</h1>
								<p className="text-secondary/80">{profile.email}</p>
								<p className="text-accent font-semibold">
									Profile Completion: {profile.profileCompletionPercentage || 0}%
								</p>
							</div>
						</div>
						<div className="grid md:grid-cols-2 gap-4 mt-6">
							<Info label="Industry" value={profile.industry} />
							<Info label="Graduation Year" value={profile.graduationYear} />
							<Info label="Degree" value={profile.degrees} />
							<Info label="Professional Certifications" value={profile.professionalCertifications} />
							<Info label="Short Courses" value={profile.shortCourses} />
							<Info label="Bid Wins" value={profile.bidWins} />
						</div>
						<div className="mt-4">
							<p className="font-semibold text-secondary">Biography</p>
							<p className="text-secondary/80">{profile.biography || "-"}</p>
						</div>
					</div>
				)}
				{profile && (
					<div className="bg-white rounded-xl p-6 mt-4 shadow">
						<h2 className="text-xl font-semibold text-secondary mb-3">Posts by {profile.firstName}</h2>
						{posts.length === 0 ? (
							<p className="text-secondary/70">No posts yet.</p>
						) : (
							<div className="space-y-3">
								{posts.map((post) => (
									<div key={post.id} className="border border-secondary/20 rounded-lg p-4">
										<p className="text-secondary whitespace-pre-line">{post.content}</p>
										<p className="text-xs text-secondary/60 mt-2">
											{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

function Info({ label, value }) {
	return (
		<div className="border border-secondary/20 rounded-lg p-3">
			<p className="text-xs uppercase text-secondary/60">{label}</p>
			<p className="font-medium text-secondary">{value || "-"}</p>
		</div>
	);
}
