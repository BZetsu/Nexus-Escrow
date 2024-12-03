"use client";

import { Button } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useCallback } from "react";

interface NavigationType {
  name: string;
  path: string;
}

const navigation: NavigationType[] = [
  { name: "Home", path: "/escrow" },
  { name: "My Escrows", path: "/escrow/myescrow" },
  { name: "Freelance Contracts", path: "/escrow/ongoing" },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = useCallback(async (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      await router.push(path);
    } catch (error) {
      console.error('Navigation failed:', error);
    } finally {
      setTimeout(() => setIsNavigating(false), 500);
    }
  }, [router, isNavigating]);

  return (
    <div className="relative px-4 bg-white text-black text-sm sm:text-lg font-[500]">
      <div className="flex justify-center text-textColor font-mynamarButton gap-6 items-center mx-auto max-w-3xl">
        {navigation.map((el, i) => (
          <div
            key={i}
            className={`${
              !path.startsWith(navigation[1].path) &&
              !path.startsWith(navigation[2].path) &&
              el.name === "Home" &&
              "!border-black !border-b-4 !text-black font-semibold"
            } 
            ${
              path.startsWith(el.path) &&
              el.name !== "Home" &&
              "!border-black !border-b-4 !text-black font-semibold"
            }
            !flex-1 text-center`}
          >
            <button
              onClick={(e) => handleNavigation(e, el.path)}
              disabled={isNavigating}
              className={`!py-4 !normal-case !tracking-[0.8px] !text-xs sm:!text-base !w-full !h-full transition-opacity ${
                isNavigating ? 'opacity-50' : ''
              }`}
            >
              <div>{el.name}</div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
