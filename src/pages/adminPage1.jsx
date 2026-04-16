import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/loader.jsx";

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const apiBase = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (!token) {
            toast.error("Please log in as admin.");
            navigate("/login");
            return;
        }

        async function loadUsers() {
            setIsLoading(true);
            try {
                const response = await axios.get(`${apiBase}/api/users/all`, {
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
                `${apiBase}/api/users/status/${encodeURIComponent(user.email)}`,
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
        <div className="w-full min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center text-white py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8 flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-gold">Admin Dashboard</h1>
                    <p className="text-sm text-white/80">
                        Manage users and block or unblock accounts from this table.
                    </p>
                </div>

                <div className="overflow-x-auto rounded-3xl bg-black/70 shadow-2xl border border-white/10">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/5 text-left text-sm uppercase tracking-[0.18em] text-white/70">
                            <tr>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">First Name</th>
                                <th className="px-6 py-4">Last Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {users.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-white/70">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.email} className="hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <img
                                                src={user.image || "/logo.png"}
                                                alt={user.email}
                                                className="h-14 w-14 rounded-full object-cover border border-white/10"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white/90">{user.firstName}</td>
                                        <td className="px-6 py-4 text-sm text-white/90">{user.lastName}</td>
                                        <td className="px-6 py-4 text-sm uppercase text-white/80">{user.role}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                    user.isBlocked === 1
                                                        ? "bg-red-500/20 text-red-300"
                                                        : "bg-emerald-500/20 text-emerald-300"
                                                }`}
                                            >
                                                {user.isBlocked === 1 ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleBlockStatus(user)}
                                                disabled={isActionLoading}
                                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                    user.isBlocked === 1
                                                        ? "bg-emerald-500 text-black hover:bg-emerald-400"
                                                        : "bg-red-500 text-white hover:bg-red-400"
                                                } ${isActionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                {user.isBlocked === 1 ? "Unblock" : "Block"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {isLoading && (
                    <div className="mt-8 flex justify-center">
                        <Loader />
                    </div>
                )}
            </div>
        </div>
    );
}
