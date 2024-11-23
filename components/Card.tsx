"use client";

import { CardType } from "@/lib/types/types";
import { Container } from "@mui/material";
import React from "react";

export default function Card({ children, className, width = "sm" }: CardType) {
  return (
    <Container
      maxWidth={width}
      className={`p-5 bg-white rounded-lg shadow-md text-black ${className}`}
      style={{ boxShadow: "0px 4px 20px 0px #0000001A" }}
    >
      {children}
    </Container>
  );
}
