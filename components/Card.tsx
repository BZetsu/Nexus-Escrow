"use client";

import { CardType } from "@/lib/types/types";
import React from "react";

export default function Card({ children, className }: CardType) {
  return (
    <div
      className={`
        p-5 bg-white rounded-lg text-black
        ${className}
        shadow-[0_2px_8px_0px_rgba(0,0,0,0.06)]
      `}
    >
      {children}
    </div>
  );
}
