'use client';

import { useRouter } from 'next/navigation';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function AuthCallbackPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full grid place-items-center bg-black text-white">
      <div className="max-w-lg p-6 text-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        <p className="text-sm text-white/70 mb-4">Completing authentication...</p>
        <AuthenticateWithRedirectCallback
          navigateToApp={({ decorateUrl }) => {
            router.replace(decorateUrl('/'));
          }}
          navigateToSignIn={() => router.replace('/login')}
          navigateToSignUp={() => router.replace('/register')}
        />
      </div>
    </div>
  );
}
