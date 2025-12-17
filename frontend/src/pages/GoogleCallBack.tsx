import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { Loader2 } from "lucide-react";

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth(); // Lấy thêm isAuthenticated
    const isCalled = useRef(false);

    useEffect(() => {
        const code = searchParams.get("code");
        if (code && !isCalled.current) {
            isCalled.current = true;
            const handleLogin = async () => {
                try {
                    const res = await axios.post(import.meta.env.VITE_API_URL + "/auth/google", { code });
                    login(res.data.accessToken, res.data.refreshToken, "google");
                } catch (error) {
                    navigate("/signin");
                }
            };
            handleLogin();
        }
    }, [searchParams]);

    // Khi hàm login chạy xong -> State update -> isAuthenticated thành true -> Effect này chạy
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />

            <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-foreground">Đang xử lý đăng nhập...</h3>
                <p className="text-muted-foreground text-sm mt-1">Vui lòng chờ trong giây lát</p>
            </div>
        </div>
    );
};

export default GoogleCallback;