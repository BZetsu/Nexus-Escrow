"use client";

import DisputeCard from "@/components/DisputeCard";
import { disputeSuccess } from "@/lib/NexusProgram/escrow/disputeSuccess";
import { disputeReject } from "@/lib/NexusProgram/escrow/disputereject";
import { getAllEscrow } from "@/lib/NexusProgram/escrow/utils.ts/getAllEscrow";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { notify_delete, notify_error, notify_laoding, notify_success } from "../layout";
const imageLink =
  "https://cdn.discordapp.com/attachments/1085293900706627595/1162203481017438298/Untitled670_20230803112855_1.png?ex=66d9b516&is=66d86396&hm=f02d02ef44519c088678162796c8bd1ffc30c7279248c532355f9871773447f8&";

export default function page() {
  const [disptueState, setDisputeState] = useState(true);
  const [escrows, setEscrows] = useState<any[]>();
  // const [filter, setFilter] = useState<number>
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  const [disputes, setDisputed] = useState([
    { id: 1, ClinetName: "Zetsu", FreelancerName: "Manay", isResolved: false },
    { id: 2, ClinetName: "Zetsu", FreelancerName: "Manay", isResolved: false },
  ]);

  const handleCheckboxChange = (id: number) => {
    setDisputed(
      disputes.map((el) =>
        el.id === id ? { ...el, isResolved: !el.isResolved } : el
      )
    );
  };

  const ResolvedDisptued = [...disputes].filter((x) => x.isResolved);
  const NotResolvedDisptued = [...disputes].filter((x) => !x.isResolved);

  const getEscrow = async () => {
    try {
      console.log("wow");
      const escrow = await getAllEscrow(
        connection,
        "confirmed"
      );
      escrow.map((es, i) => {
        escrow[i].id = i;
      })
      setEscrows(escrow);
      console.log(escrow);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!anchorWallet) return;
    getEscrow();
  }, [anchorWallet]);


  const dispute_success = async (id: number) => {
    try {
      notify_laoding("Transaction Pending...!");
      console.log(id);
      console.log(escrows);
      console.log(escrows![id]);

      const tx = await disputeSuccess(anchorWallet, connection, wallet, escrows![id].pubkey, escrows![id].reciever);
      notify_delete();
      notify_success("Transaction Success!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    }
  }

  const dispute_reject = async (id: number) => {
    try {
      notify_laoding("transaction pending...");
      console.log(id);
      console.log(escrows);
      console.log(escrows![id]);

      const tx = await disputeReject(anchorWallet, connection, wallet, escrows![id].pubkey, escrows![id].reciever)

      notify_delete();
      notify_success("Transaction Success!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    }
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-base text-textColor">
          <button
            disabled={disptueState}
            onClick={() => setDisputeState(true)}
            className="disabled:text-black disabled:font-semibold"
          >
            Open Disputes
          </button>
          <button
            disabled={!disptueState}
            onClick={() => setDisputeState(false)}
            className="disabled:text-black disabled:font-semibold"
          >
            Resolved
          </button>
        </div>
        <div className="text-xl font-semibold">150</div>
      </div>

      <motion.div className="w-full border border-textColor p-5 rounded-xl  flex flex-col space-y-10">
        {escrows &&
          escrows.filter((es) => es.status === 5).map((el, i) => (
            <div key={i} 
            className="flex items-center justify-center sm:justify-around flex-col sm:flex-row gap-5 border-b border-textColor/50 pb-8">
            {el.contractName}
              <div className="flex justify-center">
                <DisputeCard
                  title={el.ClinetName}
                  role="Client"
                  image={imageLink}
                  contactLink={dispute_reject}
                  id={el.id}
                />
              </div>

              <div className="flex justify-center">
                <DisputeCard
                  title={el.FreelancerName}
                  role="Freelancer"
                  image={imageLink}
                  contactLink={dispute_success}
                  id={el.id}
                />
              </div>

              <div className="text-sm text-center font-semibold">
                <div className="text-textColor mb-6">Resolved</div>
                <input
                  type="checkbox"
                  className="scale-[2] cursor-pointer"
                  checked={el.isResolved}
                  onChange={() => handleCheckboxChange(el.id)}
                />
              </div>
            </div>
          ))}

        {!disptueState &&
          ResolvedDisptued.map((el, i) => (
            <div key={i}>
              <div className="flex items-center justify-center sm:justify-around flex-col sm:flex-row gap-5 border-b border-textColor/50 pb-8">
                <div className="flex justify-center">
                  <DisputeCard
                    title={el.ClinetName}
                    role="Client"
                    image={imageLink}
                    contactLink="#"
                  />
                </div>

                <div className="flex justify-center">
                  <DisputeCard
                    title={el.FreelancerName}
                    role="Freelancer"
                    image={imageLink}
                    contactLink="#"
                  />
                </div>

                <div className="text-sm text-center font-semibold">
                  <div className="text-textColor mb-6">Resolved</div>
                  <input
                    type="checkbox"
                    className="scale-[2]"
                    checked={el.isResolved}
                    onChange={() => handleCheckboxChange(el.id)}
                  />
                </div>
              </div>
            </div>
          ))}
      </motion.div>
    </div>
  );
}
