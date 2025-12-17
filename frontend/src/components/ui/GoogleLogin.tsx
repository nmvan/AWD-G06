import { Button } from "./button"
import { getGoogleAuthUrl } from "@/utils/oauth" // Import hàm bạn đã tạo ở bước trước

type Props = {
    className?: string
    // Để props lại để tránh lỗi type ở các file cha, dù không dùng tới.
    onSuccess?: (payload: any) => void
    onError?: (err: unknown) => void
}

export default function GoogleLogin({
    className,
}: Props) {

    const handleClick = () => {
        // ĐƠN GIẢN LÀ CHUYỂN HƯỚNG
        const googleUrl = getGoogleAuthUrl();
        window.location.href = googleUrl;
    }

    return (
        <Button onClick={handleClick} variant="outline" className={className} type="button">
            {/* Giữ nguyên SVG icon của bạn */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" fill="none" aria-hidden className="mr-2">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.35 1.53 8.25 2.8l6.03-6.03C34.97 3.02 29.88 1 24 1 14.72 1 6.94 6.92 3.5 14.94l7.07 5.48C12.9 14.1 17.98 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.15-2.78-.48-4.02H24v8.04h12.99c-.56 3.02-2.87 5.62-6.14 7.08l7.06 5.48C43.9 38.6 46.5 32.9 46.5 24.5z" />
                <path fill="#FBBC05" d="M10.57 29.42A14.99 14.99 0 0 1 9 24.5c0-1.6.27-3.14.76-4.5L3.5 14.94C1.3 18.9 0 22.63 0 24.5c0 3.14 1.03 6.04 2.76 8.43l7.81-3.51z" />
                <path fill="#34A853" d="M24 46c6.32 0 11.63-2.1 15.51-5.7l-7.06-5.48c-2.06 1.38-4.7 2.2-8.45 2.2-6.03 0-11.11-4.6-12.93-10.96l-7.07 5.48C6.94 41.08 14.72 46 24 46z" />
            </svg>
            <span>Continue with Google</span>
        </Button>
    )
}
