// src/lib/api.ts
import axios, { type AxiosError } from "axios";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

// =================================================================
// 2. Tạo Axios Instance (Req 24)
// =================================================================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =================================================================
// 3. Request Interceptor: Tự động đính kèm Access Token (Req 25)
// =================================================================
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =================================================================
// 4. Response Interceptor: Tự động Refresh Token khi 401 (Req 26)
// =================================================================

// Biến cờ để tránh lặp vô hạn khi refresh
let isRefreshing = false;
// Hàng đợi chứa các request bị lỗi 401
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Hàm xử lý refresh
const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Bất kỳ status code nào nằm trong 2xx đều qua đây
    return response;
  },
  async (error: AxiosError) => {
    // Bất kỳ status code nào ngoài 2xx đều qua đây
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    // Chỉ xử lý 401 và không phải là request refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry && // <-- Prevent infinite loop
      !originalRequest.url?.includes("/auth/refresh") && // <-- THÊM ĐIỀU KIỆN
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        // Nếu đang refresh, đẩy request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      originalRequest._retry = true; // Đánh dấu đã thử lại

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Gọi API /auth/refresh
        // (Dùng axios gốc để tránh interceptor của instance `api`)
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = data.accessToken;
        setAccessToken(newAccessToken); // Cập nhật token trong memory
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Xử lý hàng đợi
        processQueue(null, newAccessToken);
        // Thực hiện lại request gốc
        return api(originalRequest);
      } catch (refreshError: any) {
        // Refresh thất bại (token hết hạn, không hợp lệ) (Req 28, 56)
        console.error("Refresh token failed:", refreshError);

        // Đẩy lỗi cho hàng đợi
        processQueue(refreshError as AxiosError, null);

        // Xóa token và logout
        setAccessToken(null);
        localStorage.removeItem("refreshToken");

        // Chuyển hướng về login
        // (Không dùng navigate vì đây là ngoài React component)
        window.location.href = "/sign-in";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
