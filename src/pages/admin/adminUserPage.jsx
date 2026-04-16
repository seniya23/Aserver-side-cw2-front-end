import axios from "axios";
import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../components/loader";
import { GoVerified } from "react-icons/go";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isActionLoading, setIsActionLoading] = useState(false);

	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const apiBase = import.meta.env.VITE_BACKEND_URL;

	useEffect(() => {
		async function loadUsers() {
			setIsLoading(true);
			try {
				const response = await axios.get(`${apiBase}/users/all`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setUsers(response.data || []);
			} catch (error) {
				console.error(error);
				toast.error("Unable to load users. Try again.");
				if (error.response?.status === 401 || error.response?.status === 403) {
					navigate("/login");
				}
			} finally {
				setIsLoading(false);
			}
		}

		loadUsers();
	}, [apiBase, navigate, token]);

	async function toggleBlockStatus(user) {
		const nextBlockValue = user.isBlocked === 1 ? 0 : 1;
		setIsActionLoading(true);

		try {
			await axios.put(
				`${apiBase}/users/toggle-block/${encodeURIComponent(user.email)}`,
				{
					isBlocked: nextBlockValue,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			toast.success(
				`User ${user.email} has been ${nextBlockValue === 1 ? "blocked" : "unblocked"}.`
			);
			setUsers((currentUsers) =>
				currentUsers.map((item) =>
					item.email === user.email
						? { ...item, isBlocked: nextBlockValue }
						: item
				)
			);
		} catch (error) {
			console.error(error);
			toast.error("Failed to update user status.");
		} finally {
			setIsActionLoading(false);
		}
	}

	return (
		<div
			className="w-full flex justify-center p-10 relative
      bg-gradient-to-b from-primary to-white text-secondary"
		>
			{!isLoading ? (
				<table
					className="w-full max-w-7xl table-auto border-separate border-spacing-0
        rounded-2xl overflow-hidden shadow-xl bg-white/70 
        "
				>
					<thead className="sticky top-0 z-10">
						<tr className="bg-secondary text-primary/95">
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
								Image
							</th>
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
								Email
							</th>
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
								First Name
							</th>
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
								Last Name
							</th>
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
								Role
							</th>
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
								status
							</th>
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"></th>
						</tr>
					</thead>

					<tbody className="divide-y divide-secondary/10">
						{users.length === 0 && !isLoading ? (
							<tr>
								<td colSpan="7" className="px-4 py-3 text-center text-secondary/70">
									No users found.
								</td>
							</tr>
						) : (
							users.map((item, index) => {
								return (
									<tr
										key={index}
										className="odd:bg-primary/60 even:bg-white hover:bg-primary/90 transition-colors"
									>
										<td className="px-4 py-3 align-middle">
											<img
												src={item.image || "/logo.png"}
												className="w-[38px] h-[38px] rounded-lg object-cover ring-1 ring-secondary/10 shadow-sm"
											/>
										</td>
										<td className="px-4 py-3 text-sm font-medium text-secondary/90 flex flex-row items-center gap-2">
											{item.email} {item.isEmailVerified ? <GoVerified className="text-blue-400" /> : ""}
										</td>
										<td className="px-4 py-3 text-sm">{item.firstName}</td>
										<td className="px-4 py-3 text-sm font-semibold text-secondary">
											{item.lastName}
										</td>
										<td className="px-4 py-3 text-sm font-semibold text-secondary">
											{item.role}
										</td>
										<td className="px-4 py-3 text-sm">
											{item.isBlocked === 1 ? "Blocked" : "Active"}
										</td>
										<td className="px-4 py-3 text-sm">
											<button
												className="px-3 py-1 bg-accent text-primary rounded-lg"
												onClick={() => toggleBlockStatus(item)}
												disabled={isActionLoading}
											>
												{item.isBlocked === 1 ? "Unblock User" : "Block User"}
											</button>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			) : (
				<Loader />
			)}

			
		</div>
	);
}