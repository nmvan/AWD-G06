// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { setAccessToken } from "@/lib/api"; // Import từ file api
import { refreshAccessToken, fetchUserProfile, type UserProfile } from "@/services/apiService"; // Import từ service

// Định nghĩa kiểu dữ liệu cho context
interface AuthContextType {
  accessToken: string | null;
  user: UserProfile | null;
  authProvider: "local" | "google" | null;
  login: (
    accessToken: string,
    refreshToken: string,
    provider: "local" | "google"
  ) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 1. Access token lưu trong MEMORY (React state) (Req 21)
  const [accessToken, setTokenInState] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authProvider, setAuthProvider] = useState<
    "local" | "google" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Kiểm tra Refresh Token khi app tải
  useEffect(() => {
    const initializeAuth = async () => {
      // Chỉ thực hiện khi có refreshToken trong localStorage (Req 22)
      const refreshToken = localStorage.getItem("refreshToken");
      const storedProvider = localStorage.getItem("authProvider") as
        | "local"
        | "google"
        | null;

      if (refreshToken) {
        try {
          // Thử gọi API refresh
          const { accessToken: newAccessToken } = await refreshAccessToken();
          // Thành công: Đăng nhập
          login(newAccessToken, refreshToken, storedProvider || "local");
        } catch (error) {
          // Thất bại: (token hết hạn), coi như logout
          console.error("Failed to refresh on init", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []); // Chỉ chạy 1 lần khi app mount

  // Fetch user profile when accessToken changes
  useEffect(() => {
    const getUser = async () => {
      if (accessToken) {
        try {
          const profile = await fetchUserProfile();
          setUser(profile);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      } else {
        setUser(null);
      }
    };
    getUser();
  }, [accessToken]);

  // 3. Hàm Login: Nhận cả 2 token
  const login = (
    newAccessToken: string,
    newRefreshToken: string,
    provider: "local" | "google"
  ) => {
    setTokenInState(newAccessToken); // Lưu access vào state (memory)
    setAccessToken(newAccessToken); // Cập nhật cho Axios interceptor
    setAuthProvider(provider);
    localStorage.setItem("refreshToken", newRefreshToken); // Lưu refresh vào localStorage (Req 22)
    localStorage.setItem("authProvider", provider);
  };

  // 4. Hàm Logout: Xóa tất cả token (Req 22)
  const logout = () => {
    setTokenInState(null);
    setUser(null);
    setAccessToken(null); // Xóa khỏi Axios interceptor
    setAuthProvider(null);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authProvider");
  };

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        authProvider,
        login,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
      {!isLoading && children} {/* Chỉ render con khi đã check xong */}
    </AuthContext.Provider>
  );
};

// Custom Hook (giữ nguyên)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
