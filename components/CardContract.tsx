"use client";

import { formatTime } from "@/lib/utils/time_formatter";
import coin from "@/public/coin.svg";
import { Stack } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button, Modal } from "@mui/material";

// interface CardContractType {
//   contractName: string;
//   amount: number;
//   deadline: number;
//   type?: string;
// }

interface ContractSummary {
  contractName: string;
  amount: number;
  startDate: number;
  completionDate: number;
  status: string;
  description?: string;
  materials?: string;
}

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
  description,
  materials,
  founder,
  freelancer,
  escrowInfo
}: any) {
  const router = useRouter();
  const path = usePathname();
  
  const isOngoingPage = path.includes('/ongoing');

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

  const getStatus = (status: number | string) => {
    console.log('Status received:', status, typeof status);
    
    // Handle pending applications first
    if (isPending || status === 'pending' || status === 'panding') {
      return <span className="italic text-gray-300">Pending...</span>;
    }
    
    // Handle string status types
    if (typeof status === 'string') {
      if (status === 'In Dispute') return "In Dispute";
      if (status === 'Completed') return "Completed";
      if (status === 'Terminated') return "Terminated";
    }
    
    const statusNum = Number(status);
    
    // Handle completed and disputes first (highest priority)
    if (statusNum === 6 || statusNum === 3) {
      return "Completed";
    }
    
    if (statusNum === 5) {
      return "In Dispute";
    }
    
    if (statusNum === 7) {
      return "Terminated";
    }
    
    // Then handle ongoing page specific statuses
    if (isOngoingPage) {
      switch(statusNum) {
        case 1:
        case 2:
          return "Contract Started";
        case 9:
          return "Submitted";
        case 4:
          return "Rejected";
        case 0:
          return "Contract Started";
        default:
          return "Contract Started";
      }
    } else {
      // For non-ongoing pages
      switch(statusNum) {
        case 1:
          return "Contract Started";
        case 2:
          return "Work Submitted";
        case 4:
          return "Work Resubmitted";
        case 0:
        default:
          return "Not Started";
      }
    }
  };

  const getStatusText = (status: number | string): string => {
    if (isPending || status === 'pending' || status === 'panding') {
      return "Pending...";
    }
    return getStatus(status).toString();
  };

  const [showSummary, setShowSummary] = useState(false);

  const handleClick = () => {
    if (getStatus(status) === "Completed" || status === 6 || status === 3) {
      setShowSummary(true);
    } else {
      if (type === 3) {
        router.push(`/escrow/ongoing/${escrow}`);
      } else if (type === 2) {
        router.push(`/escrow/${escrow}`);
      } else {
        router.push(`/escrow/myescrow/${escrow}`);
      }
    }
  };

  // Add new helper function to get detailed status history
  const getContractHistory = (escrowInfo: any) => {
    if (!escrowInfo) {
      return [{
        event: 'Contract Created',
        date: new Date(createdAt * 1000).toLocaleDateString(),
        details: 'Contract details not available'
      }];
    }

    const history = [];
    
    // Add contract start
    history.push({
      event: 'Contract Created',
      date: new Date((escrowInfo.createdAt || createdAt) * 1000).toLocaleDateString(),
      details: `Contract created by ${escrowInfo?.founderInfo?.name || founder || 'Unknown'}`
    });

    // Add contractor assignment
    if (escrowInfo?.reciever) {
      history.push({
        event: 'Contractor Assigned', 
        date: new Date((escrowInfo.assignedAt || createdAt) * 1000).toLocaleDateString(),
        details: `${escrowInfo?.freelancerInfo?.name || freelancer || 'Unknown'} was assigned to the contract`
      });
    }

    // Add submission history
    if (escrowInfo?.submitted) {
      history.push({
        event: 'Work Submitted',
        date: new Date((escrowInfo.submittedAt || deadline) * 1000).toLocaleDateString(),
        details: escrowInfo.materials ? 'Submission included materials' : 'No materials attached'
      });
    }

    // Add rejection history
    if (escrowInfo.status === 4) {
      history.push({
        event: 'Submission Rejected',
        date: new Date(escrowInfo.rejectedAt * 1000).toLocaleDateString(),
        details: 'Work submission was rejected by client'
      });
    }

    // Add completion/termination
    if (escrowInfo.status === 6 || escrowInfo.status === 3) {
      history.push({
        event: 'Contract Completed',
        date: new Date(escrowInfo.completedAt * 1000).toLocaleDateString(),
        details: 'Work was approved and payment released'
      });
    } else if (escrowInfo.status === 7) {
      history.push({
        event: 'Contract Terminated',
        date: new Date(escrowInfo.terminatedAt * 1000).toLocaleDateString(),
        details: 'Contract was terminated'
      });
    }

    return history;
  };

  return (
    <>
      <motion.button
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleClick}
        className="w-full block"
      >
        <div className={`
          p-5 border border-gray-300 rounded-md 
          shadow-[0_1px_6px_0px_rgba(0,0,0,0.04)] 
          w-full font-myanmar relative 
          ${path.includes("myescrow/") ? "p-8" : ""}
        `}>
          {status !== 0 && status !== 1 && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" 
                 title={getStatusText(status)}>
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
                    isPending ? 'text-gray-300 italic' : 
                    !status ? 'text-gray-500' : 
                    getStatus(status) === "Completed" ? 'text-green-500 font-semibold' : 
                    getStatus(status) === "In Dispute" ? 'text-red-500' : 
                    ((isOngoingPage || path.includes('myescrow')) && getStatus(status) === "Contract Started") ? 'text-blue-400' : 
                    status === 4 ? 'text-red-500' : 
                    ((isOngoingPage || path.includes('myescrow')) && getStatus(status) === "Submitted") ? 'text-orange-300' : 
                    status === 2 ? 'text-orange-500' : 
                    'text-gray-500'
                  }>
                    {getStatus(status)}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-0.5">
                <div>
                  <Image 
                    src={coin} 
                    alt="coin" 
                    className="w-5 h-5 sm:w-6 sm:h-6 -translate-y-[2px] sm:-translate-y-1" 
                    priority
                  />
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

      <Modal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        className="grid place-items-center"
      >
        <div className="bg-white rounded-xl p-6 max-w-md w-[95%] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">{contractName}</h2>
            <button 
              onClick={() => setShowSummary(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Contract Parties */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-2">Contract Parties</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="font-semibold">{founder || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contractor</p>
                  <p className="font-semibold">{freelancer || "Unknown"}</p>
                </div>
              </div>
            </div>

            {/* Contract Value */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-1">Contract Value</h3>
              <div className="flex items-center gap-2">
                <Image src={coin} alt="USDC" width={20} height={20} />
                <p className="text-lg font-semibold">{amount / 1000_000} USDC</p>
              </div>
            </div>
            
            {/* Timeline */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-1">Timeline</h3>
              <div className="space-y-1">
                <p>Started: {new Date(createdAt * 1000).toLocaleDateString()}</p>
                <p>Completed: {new Date(deadline * 1000).toLocaleDateString()}</p>
                <p>Duration: {Math.ceil((deadline - createdAt) / (24 * 60 * 60))} days</p>
              </div>
            </div>

            {/* Contract History */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-3">Contract History</h3>
              <div className="space-y-3">
                {getContractHistory(escrowInfo).map((event, index) => (
                  <div key={index} className="border-l-2 border-gray-300 pl-3 py-1">
                    <p className="text-sm font-semibold">{event.event}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                    <p className="text-xs text-gray-600 mt-1">{event.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-1">Final Status</h3>
              <p className={`
                text-sm font-semibold
                ${status === 6 || status === 3 ? 'text-green-500' : 
                  status === 7 ? 'text-red-500' : 'text-gray-500'}
              `}>
                {getStatus(status)}
              </p>
              {status === 7 && (
                <p className="text-xs text-gray-500 mt-1">
                  Contract was terminated before completion
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}