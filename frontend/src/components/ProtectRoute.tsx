import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Nếu đang kiểm tra (loading), hiển thị 1 cái gì đó
  if (isLoading) {
    return <div>Đang tải...</div>; // Hoặc một spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // 3. Nếu đã đăng nhập, hiển thị nội dung trang
  return <Outlet />;
};

export default ProtectedRoute;
