import React from "react";
import Card from "./Card";
import { ApproveModalType } from "@/lib/types/types";
import Image from "next/image";
import { Stack } from "@mui/material";
import coin from "@/public/coin.svg";

export default function ApproveModal({
  title,
  client,
  contractor,
  amount = 3000,
  messageTitle,
  messageDescription,
  children,
  showUSDC,
}: ApproveModalType) {
  return (
    <Card width="sm">
      <div className="text-base text-center text-textColor">{title}</div>
      <div className="w-[90%] mx-auto mt-6 border border-textColor shadow-sm p-5 grid grid-cols-3 rounded-lg">
        <div className="text-center col-span-1">
          <div className="text-xs text-textColor">Client</div>
          <div className="text-2xl font-semibold text-black">{client ? client : "You"}</div>
        </div>

        <div className="text-center col-span-1">
          <div className="text-xs text-textColor">Contractor</div>
          <div className="text-2xl font-semibold text-black">{contractor}</div>
        </div>

        <div className="text-center col-span-1">
          <div className="text-xs text-textColor">Amount</div>
          <div className="text-2xl font-semibold text-black flex items-center justify-center gap-1">
            {showUSDC && (
              <Image 
                src={coin} 
                alt="USDC" 
                className="w-5 h-5 sm:w-6 sm:h-6 -translate-y-[3px] sm:-translate-y-[4px]"
                priority 
              />
            )}
            <span>{amount}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-lg font-semibold mt-4">
        {messageTitle}
      </div>
      <div className="text-center text-sm font-[200] text-textColor mt-2">
        <p>{messageDescription}</p>
      </div>

      <div className="flex justify-center mt-5">
        {children}
      </div>
    </Card>
  );
}