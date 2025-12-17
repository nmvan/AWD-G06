import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { registerUser } from "@/services/apiService";
import OtherMethodLogin from "@/components/ui/OtherMethodLogin";
import { useAuth } from "@/contexts/AuthContext";

// 1. Định nghĩa Schema Validation bằng Zod
const formSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Email is required." })
      .email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(1, { message: "Please enter your password." })
      .min(6, { message: "Password must be at least 6 characters long." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // Thêm 'path' để lỗi hiển thị đúng ô confirmPassword
  });

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 4. Setup React Query Mutation [cite: 45]
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Sign up successfully! Please log in.");
      navigate("/signin"); // Chuyển hướng sang trang Login
    },
    onError: (error: AxiosError) => {
      let errorMessage = "Something went wrong. Please try again.";

      // Kiểm tra status code của lỗi
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          // 409 Conflict
          errorMessage = "This email already exists.";
        }
      }

      toast.error(errorMessage);
    },
  });

  // 5. Setup React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 6. Hàm Submit
  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values); // Gọi mutation của React Query
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full max-w-sm p-8 border rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold text-center">Sign Up</h2>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage /> {/* Hiển thị lỗi validation [cite: 49] */}
              </FormItem>
            )}
          />
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
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
            {mutation.isPending ? "Processing..." : "Sign Up"}
          </Button>
          <div className="flex items-center justify-center space-x-2">
            <p className="text-muted-foreground text-sm">
              Already have an account?
            </p>
            <Button
              variant="link"
              onClick={() => navigate("/signin")}
              className="cursor-pointer text-blue-600"
            >
              Sign In
            </Button>
          </div>
        </form>
      </Form>
      <div className="mt-6 w-full max-w-sm flex justify-center">
        <OtherMethodLogin
          onGoogleSuccess={(payload) => {
            if (payload?.accessToken && payload?.refreshToken) {
              login(payload.accessToken, payload.refreshToken, "google");
              toast.success("Signed in with Google!");
              navigate("/");
            } else {
              toast.error("Google sign up failed.");
            }
          }}
          onGoogleError={(err) => {
            console.error("Google OAuth error:", err);
            toast.error("Google sign up failed.");
          }}
        />
      </div>
    </div>
  );
}
