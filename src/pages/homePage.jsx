import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PlatformHeader from "../components/platformHeader";

export default function HomePage() {
	const [winnerProfile, setWinnerProfile] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		axios
			.post(`${import.meta.env.VITE_BACKEND_URL}/bidding/viewwinner`)
			.then((res) => {
				setWinnerProfile(res?.data?.message || null);
			})
			.catch(() => {
				setWinnerProfile(null);
			})
			.finally(() => setIsLoading(false));
	}, []);

	const feedPosts = useMemo(() => {
		const posts = [
			{
				id: "announcement",
				title: "Welcome to the Alumni Feed",
				content:
					"This home page now works like a social feed where highlighted alumni updates are shown to all users and alumni.",
				email: null,
				image: null,
			},
		];

		if (winnerProfile) {
			posts.unshift({
				id: "winner",
				title: "Alumni of the Day",
				content:
					"Selected through the midnight blind bidding process. This profile stays highlighted until day end.",
				email: winnerProfile.email,
				image: winnerProfile.image,
				name: `${winnerProfile.firstName} ${winnerProfile.lastName}`,
			});
		}
		return posts;
	}, [winnerProfile]);

	return (
		<div className="w-full min-h-screen bg-linear-to-b from-primary to-white">
			<PlatformHeader />
			<div className="max-w-4xl mx-auto p-6 space-y-4">
				<h1 className="text-3xl font-bold text-secondary">Community Feed</h1>
				<p className="text-secondary/80">
					Users can click on alumni cards to open the full alumni profile.
				</p>

				{isLoading ? (
					<div className="bg-white rounded-xl p-6 shadow">Loading home feed...</div>
				) : (
					feedPosts.map((post) => (
						<div key={post.id} className="bg-white rounded-xl p-5 shadow">
							<div className="flex gap-4 items-start">
								<img
									src={post.image || "/logo.png"}
									alt={post.title}
									className="w-14 h-14 rounded-full object-cover"
								/>
								<div className="flex-1">
									<h2 className="text-xl font-semibold text-secondary">{post.title}</h2>
									{post.name && <p className="text-sm text-accent font-semibold">{post.name}</p>}
									<p className="text-secondary/80 mt-2">{post.content}</p>
									{post.email && (
										<Link
											to={`/alumni/${post.email}`}
											className="inline-block mt-3 text-sm px-3 py-1 bg-accent text-primary rounded-md font-semibold"
										>
											View Alumni Profile
										</Link>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}