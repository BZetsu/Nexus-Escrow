import React from "react";
import Card from "./Card";
import { ApproveModalType } from "@/lib/types/types";

export default function ApproveModal({
  title,
  client,
  contractor,
  amount = 3000,
  messageTitle,
  messageDescription,
  children,
}: ApproveModalType) {
  return (
    <Card width="sm">
      <div className="text-base text-center text-textColor">{title}</div>
      <div className="w-[90%] mx-auto mt-8 border border-textColor shadow-sm p-5 grid grid-cols-3 rounded-lg">
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
          <div className="text-2xl font-semibold text-black">{amount}</div>
        </div>
      </div>

      <div className="text-center text-lg font-semibold mt-5">
        {messageTitle}
      </div>
      <div className="text-center text-sm font-[200] text-textColor mt-2">
        <p>{messageDescription}</p>
      </div>

      <div className="flex justify-center mt-12">{children}</div>
    </Card>
  );
}
