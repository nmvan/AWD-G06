import * as React from "react"
import { cn } from "@/lib/utils"
import GoogleLogin from "./GoogleLogin"

type Props = {
    className?: string
    onGoogleSuccess?: (payload: any) => void
    onGoogleError?: (err: unknown) => void
    /** Additional provider nodes to render alongside Google */
    children?: React.ReactNode
}

export default function OtherMethodLogin({
    className,
    onGoogleSuccess,
    onGoogleError,
    children,
}: Props) {
    return (
        <div className={cn("w-full max-w-md", className)}>
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-muted-foreground/20" />
                <div className="text-sm text-muted-foreground">Or continue with</div>
                <div className="flex-1 h-px bg-muted-foreground/20" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
                <GoogleLogin onSuccess={onGoogleSuccess} onError={onGoogleError} />
                {children}
            </div>
        </div>
    )
}
