"use client";

import { formatTime } from "@/lib/utils/time_formatter";
import coin from "@/public/coin.svg";
import { Stack } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Button } from "@mui/material";

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
  createdAt,
  status,
  isPending,
  onCancelApply,
}: any) {
  const router = useRouter();
  const path = usePathname();

  const formattedDeadline = formatTime(deadline);

  const getTimeAgo = (timestamp: number) => {
    if (!timestamp || timestamp > Date.now()) return "N/A";
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    // If it's older than 30 days, show N/A
    if (seconds > 30 * 24 * 60 * 60) return "N/A";
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return seconds <= 60 ? 'Just now' : `${Math.floor(seconds)} seconds ago`;
  };

  const getDeadlineCountdown = (deadline: number) => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = deadline - now;
    
    if (timeLeft <= 0) return "Expired";
    
    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatus = (status: number) => {
    console.log('Status received:', status, typeof status);
    
    // Default to Not Started
    if (status === undefined || status === null || status === 0) {
      return "Not Started";
    }
    
    switch(status) {
      case 1:
        return "Contract Started";
      case 2:
        return "Work Submitted";
      case 3:
        return "Work Rejected";
      case 4:
        return "Work Resubmitted";
      case 5:
        return "In Dispute";
      case 6:
        return "Completed";
      case 7:
        return "Terminated";
      default:
        return "Not Started";
    }
  };

  const handleClick = () => {
    if (type === 3) {
      router.push(`/escrow/ongoing/${escrow}`);
    } else if (type === 2) {
      router.push(`/escrow/${escrow}`);
    } else {
      router.push(`/escrow/myescrow/${escrow}`);
    }
  };

  return (
    <motion.button
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className="w-full block"
    >
      <div className={`p-5 border border-gray-300 rounded-md shadow-md w-full font-myanmar relative ${
        path.includes("myescrow/") ? "p-8" : ""
      }`}>
        {status !== 0 && status !== 1 && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" 
               title={getStatus(status)}>
          </div>
        )}
        <div className="flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-base sm:text-lg text-start line-clamp-1">
                {contractName ? contractName : "No Title"}
              </div>
              <div className="flex items-center text-xs mt-1">
                <span className="text-gray-500 mr-1">Status:</span>
                <span className={
                  !status ? 'text-gray-500' : 
                  status === 6 ? 'text-green-500' : 
                  status === 5 ? 'text-red-500' : 
                  status === 1 ? 'text-blue-500' : 
                  'text-gray-500'
                }>
                  {getStatus(status)}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-0.5">
              <div>
                <Image src={coin} alt="coin" className="w-4 mt-1" />
              </div>
              <div className="text-base sm:text-lg h-fit">
                {amount ? (amount / 1000_000) : "N/A"}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4 text-[10px] text-textColor">
            <div className="text-[10px] text-textColor text-left">
              {getTimeAgo(createdAt)}
            </div>
            <div>
              Deadline: {deadline ? getDeadlineCountdown(deadline) : "N/A"}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
