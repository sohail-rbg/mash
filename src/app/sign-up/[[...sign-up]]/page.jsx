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

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black selection:bg-orange-500/30">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-40 scale-105"
          alt="Register background"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/40 via-black/10 to-black/10" />
      </div>

      {/* Glass Card Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl">
          <SignUp 
            fallbackRedirectUrl="/preferences" 
            signInUrl="/sign-in"
            appearance={{
              elements: {
                rootBox: "w-full flex justify-center",
                cardBox: "w-full",
                card: "!bg-transparent shadow-none border-none w-full p-[calc(var(--clerk-spacing,1rem)*1)]",
                main: "!bg-transparent w-full",
                header: "text-center",
                headerTitle: "text-white text-3xl font-bold text-center",
                headerSubtitle: "!text-white text-center",
                socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all rounded-2xl py-3.5",
                socialButtonsBlockButtonText: "font-bold text-white",
                dividerLine: "bg-white/5",
                colorText: "white",

                dividerText: "text-white/20 text-[10px] font-bold uppercase tracking-widest px-2",
                formFieldLabel: "text-[8px] font-bold !text-white uppercase tracking-[0.2em] ml-2",
                formFieldInput: "bg-white/10 border border-white/20 rounded-xl text-white",
                formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 font-semibold",
                footerAction: "justify-center",
                footerActionText: "!text-white/50",
                footerActionLink: "text-orange-400 font-semibold",
                identityPreviewText: "text-white",
                identityPreviewEditButtonIcon: "text-orange-400",
                formFieldAction: "text-orange-400 hover:text-orange-300 font-bold text-xs",
                userButtonPopoverActionButtonText: "text-white",
                formResendCodeLink: "text-orange-400 hover:text-orange-300 font-bold",
                footer: "!bg-transparent border-none shadow-none"
              },
              variables: {
                colorPrimary: "#f97316",
                colorText: "white",
                colorBackground: "transparent", // This should handle most default backgrounds
                colorInputBackground: "transparent",
                colorInputText: "white",
              },
              layout: {
                socialButtonsPlacement: "bottom"
              }
            }}
          />  
        </div>
      </div>
    </div>
  );
}
