"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardAnimationType } from "@/lib/types/types";

export default function CardAnimation({
  children,
  className,
}: CardAnimationType) {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 2,
        type: "spring",
        stiffness: 500,
      }}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
}
