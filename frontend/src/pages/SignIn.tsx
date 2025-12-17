import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/apiService";
import OtherMethodLogin from "@/components/ui/OtherMethodLogin";
// import { getGoogleAuthUrl } from "@/utils/oauth";

// 1. Schema Validation (tương tự SignUp)
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Please enter your password." }), // Chỉ cần không trống
});

export default function SignInPage() {
  // 2. Setup React Hook Form
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth(); // Lấy isAuthenticated

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, "local");

      toast.success("Sign in successfully!");
      navigate("/"); // Chuyển hướng về trang chủ
    },
    onError: (error: AxiosError) => {
      console.log("Lỗi đăng nhập:", error);
      toast.error("Failed to sign in. Please check your email and password.");
    },
  });

  // 3. Hàm Submit (Mô phỏng) [cite: 41]

  // 5. Hàm Submit
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      mutation.mutate(values);
    } catch (err) {
      console.error("Submit error:", err);
    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Form {...form}>
        <form
          onSubmit={(e) => {
            form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-4 w-full max-w-sm p-8 border rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold text-center">Sign In</h2>
          {/* Email field [cite: 40] */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Password field [cite: 40] */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Processing..." : "Sign In"}
          </Button>
          <div className="flex items-center justify-center space-x-2">
            <p className="text-muted-foreground text-sm">
              Do not have any accounts?
            </p>
            <Button
              type="button"
              variant="link"
              onClick={() => navigate("/signup")}
              className="cursor-pointer text-blue-600"
            >
              Sign Up
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-6 w-full max-w-sm flex justify-center">
        <OtherMethodLogin
          onGoogleSuccess={(payload) => {
            if (payload?.accessToken && payload?.refreshToken) {
              login(payload.accessToken, payload.refreshToken, "google");
              toast.success("Sign in successfully!");
              navigate("/");
            } else {
              toast.error("Google sign in failed.");
            }
          }}
          onGoogleError={(err) => {
            console.error("Google OAuth error:", err);
            toast.error("Google sign in failed.");
          }}
        />
      </div>

    </div>
  );
}
