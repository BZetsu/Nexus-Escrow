"use client";

import Card from "@/components/Card";
import CardContract from "@/components/CardContract";
import { getFounderEscrow } from "@/lib/NexusProgram/escrow/utils.ts/getFounderEscrow";
import { Stack } from "@mui/material";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { backendApi, EscrowResponse } from "@/lib/utils/api.util";

// Add after imports
interface EscrowInfo {
  data: Array<{
    escrowAddress: string;
    createdAt: number;
  }>;
}

// Add this at the top level
const logContractState = (es: any) => {
  console.log("Raw Contract State:", {
    contractName: es.contractName,
    status: es.status,
    submitted: es.submitted,
    approved: es.approved,
    completed: es.completed,
    terminated: es.terminated,
    reciever: es.reciever?.toBase58(),
    founder: es.founder?.toBase58(),
    rawStatus: es.status,
    bump: es.bump,
    amount: es.amount?.toString(),
  });
};

// Update the isPastContract function
const isPastContract = (es: any) => {
  logContractState(es);
  
  // Check if contract is past based on raw status
  const isPast = 
    es.status >= 3 || // Status 3 or higher
    (es.submitted === 1 && es.approved === 1) || // Both flags set
    es.completed === 1 || // Completed flag
    es.terminated === 1; // Terminated flag
    
  console.log(`Contract ${es.contractName} isPast:`, isPast, {
    statusCheck: es.status >= 3,
    submittedApproved: (es.submitted === 1 && es.approved === 1),
    completed: es.completed === 1,
    terminated: es.terminated === 1
  });
  
  return isPast;
};

// Update the shouldShowContract helper function
const shouldShowContract = async (contract: any) => {
  try {
    // Get participant info
    const response = await backendApi.get<{
      data: Array<{
        userId: string;
        name: string;
        address: string;
      }>;
    }>('/nexus-user');

    // Try to find founder by both userId and address
    const founderData = response.data.find(
      user => user.userId === contract.founder?.toBase58() || 
              user.address === contract.founder?.toBase58()
    );

    // Try to find contractor by both userId and address
    const contractorData = contract.reciever ? 
      response.data.find(user => 
        user.userId === contract.reciever?.toBase58() || 
        user.address === contract.reciever?.toBase58()
      ) : null;

    // If no contractor found, set status to terminated (7)
    const finalStatus = (!contractorData || !contract.reciever) ? 7 : contract.status;

    console.log('Participant lookup:', {
      contract: contract.pubkey.toBase58(),
      founderAddress: contract.founder?.toBase58(),
      receiverAddress: contract.reciever?.toBase58(),
      foundFounder: !!founderData,
      foundContractor: !!contractorData,
      originalStatus: contract.status,
      finalStatus: finalStatus
    });

    return {
      ...contract,
      founder: founderData?.name || "Not available",
      contractor: contractorData?.name || "Not available",
      status: finalStatus,
      shouldShow: finalStatus === 6 || finalStatus === 3 || finalStatus === 7
    };
  } catch (err) {
    console.error('Error fetching participant info:', err);
    return {
      ...contract,
      founder: "Not available",
      contractor: "Not available",
      status: 7, // Set to terminated if error
      shouldShow: true
    };
  }
};

export default function page() {
  const [escrows, setEscrows] = useState<any[]>();
  // const [filter, setFilter] = useState<number>
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(true);

  const getEscrow = async () => {
    try {
      setIsLoading(true);
      const escrow = await getFounderEscrow(connection, anchorWallet!, "confirmed");
      console.log("Raw escrow data:", escrow);
      const databaseEscrowInfo = await backendApi.get<EscrowResponse>(`/escrow`);
      
      if (!databaseEscrowInfo || !databaseEscrowInfo.data) {
        console.error('No escrow data received from backend');
        return;
      }
      
      // Create a timestamp map for faster lookup
      const timestampMap = new Map();
      
      databaseEscrowInfo.data.forEach(data => {
        try {
          // Convert ISO date string to timestamp
          const timestamp = new Date(data.createdAt).getTime();
          if (!isNaN(timestamp)) {
            timestampMap.set(data.escrowAddress, timestamp);
          }
        } catch (err) {
          console.error('Error processing timestamp for escrow:', data.escrowAddress, err);
        }
      });
      
      // Add timestamps to all escrows
      const escrowsWithTimestamps = escrow.map(es => {
        const pubkey = es.pubkey.toBase58();
        const timestamp = timestampMap.get(pubkey);
        
        // Preserve status 9 when setting the status
        let status = es.status;
        
        // Add debug log
        console.log('Processing escrow status:', {
          contractName: es.contractName,
          rawStatus: es.status,
          hasReceiver: !!es.reciever,
          receiverAddress: es.reciever?.toBase58()
        });

        // Modified status determination logic
        if (es.status === 5) {
          status = 5; // In Dispute
        } else if (es.status === 3 || (es.approved && es.completed)) {
          status = 3; // Approved/Completed
        } else if (es.status === 6) {
          status = 6; // Completed
        } else if (es.status === 7 || es.terminated) {
          status = 7; // Terminated
        } else if (es.status === 9) {
          status = 9; // Awaiting Response
        } else if (!es.reciever || es.reciever.toBase58() === '11111111111111111111111111111111') {
          status = 0; // Not Started - no receiver
        } else {
          status = 1; // Contract Started - has receiver
        }

        return {
          ...es,
          createdAt: timestamp || 0,
          status: status
        };
      });
      
      // Sort by status change first, then by creation time
      const sortedEscrows = [...escrowsWithTimestamps].sort((a, b) => {
        // First sort by status change
        if (a.lastStatusChange !== b.lastStatusChange) {
          return b.lastStatusChange - a.lastStatusChange;
        }
        // Then by creation time
        return b.createdAt - a.createdAt;
      });
      setEscrows(sortedEscrows);
    } catch (e) {
      console.error('Error in getEscrow:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!anchorWallet) return;
    getEscrow();
  }, [anchorWallet]);

  const [openContracts, setOpenContracts] = useState(true);
  const [showPastContracts, setShowPastContracts] = useState(false);

  // Add this before the return statement to debug
  useEffect(() => {
    if (escrows) {
      console.log("Escrows status breakdown:", escrows.map(es => ({
        name: es.contractName,
        status: es.status,
        hasReceiver: !!es.reciever
      })));
    }
  }, [escrows]);

  // Add debug logging
  useEffect(() => {
    if (escrows && showPastContracts) {
      console.log("All escrows:", escrows.map(es => ({
        name: es.contractName,
        status: es.status,
        rawStatus: es.rawStatus,
        completed: es.completed,
        terminated: es.terminated
      })));
    }
  }, [escrows, showPastContracts]);

  // Add new state for past contracts
  const [pastContracts, setPastContracts] = useState<any[]>([]);

  // Add useEffect to handle async loading of past contracts
  useEffect(() => {
    if (showPastContracts && escrows) {
      const loadPastContracts = async () => {
        const contracts = await Promise.all(
          escrows
            .filter(es => es.status === 6 || es.status === 3 || es.status === 7)
            .map(async (el) => {
              const contractWithParticipants = await shouldShowContract(el);
              return contractWithParticipants;
            })
        );
        setPastContracts(contracts);
      };
      loadPastContracts();
    }
  }, [showPastContracts, escrows]);

  return (
    <Card 
      className="pb-10 mt-3 w-[95%] sm:w-[90%] max-w-[2000px] mx-auto px-1 sm:px-3 md:px-6 flex flex-col items-center"
    >
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        className="text-textColor text-xs w-full"
      >
        <Stack
          gap={1.8}
          className="text-sm sm:text-base text-textColor !flex-row !items-center"
        >
          <motion.button
            className="disabled:text-black"
            onClick={() => {
              setOpenContracts(true);
              setShowPastContracts(false);
            }}
            disabled={openContracts && !showPastContracts}
          >
            My Open contracts
          </motion.button>

          <motion.button
            className="disabled:text-black"
            onClick={() => {
              setOpenContracts(false);
              setShowPastContracts(false);
            }}
            disabled={!openContracts && !showPastContracts}
          >
            Disputes
          </motion.button>
        </Stack>
        <motion.button
          className={`pt-[3px] cursor-pointer ${showPastContracts ? 'text-black' : ''}`}
          onClick={() => setShowPastContracts(!showPastContracts)}
        >
          View past contracts
        </motion.button>
      </Stack>

      <Stack spacing={2.8} mt={3} className="w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px] sm:h-[300px] w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-textColor px-4"
            >
              <div className="text-base sm:text-lg font-medium">
                Loading contracts...
              </div>
            </motion.div>
          </div>
        ) : escrows && escrows.length > 0 ? (
          showPastContracts ? 
            // Show completed and terminated contracts
            pastContracts.map((el) => (
              <CardContract
                key={el.pubkey.toBase58()}
                contractName={el.contractName}
                amount={Number(el.amount)}
                deadline={Number(el.deadline)}
                escrow={el.pubkey.toBase58()}
                createdAt={el.createdAt}
                status={el.status}
                type={1}
                className="w-full p-5 sm:p-8 block"
                founder={el.founder}
                contractor={el.contractor}
              />
            ))
          : openContracts ?
            // Show only active contracts (Started and Not Started)
            escrows
              .filter((es) => es.status === 0 || es.status === 1 || es.status === 9)  // Include status 9
              .map((el, i) => (
                <CardContract
                  key={i}
                  contractName={el.contractName}
                  amount={Number(el.amount)}
                  deadline={Number(el.deadline)}
                  escrow={el.pubkey.toBase58()}
                  createdAt={el.createdAt}
                  status={el.status}
                  type={1}
                  className="w-full p-5 sm:p-8"
                />
              ))
          :
            // Show only disputes
            escrows
              .filter((es) => es.status === 5)
              .map((el, i) => (
                <CardContract
                  key={i}
                  contractName={el.contractName}
                  amount={Number(el.amount)}
                  deadline={Number(el.deadline)}
                  escrow={el.pubkey.toBase58()}
                  createdAt={el.createdAt}
                  status={el.status}
                  type={1}
                  className="w-full p-5 sm:p-8"
                />
              ))
        ) : (
          <div className="text-center text-textColor py-8 text-base sm:text-lg">
            No Escrowed Contracts Yet
          </div>
        )}
      </Stack>
    </Card>
  );
}
