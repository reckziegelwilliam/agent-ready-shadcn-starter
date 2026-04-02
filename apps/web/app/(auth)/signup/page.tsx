import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details to get started"
    >
      <SignupForm />
    </AuthLayout>
  );
}
