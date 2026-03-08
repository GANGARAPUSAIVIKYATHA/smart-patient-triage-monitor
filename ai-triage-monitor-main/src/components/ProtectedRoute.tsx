import { Navigate, useLocation } from "react-router-dom";
import { useAppState, type UserRole } from "@/context/AppStateContext";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { currentUser } = useAppState();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to={`/login/${allowedRoles[0]}`} replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
