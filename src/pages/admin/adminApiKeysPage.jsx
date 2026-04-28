import axios from "axios";
import { useEffect, useState } from "react";
import { BiPlus, BiTrash } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/loader";
import toast from "react-hot-toast";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function AdminApiKeysPage() {
	const [apiKeys, setApiKeys] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isActionLoading, setIsActionLoading] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showApiKey, setShowApiKey] = useState({});

	// Form state
	const [clientName, setClientName] = useState("");
	const [selectedPermissions, setSelectedPermissions] = useState([]);

	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const apiBase = import.meta.env.VITE_BACKEND_URL;

	// Available permissions
	const availablePermissions = [
		{ value: "read:alumni", label: "Read Alumni Data" },
		{ value: "read:analytics", label: "Read Analytics" },
		{ value: "read:alumni_of_day", label: "Read Alumni of Day" },
		{ value: "write:bidding", label: "Write Bidding Data" },
		{ value: "read:bidding", label: "Read Bidding Data" },
	];

	useEffect(() => {
		loadApiKeys();
	}, []);

	async function loadApiKeys() {
		setIsLoading(true);
		try {
			const response = await axios.get(`${apiBase}/users/api-keys`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setApiKeys(response.data || []);
		} catch (error) {
			console.error(error);
			toast.error("Unable to load API keys. Try again.");
			if (error.response?.status === 401 || error.response?.status === 403) {
				navigate("/login");
			}
		} finally {
			setIsLoading(false);
		}
	}

	async function createApiKey() {
		if (!clientName.trim()) {
			toast.error("Client name is required");
			return;
		}

		if (selectedPermissions.length === 0) {
			toast.error("Select at least one permission");
			return;
		}

		setIsActionLoading(true);

		try {
			await axios.post(
				`${apiBase}/users/create-api-key`,
				{
					clientName: clientName.trim(),
					permissions: selectedPermissions,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			toast.success(`API key created for ${clientName}`);
			setClientName("");
			setSelectedPermissions([]);
			setShowCreateModal(false);
			await loadApiKeys();
		} catch (error) {
			console.error(error);
			toast.error(error.response?.data?.message || "Failed to create API key");
		} finally {
			setIsActionLoading(false);
		}
	}

	async function toggleKeyStatus(keyRecord) {
		const nextStatus = keyRecord.isActive === 1 ? 0 : 1;
		setIsActionLoading(true);

		try {
			await axios.put(
				`${apiBase}/users/api-keys/${keyRecord.id}/status`,
				{
					isActive: nextStatus,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			toast.success(
				`API key ${nextStatus === 1 ? "activated" : "revoked"} successfully`
			);
			setApiKeys((currentKeys) =>
				currentKeys.map((item) =>
					item.id === keyRecord.id ? { ...item, isActive: nextStatus } : item
				)
			);
		} catch (error) {
			console.error(error);
			toast.error("Failed to update API key status");
		} finally {
			setIsActionLoading(false);
		}
	}

	async function deleteKeyHandler(keyId, clientName) {
		if (!confirm(`Are you sure you want to delete the API key for ${clientName}?`)) {
			return;
		}

		setIsActionLoading(true);

		try {
			await axios.delete(`${apiBase}/users/api-keys/${keyId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			toast.success("API key deleted successfully");
			setApiKeys((currentKeys) => currentKeys.filter((item) => item.id !== keyId));
		} catch (error) {
			console.error(error);
			toast.error("Failed to delete API key");
		} finally {
			setIsActionLoading(false);
		}
	}

	const maskApiKey = (key) => {
		if (!key || key.length < 10) return key;
		return key.substring(0, 6) + "..." + key.substring(key.length - 6);
	};

	const copyToClipboard = (key) => {
		navigator.clipboard.writeText(key);
		toast.success("API key copied to clipboard");
	};

	const toggleShowKey = (keyId) => {
		setShowApiKey((prev) => ({
			...prev,
			[keyId]: !prev[keyId],
		}));
	};

	return (
		<div className="w-full flex justify-center p-10 relative bg-gradient-to-b from-primary to-white text-secondary">
			{!isLoading ? (
				<div className="w-full max-w-7xl">
					{/* Header */}
					<div className="mb-8 flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-secondary mb-2">API Keys Management</h1>
							<p className="text-secondary/60">Create and manage scoped API keys for your applications</p>
						</div>
						<button
							onClick={() => setShowCreateModal(true)}
							className="px-6 py-3 bg-accent text-primary rounded-lg font-semibold flex items-center gap-2 hover:bg-accent/90 transition"
							disabled={isActionLoading}
						>
							<BiPlus className="text-xl" />
							Create New Key
						</button>
					</div>

					{/* Create Modal */}
					{showCreateModal && (
						<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
							<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
								<h2 className="text-2xl font-bold text-secondary mb-4">Create New API Key</h2>

								<div className="mb-4">
									<label className="block text-secondary font-semibold mb-2">Client Name</label>
									<input
										type="text"
										value={clientName}
										onChange={(e) => setClientName(e.target.value)}
										placeholder="e.g., Analytics Dashboard"
										className="w-full px-4 py-2 border border-secondary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
									/>
								</div>

								<div className="mb-6">
									<label className="block text-secondary font-semibold mb-3">Permissions</label>
									<div className="space-y-2">
										{availablePermissions.map((permission) => (
											<label key={permission.value} className="flex items-center gap-3 cursor-pointer">
												<input
													type="checkbox"
													checked={selectedPermissions.includes(permission.value)}
													onChange={(e) => {
														if (e.target.checked) {
															setSelectedPermissions([...selectedPermissions, permission.value]);
														} else {
															setSelectedPermissions(
																selectedPermissions.filter((p) => p !== permission.value)
															);
														}
													}}
													className="w-4 h-4 accent-accent rounded"
												/>
												<span className="text-secondary/80">{permission.label}</span>
											</label>
										))}
									</div>
								</div>

								<div className="flex gap-3">
									<button
										onClick={() => {
											setShowCreateModal(false);
											setClientName("");
											setSelectedPermissions([]);
										}}
										className="flex-1 px-4 py-2 border border-secondary/20 text-secondary rounded-lg hover:bg-secondary/5 transition"
										disabled={isActionLoading}
									>
										Cancel
									</button>
									<button
										onClick={createApiKey}
										className="flex-1 px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition"
										disabled={isActionLoading}
									>
										{isActionLoading ? "Creating..." : "Create Key"}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* API Keys Table */}
					<table className="w-full table-auto border-separate border-spacing-0 rounded-2xl overflow-hidden shadow-xl bg-white/70">
						<thead className="sticky top-0 z-10">
							<tr className="bg-secondary text-primary/95">
								<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
									Client Name
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
									API Key
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
									Permissions
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
									Created
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-secondary/10">
							{apiKeys.length === 0 ? (
								<tr>
									<td colSpan="6" className="px-6 py-8 text-center text-secondary/70">
										No API keys found. Create one to get started.
									</td>
								</tr>
							) : (
								apiKeys.map((keyRecord, index) => (
									<tr
										key={index}
										className="odd:bg-primary/60 even:bg-white hover:bg-primary/90 transition-colors"
									>
										<td className="px-6 py-4 text-sm font-semibold text-secondary">
											{keyRecord.clientName}
										</td>
										<td className="px-6 py-4 text-sm text-secondary/90">
											<div className="flex items-center gap-2">
												<code className="bg-secondary/10 px-3 py-1 rounded font-mono text-xs">
													{showApiKey[keyRecord.id]
														? keyRecord.key
														: maskApiKey(keyRecord.key)}
												</code>
												<button
													onClick={() => toggleShowKey(keyRecord.id)}
													className="p-1 hover:bg-secondary/10 rounded transition"
													title={showApiKey[keyRecord.id] ? "Hide key" : "Show key"}
												>
													{showApiKey[keyRecord.id] ? (
														<HiOutlineEyeOff className="text-secondary/60" />
													) : (
														<HiOutlineEye className="text-secondary/60" />
													)}
												</button>
												<button
													onClick={() => copyToClipboard(keyRecord.key, keyRecord.id)}
													className="px-2 py-1 text-xs bg-accent text-primary rounded hover:bg-accent/90 transition"
												>
													Copy
												</button>
											</div>
										</td>
										<td className="px-6 py-4 text-sm">
											<div className="flex flex-wrap gap-1">
												{keyRecord.permissions.map((perm, idx) => (
													<span
														key={idx}
														className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium"
													>
														{perm}
													</span>
												))}
											</div>
										</td>
										<td className="px-6 py-4 text-sm text-secondary/80">
											{new Date(keyRecord.createdAt).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 text-sm">
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold ${
													keyRecord.isActive === 1
														? "bg-green-100 text-green-700"
														: "bg-red-100 text-red-700"
												}`}
											>
												{keyRecord.isActive === 1 ? "Active" : "Revoked"}
											</span>
										</td>
										<td className="px-6 py-4 text-sm">
											<div className="flex gap-2">
												<button
													onClick={() => toggleKeyStatus(keyRecord)}
													className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
														keyRecord.isActive === 1
															? "bg-red-500 hover:bg-red-600 text-white"
															: "bg-green-500 hover:bg-green-600 text-white"
													}`}
													disabled={isActionLoading}
												>
													{keyRecord.isActive === 1 ? "Revoke" : "Activate"}
												</button>
												<button
													onClick={() => deleteKeyHandler(keyRecord.id, keyRecord.clientName)}
													className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-1"
													disabled={isActionLoading}
												>
													<BiTrash />
													Delete
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			) : (
				<Loader />
			)}
		</div>
	);
}