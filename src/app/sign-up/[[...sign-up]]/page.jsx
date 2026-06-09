"use client";

import { useEffect } from "react";
import { SignUp, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignUpPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();


  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (isLoaded && userId) {
      router.replace(redirectTo);
    }
  }, [isLoaded, userId, router, redirectTo]);

  if (!isLoaded || userId) {
    return null;
  }

  return <SignUp  fallbackRedirectUrl="/preferences" signInUrl="/sign-in"></SignUp>
}

