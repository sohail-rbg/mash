"use client";
import { useEffect, useState } from "react";
import { SignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";



export default function SignInPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Login ke baad sirf home "/" par redirect hona chahiye
  const redirectTo = "/";

  useEffect(() => {
    if (isLoaded && userId && !isRedirecting) { // isRedirecting check add kiya
      setIsRedirecting(true); // Redirection shuru hone par state set karein
      const timer = setTimeout(() => {
        router.replace(redirectTo);
      }, 3000); // 3 seconds delay taaki message pakka dikhe
      return () => clearTimeout(timer);
    }
  }, [isLoaded, userId, router, redirectTo, isRedirecting]); // isRedirecting dependency mein add kiya

  // Jab Clerk ka auth state load ho raha ho
  if (!isLoaded) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black selection:bg-orange-500/30">
        {/* Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-20 scale-105"
            alt="Loading background"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/40 via-black/10 to-black/10" />
        </div>

        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-2xl font-bold">
            Loading...
          </h2>
          <p className="text-white/50 mt-2">
            Initializing secure sign-in...
          </p>
        </div>
      </div>
    );
  }

  // Jab user login ho chuka ho aur hum redirect kar rahe hon
  if (userId && isRedirecting) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black selection:bg-orange-500/30">
        {/* Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-20 scale-105"
            alt="Loading background"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/40 via-black/10 to-black/10" />
        </div>

        <div className="relative z-10 text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-2xl font-bold">
            Redirecting<span className="animate-pulse">...</span>
          </h2>
          <p className="text-white/50 mt-2">
            Login Successful! Taking you to home page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-black selection:bg-orange-500/30">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-40 scale-105"
          alt="Login background"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/40 via-black/10 to-black/10" />
      </div>

      {/* Glass Card Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up" 
            appearance={{
              elements: {
                rootBox: "w-full flex justify-center",
                cardBox: "w-full",
                card: "!bg-transparent shadow-none border-none p-0 w-full",
                main: "!bg-transparent w-full",
                header: "text-center",
                headerTitle: "text-white text-3xl font-bold text-center",
                headerSubtitle: "text-white/60 text-center",
                socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all rounded-2xl py-3.5",
                socialButtonsBlockButtonText: "font-bold text-white",
                dividerLine: "bg-white/5",
                dividerText: "text-white/20 text-[10px] font-bold uppercase tracking-widest px-2",
                formFieldLabel: "text-[8px] font-bold !text-white uppercase tracking-[0.2em] ml-2",
                formFieldInput: "bg-white/10 border border-white/20 rounded-xl text-white",
                formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 font-semibold",
                footerAction: "justify-center",
                footerActionText: "!text-white/50",
                footerActionLink: "text-orange-400 font-semibold",
                identityPreviewText: "!text-white",
                identityPreviewEditButtonIcon: "text-orange-400",
                formFieldAction: "text-orange-400 hover:text-orange-300 font-bold text-xs",
                footer: "!bg-transparent border-none shadow-none"
              },
              variables: {
                colorPrimary: "#f97316",
                colorText: "white",
                colorBackground: "transparent",
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
