import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

export default function MyProfilePage() {
	const user = getCurrentUser();

	if (!user?.email) {
		return <Navigate to="/login" replace />;
	}

	return <Navigate to={`/alumni/${user.email}`} replace />;
}
