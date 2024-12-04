"use client";

import { Button } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useCallback, useEffect } from "react";

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
  const [activeIndex, setActiveIndex] = useState(0);

  // Determine active index based on current path
  useEffect(() => {
    const index = navigation.findIndex(item => {
      if (item.name === "Home") {
        return !path.startsWith("/escrow/myescrow") && !path.startsWith("/escrow/ongoing");
      }
      return path.startsWith(item.path);
    });
    setActiveIndex(index !== -1 ? index : 0);
  }, [path]);

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
      <div className="flex justify-center text-textColor font-mynamarButton gap-6 items-center mx-auto max-w-3xl relative">
        {/* Animated underline - adjusted left positioning */}
        <div 
          className="absolute bottom-0 h-1 bg-black transition-all duration-300 ease-in-out"
          style={{
            width: `calc(${100 / navigation.length}% - 24px)`, // Keep width same
            left: '3px',
            transform: `translateX(calc(${activeIndex * 100}% + ${
              // Different gap multiplier after My Escrows
              activeIndex <= 1 
                ? activeIndex * 27 
                : (activeIndex * 27) + 10
            }px))`,
          }}
        />
        
        {navigation.map((el, i) => (
          <div
            key={i}
            className={`${
              i === activeIndex ? "!text-black font-semibold" : ""
            } !flex-1 text-center relative`}
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
