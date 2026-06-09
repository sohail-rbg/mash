"use client";
import { useEffect } from "react";
import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";


export default function SignInPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.replace("/");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || userId) {
    return null;
  }

  return <SignIn fallbackRedirectUrl="/" signUpUrl="/sign-up" ></SignIn>;
}
