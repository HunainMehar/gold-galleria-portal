"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Checkbox,
  Divider,
  Spinner,
} from "@heroui/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Laptop,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn, isAuthenticated, authStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      setStatus("Already authenticated. Redirecting to dashboard...");
      const redirectTimer = setTimeout(() => {
        router.push("/home/dashboard");
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, router]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("Authenticating...");
    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (!result.success) {
        setError(result.error || "Invalid email or password");
        setStatus("");
      } else {
        setStatus("Login successful! Redirecting...");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setStatus("");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authStatus === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-default-100">
        <Card className="w-full max-w-md p-6 shadow-lg">
          <CardBody className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-success" />
            <h2 className="text-xl font-semibold">Already Logged In</h2>
            <p className="text-center text-default-500">
              {`You're already authenticated. Redirecting to your dashboard...`}
            </p>
            <Spinner color="primary" />
            <Button
              color="primary"
              startContent={<ArrowRight size={18} />}
              className="mt-4"
              onClick={() => router.push("/home/dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-default-100">
      {/* Left Side - Decorative/Info */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-primary text-primary-foreground">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-8 w-8" />
            Dash Admin
          </h1>
          <p className="mt-2 opacity-80">Dashboard & Expense Management</p>
        </div>

        <div className="space-y-8">
          <div className="relative">
            <div className="absolute -left-6 top-0 h-full w-1 bg-primary-foreground opacity-30 rounded"></div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Expense Tracking</h3>
              <p className="opacity-80">
                Monitor all your business expenses in one place
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-0 h-full w-1 bg-primary-foreground opacity-30 rounded"></div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Category Management</h3>
              <p className="opacity-80">
                Organize expenses with customizable categories
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-0 h-full w-1 bg-primary-foreground opacity-30 rounded"></div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Insightful Dashboard</h3>
              <p className="opacity-80">
                View analytics and reports at a glance
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm opacity-70">
          <Laptop size={18} />
          <span>© 2025 Dash Admin. All rights reserved.</span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg border-none">
          <CardHeader className="flex flex-col gap-1 items-center pb-0">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-small text-default-500">
              Sign in to your account
            </p>
          </CardHeader>

          <CardBody className="py-6">
            {error && (
              <div className="mb-4 p-4 bg-danger-50 border border-danger-200 text-danger rounded-lg flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {status && !error && (
              <div className="mb-4 p-4 bg-primary-50 border border-primary-200 text-primary rounded-lg flex items-center gap-2">
                {isLoading ? (
                  <Spinner size="sm" color="primary" />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {status}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={<Mail size={18} className="text-default-400" />}
                variant="bordered"
                isRequired
                classNames={{
                  inputWrapper:
                    "border-default-200 data-[hover=true]:border-primary",
                }}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startContent={<Lock size={18} className="text-default-400" />}
                endContent={
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="focus:outline-none"
                  >
                    {isVisible ? (
                      <EyeOff size={18} className="text-default-400" />
                    ) : (
                      <Eye size={18} className="text-default-400" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                variant="bordered"
                isRequired
                classNames={{
                  inputWrapper:
                    "border-default-200 data-[hover=true]:border-primary",
                }}
              />

              <div className="flex items-center justify-between px-1">
                <Checkbox
                  size="sm"
                  isSelected={rememberMe}
                  onValueChange={setRememberMe}
                >
                  Remember me
                </Checkbox>
                <Link
                  href="/auth/reset-password"
                  className="text-primary text-sm"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                endContent={!isLoading && <ArrowRight size={18} />}
              >
                Sign In
              </Button>
            </form>
          </CardBody>

          <Divider />

          <CardFooter className="pt-4 pb-6 flex justify-center">
            <p className="text-center text-default-500 text-sm">
              Need help? Contact{" "}
              <Link href="#" className="text-primary">
                support@dashadmin.com
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
