import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const NotFoundRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/signin" replace />;
};

export default NotFoundRedirect;
