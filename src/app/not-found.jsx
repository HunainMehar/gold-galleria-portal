"use client"; // This directive is required for HeroUI components

import Link from "next/link";
import { Button } from "@heroui/react";
import { HomeIcon, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-default-100 p-6 rounded-full">
            <span className="text-6xl">404</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-default-600 mb-8">
                  {`The page you're looking for doesn't exist or has been moved.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as={Link}
            href="/"
            variant="flat"
            className="flex gap-2 items-center"
            startContent={<ArrowLeft size={18} />}
          >
            Go Back
          </Button>
          <Button
            as={Link}
            href="/home/dashboard"
            color="primary"
            className="flex gap-2 items-center"
            startContent={<HomeIcon size={18} />}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
