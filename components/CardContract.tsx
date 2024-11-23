"use client";

import { formatTime } from "@/lib/utils/time_formatter";
import coin from "@/public/coin.svg";
import { Stack } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

// interface CardContractType {
//   contractName: string;
//   amount: number;
//   deadline: number;
//   type?: string;
// }

export default function CardContract({
  contractName,
  amount,
  deadline,
  escrow,
  type,
}: any) {
  const router = useRouter();
  const path = usePathname();

  const formattedDeadline = formatTime(deadline);
  return (
    <motion.button
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => {
        if (type === 1) {
          router.push(`/escrow/myescrow/${escrow}`);
        } else if (type === 2) {
          router.push(`/escrow/${escrow}`);
        } else {
          router.push(`/escrow/ongoing/${escrow}`);
        }
      }}
    >
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        className={`p-5 border border-gray-300 rounded-md shadow-md w-full font-myanmar ${
          path.slice(1, 16) === "escrow/myescrow" && "p-8"
        }`}
      >
        <div className="text-base sm:text-lg text-start line-clamp-1">
          {contractName ? contractName : "No Title"}
        </div>

        <Stack spacing={2}>
          <Stack flexDirection="row" alignItems="start" gap={0.5}>
            <div>
              <Image src={coin} alt="coin" className="w-4 mt-1" />
            </div>
            <div className="text-base sm:text-lg h-fit">
              {amount ? (amount / 1000_000) : "N/A"}
            </div>
          </Stack>

          <div
            className={`text-[10px] text-textColor ${
              path.slice(1, 16) === "escrow/myescrow" && "hidden"
            }`}
          >
            <span>{deadline ? `${formattedDeadline}` : "N/A"}</span>
            <span> min ago</span>
          </div>
        </Stack>
      </Stack>
    </motion.button>
  );
}
