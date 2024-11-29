"use client";

import Card from "@/components/Card";
import CardContract from "@/components/CardContract";
import { getApplyFreelancer } from "@/lib/NexusProgram/escrow/utils.ts/getApplyFreelancer";
import { getFreeLacerEscrow } from "@/lib/NexusProgram/escrow/utils.ts/getFreelacerEscrow";
import { backendApi } from "@/lib/utils/api.util";
import { Stack } from "@mui/material";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

interface EscrowInfo {
  data: Array<{
    escrowAddress: string;
    createdAt: number;
  }>;
}

export default function page() {
  const [pendingEscrow, setPendingEscrow] = useState<any[]>();
  const [ongoingEscrow, setOngoingEscrow] = useState<any[]>();

  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  const getPendingEscrow = async () => {
    try {
      const pending = await getApplyFreelancer(anchorWallet, connection, "confirmed");
      const data = await backendApi.get(`/freelancer?freelancerAddress=${pending[0].user.toBase58()}`);
      
      // Add data and timestamps
      ((data as any).data as any[])!.forEach((dt: any, id: number) => {
        pending.forEach((pd: any, num: number) => {
          if (dt.escrowAddress === pd.escrow.toBase58()) {
            pending[num].escrowName = dt.contactName;             
            pending[num].amount = dt.amount;             
            pending[num].deadline = dt.deadline;
            pending[num].createdAt = dt.createdAt || Math.floor(Date.now() / 1000);
          }
        });
      });
      
      // Sort with newest first
      pending.sort((a, b) => {
        const timeA = a.createdAt || Date.now() / 1000;
        const timeB = b.createdAt || Date.now() / 1000;
        return timeB - timeA;
      });
      setPendingEscrow(pending.filter((p) => (p.status != "Success" && p.status != "Rejected")));
    } catch (e) {
      console.log(e);
    }
  };

  const getOngoingEscrow = async () => {
    try {
      const ongoing = await getFreeLacerEscrow(anchorWallet, connection, "confirmed");
      const databaseEscrowInfo = await backendApi.get(`/escrow`);
      
      // Create a timestamp map for faster lookup
      const timestampMap = new Map();
      (databaseEscrowInfo as EscrowInfo).data.forEach(data => {
        timestampMap.set(data.escrowAddress, data.createdAt);
      });
      
      // Add timestamps to all escrows
      const ongoingWithTimestamps = ongoing.map(es => {
        const pubkey = es.pubkey.toBase58();
        const timestamp = timestampMap.get(pubkey);
        
        // Log raw escrow data
        console.log("Raw escrow data:", {
          pubkey,
          status: es.status,
          submitted: es.submitted,
          approved: es.approved
        });

        let status = es.status;  // Keep original status
        
        // Only override for specific cases
        if (es.submitted && es.approved) {
          status = 3;  // Work Approved
        }

        return {
          ...es,
          createdAt: timestamp || 0,
          status: status
        };
      });
      
      // Sort by timestamp (newest first)
      const sortedOngoing = ongoingWithTimestamps.sort((a, b) => b.createdAt - a.createdAt);
      setOngoingEscrow(sortedOngoing);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!anchorWallet) return;
    getOngoingEscrow();
    getPendingEscrow();
  }, [anchorWallet]);

  const menu = [
    { title: "Ongoing Contracts", key: 0 },
    { title: "Disputes", key: 1 },
    { title: "View Past Contracts", key: 2 },
  ];

  const [value, setValue] = useState(0);

  // Update the getStatusText function
  const getStatusText = (status: number | string, isPending: boolean, hasReceiver: boolean) => {
    console.log("Status check:", { status, isPending, hasReceiver, value });

    // For pending applications
    if (isPending || status === 'panding' || status === 'pending') {
      return "Pending";
    }

    // For ongoing contracts view
    if (value === 0) {
      return "Contract Started";
    }

    // For disputes
    if (status === 5) {
      return "In Dispute";
    }

    return "Not Started";
  };

  // Add more detailed logging
  useEffect(() => {
    if (ongoingEscrow) {
      console.log("Detailed escrow status check:", ongoingEscrow.map(es => ({
        name: es.contractName,
        status: es.status,
        submitted: es.submitted,
        approved: es.approved,
        reciever: !!es.reciever,
        rawStatus: es.status
      })));
    }
  }, [ongoingEscrow]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 place-content-center-center w-full py-10 max-w-7xl mx-auto">
        <Card className="pb-10">
          <div className="flex justify-center sm:justify-start items-center gap-3 sm:gap-5">
            {menu.map((el, i) => (
              <motion.button
                whileHover={el.key == value ? {} : { scale: 1.02 }}
                whileTap={el.key == value ? {} : { scale: 0.98 }}
                key={i}
                onClick={() => setValue(i)}
                className="text-sm text-textColor disabled:text-black"
                disabled={el.key == value}
              >
                {el.title}
              </motion.button>
            ))}
          </div>
          <Stack mt={4} spacing={2.8}>
            {value === 0 ? (
              // Ongoing Contracts
              ongoingEscrow?.filter(es => es.reciever && es.status !== 5)
                .map((el, i) => (
                  <CardContract
                    key={i}
                    contractName={el.contractName}
                    amount={Number(el.amount)}
                    deadline={Number(el.deadline)}
                    escrow={el.pubkey.toBase58()}
                    createdAt={el.createdAt}
                    status="Contract Started"
                    type={3}
                  />
                ))
            ) : value === 1 ? (
              // Disputes
              ongoingEscrow?.filter(es => es.status === 5)
                .map((el, i) => (
                  <CardContract
                    key={i}
                    contractName={el.contractName}
                    amount={Number(el.amount)}
                    deadline={Number(el.deadline)}
                    escrow={el.pubkey.toBase58()}
                    createdAt={el.createdAt}
                    status="In Dispute"
                    type={3}
                  />
                ))
            ) : (
              // Past Contracts
              ongoingEscrow?.filter(es => es.status === 6 || es.status === 7)
                .map((el, i) => (
                  <CardContract
                    key={i}
                    contractName={el.contractName}
                    amount={Number(el.amount)}
                    deadline={Number(el.deadline)}
                    escrow={el.pubkey.toBase58()}
                    createdAt={el.createdAt}
                    status={el.status === 6 ? "Completed" : "Terminated"}
                    type={3}
                  />
                ))
            )}
          </Stack>
        </Card>

        <Card className="pb-10">
          <div className="text-sm text-textColor">Pending Applications</div>

          <Stack mt={4} spacing={2.8}>
            {pendingEscrow &&
              pendingEscrow.map((el, i) => (
                <CardContract 
                  key={i} 
                  {...el} 
                  contractName={el.escrowName} 
                  createdAt={el.createdAt} 
                  status={getStatusText(el.status, true, false)} 
                  type={3} 
                />
              ))
            }
          </Stack>
        </Card>
      </div>
    </div>
  );
}
