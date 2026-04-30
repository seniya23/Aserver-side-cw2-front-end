import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import PlatformHeader from "../components/platformHeader";
import { getCurrentUser } from "../utils/auth";

const initialForm = {
	image: "",
	employmentStartDate: "",
	employmentEndDate: "",
	shortCourse: "",
	professionalLicences: "",
	professionalCertifications: "",
	degrees: "",
	linkedinUrl: "",
	biography: "",
	industry: "",
	graduationYear: "",
};

export default function AlumniProfileFormPage() {
	const user = getCurrentUser();
	const token = localStorage.getItem("token");
	const [formData, setFormData] = useState(initialForm);
	const [isLoading, setIsLoading] = useState(false);
	const [hasExistingProfile, setHasExistingProfile] = useState(false);

	useEffect(() => {
		if (!user?.email || !token) return;
		axios
			.get(`${import.meta.env.VITE_BACKEND_URL}/alumni/${user.email}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {
				const p = res?.data?.massage;
				if (p) {
					setHasExistingProfile(true);
					setFormData({
						image: p.image || "",
						employmentStartDate: p.employmentStartDate || "",
						employmentEndDate: p.employmentEndDate || "",
						shortCourse: p.shortCourses || "",
						professionalLicences: p.professionalLicences || "",
						professionalCertifications: p.professionalCertifications || "",
						degrees: p.degrees || "",
						linkedinUrl: p.linkedinUrl || "",
						biography: p.biography || "",
						industry: p.industry || "",
						graduationYear: p.graduationYear || "",
					});
				}
			})
			.catch(() => setHasExistingProfile(false));
	}, [token, user?.email]);

	if (!user?.email || !token) {
		return <Navigate to="/login" replace />;
	}

	async function onSubmit(e) {
		e.preventDefault();
		setIsLoading(true);
		try {
			if (hasExistingProfile) {
				await axios.put(
					`${import.meta.env.VITE_BACKEND_URL}/alumni/${user.email}`,
					{
						...formData,
						shortCourses: formData.shortCourse,
					},
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				toast.success("Profile updated successfully");
			} else {
				await axios.post(`${import.meta.env.VITE_BACKEND_URL}/alumni`, formData, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setHasExistingProfile(true);
				toast.success("Profile created successfully");
			}
		} catch (error) {
			toast.error(error?.response?.data?.message || "Failed to save profile");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="min-h-screen bg-primary">
			<PlatformHeader />
			<div className="max-w-3xl mx-auto p-6">
				<h1 className="text-2xl font-bold text-secondary mb-4">
					{hasExistingProfile ? "Update Alumni Profile" : "Create Alumni Profile"}
				</h1>
				<form onSubmit={onSubmit} className="bg-white rounded-xl p-6 grid md:grid-cols-2 gap-4 shadow">
					{Object.keys(initialForm).map((field) => (
						<div key={field} className={field === "biography" ? "md:col-span-2" : ""}>
							<label className="text-sm text-secondary/70 capitalize">
								{field.replace(/([A-Z])/g, " $1")}
							</label>
							{field === "biography" ? (
								<textarea
									value={formData[field]}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, [field]: e.target.value }))
									}
									className="w-full mt-1 border border-secondary/30 rounded-md p-2"
									rows={4}
								/>
							) : (
								<input
									value={formData[field]}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, [field]: e.target.value }))
									}
									className="w-full mt-1 border border-secondary/30 rounded-md p-2"
								/>
							)}
						</div>
					))}
					<button
						type="submit"
						disabled={isLoading}
						className="md:col-span-2 mt-2 px-4 py-2 bg-accent text-primary rounded-lg font-semibold"
					>
						{isLoading ? "Saving..." : hasExistingProfile ? "Update Profile" : "Create Profile"}
					</button>
				</form>
			</div>
		</div>
	);
}
