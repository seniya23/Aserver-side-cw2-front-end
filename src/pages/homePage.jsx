import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PlatformHeader from "../components/platformHeader";
import { getCurrentUser } from "../utils/auth";
import toast from "react-hot-toast";
import Loader from "../components/loader";

function resolveImageUrl(...candidates) {
	for (const value of candidates) {
		if (typeof value !== "string") continue;
		const trimmed = value.trim();
		if (!trimmed) continue;
		if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
			return trimmed;
		}
		return `${import.meta.env.VITE_BACKEND_URL}/${trimmed}`;
	}
	return "/default.jpg";
}

export default function HomePage() {
	const user = getCurrentUser();
	const token = localStorage.getItem("token");
	const [winnerProfile, setWinnerProfile] = useState(null);
	const [homePosts, setHomePosts] = useState([]);
	const [newPostContent, setNewPostContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [feedError, setFeedError] = useState("");

	async function loadHomePosts() {
		if (!token) return;
		try {
			const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/alumni/posts`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const payload = res.data;
			const normalizedPosts = Array.isArray(payload)
				? payload
				: Array.isArray(payload?.posts)
				? payload.posts
				: Array.isArray(payload?.message)
				? payload.message
				: [];
			setHomePosts(normalizedPosts);
			setFeedError("");
		} catch (error) {
			setFeedError(error?.response?.data?.message || "Unable to load posts.");
			setHomePosts([]);
		}
	}

	useEffect(() => {
		async function loadHomeData() {
			setIsLoading(true);
			try {
				const [winnerResponse] = await Promise.all([
					axios.post(`${import.meta.env.VITE_BACKEND_URL}/bidding/viewwinner`).catch(() => null),
					loadHomePosts(),
				]);
				setWinnerProfile(winnerResponse?.data?.message || null);
			} finally {
				setIsLoading(false);
			}
		}
		loadHomeData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	const feedPosts = useMemo(() => {
		const posts = [];
		const safeHomePosts = Array.isArray(homePosts) ? homePosts : [];

		if (winnerProfile) {
			const winnerPostMatch = safeHomePosts.find(
				(post) => post?.alumniEmail && post.alumniEmail === winnerProfile.email
			);
			posts.unshift({
				id: "winner",
				title: "Alumni of the Day",
				content:
					"The Winner of Today's Bidding programme, congratulations to our active alumni! Check out their profile and connect with them.",
				email: winnerProfile.email,
				image: resolveImageUrl(
					winnerPostMatch?.image,
					winnerPostMatch?.profileImage,
					winnerProfile.profileImage,
					winnerProfile.winnerImage,
					winnerProfile.image
				),
				name: `${winnerProfile.firstName} ${winnerProfile.lastName}`,
			});
		}

		safeHomePosts.forEach((post) => {
			posts.push({
				id: `post-${post.id}`,
				title: "Alumni Post",
				content: post.content,
				email: post.alumniEmail,
				image: post.image || post.profileImage || "/logo.png",
				name: `${post.firstName || ""} ${post.lastName || ""}`.trim(),
				createdAt: post.createdAt,
			});
		});

		return posts;
	}, [homePosts, winnerProfile]);

	async function createPost() {
		if (!newPostContent.trim()) {
			toast.error("Post content is required");
			return;
		}
		setIsSubmitting(true);
		try {
			await axios.post(
				`${import.meta.env.VITE_BACKEND_URL}/alumni/posts`,
				{ content: newPostContent.trim() },
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setNewPostContent("");
			toast.success("Post created successfully");
			loadHomePosts();
		} catch (error) {
			toast.error(error?.response?.data?.message || "Unable to create post");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="w-full min-h-screen bg-linear-to-b from-primary to-white">
			<PlatformHeader />
			<div className="max-w-4xl mx-auto p-6 space-y-4">
				
				
				{user?.role === "alumni" && (
					<div className="bg-white rounded-xl p-5 shadow">
						<p className="font-semibold text-secondary mb-2">Create Alumni Post</p>
						<textarea
							rows={3}
							value={newPostContent}
							onChange={(e) => setNewPostContent(e.target.value)}
							placeholder="Share your professional update..."
							className="w-full border border-secondary/30 rounded-md p-3"
						/>
						<button
							onClick={createPost}
							disabled={isSubmitting}
							className="mt-3 text-sm px-3 py-1 bg-accent text-primary rounded-md font-semibold disabled:opacity-60"
						>
							{isSubmitting ? "Posting..." : "Publish Post"}
						</button>
					</div>
				)}
				{feedError && <div className="bg-red-100 text-red-700 rounded-xl p-4">{feedError}</div>}

				{isLoading ? (
					<Loader />
				) : (
					feedPosts.map((post) => (
						<div key={post.id} className="bg-white rounded-xl p-5 shadow">
							<div className="flex gap-4 items-start">
								<img
									src={post.image || (post.id === "winner" ? "/default.jpg" : "/logo.png")}
									alt={post.title}
									className="w-14 h-14 rounded-full object-cover"
									onError={(e) => {
										e.currentTarget.src = post.id === "winner" ? "/default.jpg" : "/logo.png";
									}}
								/>
								<div className="flex-1">
									<h2 className="text-xl font-semibold text-secondary">{post.title}</h2>
									{post.name && <p className="text-sm text-accent font-semibold">{post.name}</p>}
									{post.createdAt && (
										<p className="text-xs text-secondary/60">
											{new Date(post.createdAt).toLocaleString()}
										</p>
									)}
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