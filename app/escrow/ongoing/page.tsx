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

export default function page() {
  const [pendingEscrow, setPendingEscrow] = useState<any[]>();
  const [ongoingEscrow, setOngoingEscrow] = useState<any[]>();

  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  const getPendingEscrow = async () => {
    try {
      const pending = await getApplyFreelancer(
        anchorWallet,
        connection,
        "confirmed"
      );
      const data = await backendApi.get(`/freelancer?freelancerAddress=${pending[0].user.toBase58()}`);
      console.log(data);

      ((data as any).data as any[])!.map((dt: any, id: number) => {
        pending.map((pd: any, num: number) => {
          if (dt.escrowAddress == pd.escrow.toBase58()) {
            console.log(num);
            console.log(dt.escrowAddress);
            console.log(pd.escrow.toBase58());
            console.log(dt.amount);
            console.log(dt.contactName);
            pending[num].escrowName = dt.contactName;             
            pending[num].amount = dt.amount;             
            pending[num].deadline = dt.deadline;             
          }
        })
      })

      console.log("pending");
      console.log(pending.filter((p) => p.status != "Success"));
      setPendingEscrow(pending.filter((p) => (p.status != "Success" && p.status != "Rejected")));
      console.log(pending[0].user.toBase58());

      /// GET THE APPLY of the freelancerAddress
      //Get all applications of a freelancer
      console.log("data")
      
    } catch (e) {
      console.log(e);
    }
  };

  const getOngoingEscrow = async () => {
    try {
      const ongoing = await getFreeLacerEscrow(
        anchorWallet,
        connection,
        "confirmed"
      );
      console.log("ongoing");
      console.log(ongoing);
      setOngoingEscrow(ongoing);

  
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
            {ongoingEscrow &&
              (
                value === 0 ?
                  ongoingEscrow.filter((es) => es.status !== 5).map((el, i) => (
                    <CardContract
                      key={i}
                      contractName={el.contractName}
                      amount={Number(el.amount)}
                      deadline={Number(el.deadline)}
                      escrow={el.pubkey.toBase58()}
                      type={3}
                    />
                  ))
                  :
                  ongoingEscrow.filter((es) => es.status === 5).map((el, i) => (
                    <CardContract
                      key={i}
                      contractName={el.contractName}
                      amount={Number(el.amount)}
                      deadline={Number(el.deadline)}
                      escrow={el.pubkey.toBase58()}
                      type={3}
                    />
                  )))
            }
          </Stack>
        </Card>

        <Card className="pb-10">
          <div className="text-sm text-textColor">Pending Applications</div>

          <Stack mt={4} spacing={2.8}>
            {pendingEscrow &&
              pendingEscrow.map((el, i) => (
                <CardContract key={i} {...el} contractName={el.escrowName} type={3} />
              ))}
          </Stack>
        </Card>
      </div>
    </div>
  );
}
