import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we'll send you a reset link"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
