"use client";

import { CardType } from "@/lib/types/types";
import React from "react";

export default function Card({ children, className }: CardType) {
  return (
    <div
      className={`p-5 bg-white rounded-lg shadow-md text-black ${className}`}
      style={{ boxShadow: "0px 4px 20px 0px #0000001A" }}
    >
      {children}
    </div>
  );
}
