import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your credentials to sign in to your account"
    >
      <LoginForm />
    </AuthLayout>
  );
}
