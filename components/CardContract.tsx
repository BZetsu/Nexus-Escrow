"use client";

import { formatTime } from "@/lib/utils/time_formatter";
import coin from "@/public/coin.svg";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaXTwitter } from "react-icons/fa6";

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
  founder?: string;
  contractor?: string;
  submissions?: Array<{
    date: number;
    status: "approved" | "rejected";
    materials?: string;
  }>;
  terminationReason?: string;
  lastStatusChange?: number;
}

// Add interface for submission type
interface Submission {
  date: number;
  status: "approved" | "rejected";
  materials?: string;
}

// Add interface for Modal props
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

// Add interface for timeline events
interface TimelineEvent {
  date: number;
  status: string;
  type: 'created' | 'started' | 'submitted' | 'approved' | 'rejected' | 'completed' | 'terminated';
  contractor?: string;
}

const formatEventDate = (timestamp: number): string => {
  try {
    // Validate timestamp
    if (!timestamp || isNaN(timestamp)) {
      return "Invalid date";
    }

    // Ensure timestamp is in milliseconds
    const timeInMs = timestamp * 1000;
    
    // Validate date range
    if (timeInMs < 0 || timeInMs > 8640000000000000) { // Max valid JS date
      return "Invalid date";
    }

    const date = new Date(timeInMs);
    
    // Validate date object
    if (date.toString() === "Invalid Date") {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return "Invalid date";
  }
};

const Timeline = ({ events }: { events: TimelineEvent[] }) => (
  <div className="relative space-y-4 py-4">
    {events.map((event, i) => (
      <div key={i} className="relative pl-6 pb-4">
        {i !== events.length - 1 && (
          <div className="absolute left-[11px] top-6 w-[2px] h-full bg-gray-200" />
        )}
        
        <div className={`absolute left-0 top-2 w-6 h-6 rounded-full flex items-center justify-center ${
          event.type === 'created' ? 'bg-blue-100' :
          event.type === 'started' ? 'bg-purple-100' :
          event.type === 'submitted' ? 'bg-yellow-100' :
          event.type === 'approved' ? 'bg-green-100' :
          event.type === 'completed' ? 'bg-green-100' :
          'bg-red-100'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            event.type === 'created' ? 'bg-blue-500' :
            event.type === 'started' ? 'bg-purple-500' :
            event.type === 'submitted' ? 'bg-yellow-500' :
            event.type === 'approved' ? 'bg-green-500' :
            event.type === 'completed' ? 'bg-green-600' :
            'bg-red-600'
          }`} />
        </div>
        
        <div className="ml-4">
          <div className="text-sm font-medium">
            {event.status}
            {event.contractor && <span className="text-gray-500 text-xs ml-1">({event.contractor})</span>}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatEventDate(event.date)}
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Modal: React.FC<ModalProps> = ({ open, onClose, children, className = "" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-xl p-6 max-w-md w-[95%] max-h-[90vh] overflow-y-auto ${className}`}>
        {children}
      </div>
    </div>
  );
};

// Add this helper function to calculate duration
const calculateDuration = (startDate: number, endDate: number): string => {
  // Convert to milliseconds and get difference
  const diffInSeconds = endDate - startDate;
  
  // Handle invalid dates
  if (diffInSeconds < 0) return "N/A";
  
  const days = Math.floor(diffInSeconds / (24 * 60 * 60));
  const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
};

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
  contractor,
  submissions,
  terminationReason,
  lastStatusChange
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
    
    // For myescrow page
    if (path.includes('myescrow')) {
      switch(statusNum) {
        case 3:
          return <span className="font-semibold text-green-500">Approved</span>;
        case 6:
          return <span className="font-semibold text-green-500">Approved</span>;
        case 9:
          return <span className="italic text-black">Awaiting Response...</span>;
        case 5:
          return "In Dispute";
        case 7:
          return "Terminated";
        case 1:
          return "Contract Started";
        case 0:
        default:
          return "Not Started";
      }
    }
    
    // For ongoing page
    if (isOngoingPage) {
      switch(statusNum) {
        case 3:
        case 6:
          return <span className="font-semibold text-green-500">Approved</span>;
        case 9:
          return "Submitted";
        case 1:
        case 2:
          return "Contract Started";
        case 4:
          return "Rejected";
        case 0:
        default:
          return "Contract Started";
      }
    }

    // Default status handling
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
  };

  const getStatusText = (status: number | string): string => {
    if (isPending || status === 'pending' || status === 'panding') {
      return "Pending...";
    }
    return getStatus(status).toString();
  };

  const [showSummary, setShowSummary] = useState(false);

  const handleClick = () => {
    if (getStatus(status) === "Completed" || status === 6 || status === 3 || status === 7) {
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

  const getTimelineEvents = (): TimelineEvent[] => {
    console.log('Timeline Debug:', {
      status,
      lastStatusChange,
      contractor,
      createdAt
    });

    const events: TimelineEvent[] = [
      {
        date: Math.floor(createdAt / 1000),
        status: 'Contract Created',
        type: 'created'
      }
    ];

    // Add contract started event if there's a contractor
    if (contractor && contractor !== "Not available") {
      events.push({
        date: Math.floor((lastStatusChange || createdAt) / 1000),
        status: `${contractor} Hired`,
        type: 'started',
        contractor: contractor
      });
    }

    // Add submission event if status is 9
    if (status === 9) {
      console.log('Adding submission event:', {
        date: Math.floor((lastStatusChange || Date.now()) / 1000),
        contractor
      });
      events.push({
        date: Math.floor((lastStatusChange || Date.now()) / 1000),
        status: `${contractor} Made Submission`,
        type: 'submitted',
        contractor: contractor
      });
    }

    // Add completion/termination events
    if (status === 6 || status === 3) {
      events.push({
        date: Math.floor((lastStatusChange || Date.now()) / 1000),
        status: 'Contract Completed',
        type: 'completed'
      });
    } else if (status === 7) {
      events.push({
        date: Math.floor((lastStatusChange || Date.now()) / 1000),
        status: 'Contract Terminated',
        type: 'terminated'
      });
    }

    // Sort events by date and ensure no duplicate timestamps
    return events
      .sort((a, b) => a.date - b.date)
      .map((event, index, array) => {
        // If this event has the same timestamp as the previous one, add 1 second
        if (index > 0 && event.date === array[index - 1].date) {
          return { ...event, date: event.date + 1 };
        }
        return event;
      });
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

      <Modal open={showSummary} onClose={() => setShowSummary(false)}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold">{contractName}</h2>
            <div className="flex items-center gap-4">
              {/* Add View Full Details button */}
              <button
                onClick={() => {
                  if (type === 3) {
                    router.push(`/escrow/ongoing/${escrow}`);
                  } else if (type === 2) {
                    router.push(`/escrow/${escrow}`);
                  } else {
                    router.push(`/escrow/myescrow/${escrow}`);
                  }
                }}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                View Full Details
              </button>
              <button onClick={() => setShowSummary(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">Contract Details</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src={coin} alt="USDC" width={20} height={20} />
                <p className="text-lg font-semibold">{amount / 1000_000} USDC</p>
              </div>
              <p className={`text-sm font-semibold ${
                status === 6 || status === 3 ? 'text-green-500' : 
                status === 7 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {getStatus(status)}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-3">Contract Timeline</h3>
            <Timeline events={getTimelineEvents()} />
          </div>

          {/* Participants */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">Participants</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Contract Creator:</span>
                <span className="font-medium">{founder || "Not available"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Contractor:</span>
                <span className="font-medium">{contractor || "Not available"}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm text-gray-500 mb-1">Timeline</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Started:</span>
                <span>{formatEventDate(Math.floor(createdAt / 1000))}</span>
              </div>
              {(status === 6 || status === 3 || status === 7) && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>{status === 7 ? 'Terminated:' : 'Completed:'}</span>
                    <span>{formatEventDate(Math.floor((lastStatusChange || Date.now()) / 1000))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span>{calculateDuration(
                      Math.floor(createdAt / 1000),
                      Math.floor((lastStatusChange || Date.now()) / 1000)
                    )}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {submissions && submissions.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-2">Submission History</h3>
              <div className="space-y-3">
                {submissions.map((sub: Submission, i: number) => (
                  <div key={i} className="text-sm border-l-2 pl-3 py-1
                    ${sub.status === 'approved' ? 'border-green-500' : 'border-red-500'}">
                    <div className="flex justify-between">
                      <span>{new Date(sub.date * 1000).toLocaleDateString()}</span>
                      <span className={sub.status === 'approved' ? 'text-green-500' : 'text-red-500'}>
                        {sub.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                    {sub.materials && (
                      <a href={sub.materials} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 block mt-1">
                        View Submission
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(status === 6 || status === 3 || status === 7) && (
            <div className="opacity-50 pointer-events-none">
              <div className="text-sm text-gray-500 mb-2">Contract is {status === 7 ? 'terminated' : 'completed'}</div>
              {status === 7 && terminationReason && (
                <div className="text-sm text-red-500 mb-4">
                  Reason: {terminationReason}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}