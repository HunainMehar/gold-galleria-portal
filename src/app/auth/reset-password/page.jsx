"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Divider,
  Spinner,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  RotateCw,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [mode, setMode] = useState("request"); // "request" or "reset"

  const { resetPassword, updatePassword, isAuthenticated } = useAuth();
  const router = useRouter();

  // Check if we're in password reset mode from URL params
  useEffect(() => {
    if (searchParams.has("type") && searchParams.get("type") === "recovery") {
      setMode("reset");
    }
  }, [searchParams]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home/dashboard");
    }
  }, [isAuthenticated, router]);

  // Handle password reset request
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setSuccess(
          "Password reset email sent! Please check your inbox and follow the instructions."
        );
      } else {
        setError(result.error || "Failed to send reset email");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle setting new password
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords don't match. Please try again.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updatePassword(password);

      if (result.success) {
        setSuccess(
          "Password updated successfully! You can now login with your new password."
        );
        // Redirect to login after successful password reset
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setError(result.error || "Failed to update password");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-default-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="flex flex-col gap-1 items-center pb-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Gold Galleria Portal</h1>
          </div>
          <p className="text-default-500 mt-1">
            {mode === "request" ? "Reset your password" : "Set new password"}
          </p>
        </CardHeader>

        <Divider className="my-4" />

        <CardBody>
          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 text-danger rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 text-success rounded-lg flex items-center gap-2">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          {mode === "request" ? (
            <form onSubmit={handleRequestReset} className="flex flex-col gap-5">
              <div className="bg-default-50 p-4 rounded-lg border border-default-200 mb-4">
                <h3 className="font-medium text-foreground">
                  Forgot your password?
                </h3>
                <p className="text-sm text-default-600 mt-1">
                  {`Enter your email below and we'll send you instructions to
                  reset your password.`}
                </p>
              </div>

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={<Mail size={18} className="text-default-400" />}
                placeholder="Enter your email"
                variant="bordered"
                isRequired
                classNames={{
                  inputWrapper:
                    "border-default-200 data-[hover=true]:border-primary",
                }}
              />

              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="flat"
                  startContent={<ArrowLeft size={18} />}
                  className="flex-1"
                  onClick={() => router.push("/auth/login")}
                >
                  Back to Login
                </Button>

                <Button
                  type="submit"
                  color="primary"
                  className="flex-1"
                  isLoading={isLoading}
                  startContent={!isLoading && <RotateCw size={18} />}
                >
                  Reset Password
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleSetNewPassword}
              className="flex flex-col gap-5"
            >
              <div className="bg-default-50 p-4 rounded-lg border border-default-200 mb-4">
                <h3 className="font-medium text-foreground">
                  Create a new password
                </h3>
                <p className="text-sm text-default-600 mt-1">
                  Your new password must be different from previous passwords.
                </p>
              </div>

              <Input
                label="New Password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startContent={
                  <KeyRound size={18} className="text-default-400" />
                }
                endContent={
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="focus:outline-none"
                  >
                    {isPasswordVisible ? (
                      <EyeOff size={18} className="text-default-400" />
                    ) : (
                      <Eye size={18} className="text-default-400" />
                    )}
                  </button>
                }
                placeholder="Enter new password"
                variant="bordered"
                isRequired
                classNames={{
                  inputWrapper:
                    "border-default-200 data-[hover=true]:border-primary",
                }}
              />

              <Input
                label="Confirm New Password"
                type={isConfirmVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                startContent={<Lock size={18} className="text-default-400" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                    className="focus:outline-none"
                  >
                    {isConfirmVisible ? (
                      <EyeOff size={18} className="text-default-400" />
                    ) : (
                      <Eye size={18} className="text-default-400" />
                    )}
                  </button>
                }
                placeholder="Confirm new password"
                variant="bordered"
                isRequired
                classNames={{
                  inputWrapper:
                    "border-default-200 data-[hover=true]:border-primary",
                }}
              />

              <Button
                type="submit"
                color="primary"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Update Password
              </Button>
            </form>
          )}
        </CardBody>

        <Divider />

        <CardFooter className="flex justify-center pt-4 pb-6">
          <p className="text-center text-default-500 text-sm">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-primary">
              Back to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
