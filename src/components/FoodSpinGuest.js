'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FoodSpin from './FoodSpin';

export default function FoodSpinGuest(props) {
  const [showToast, setShowToast] = useState(false);

  const handleClick = (e) => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <div onClick={handleClick} style={{ cursor: 'not-allowed', opacity: 0.6 }}>
        <FoodSpin {...props} />
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in">
          <p className="font-semibold">Please login to explore foods</p>
          <Link
            href="/sign-in"
            className="ml-2 underline hover:text-orange-100 font-semibold"
          >
            Sign In →
          </Link>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
