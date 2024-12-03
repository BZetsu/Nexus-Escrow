import CardAppAccept from "@/components/CardAppAccept";
import { approvePayment } from "@/lib/NexusProgram/escrow/ApprovePayment";
import { rejectFreelancerSubmit } from "@/lib/NexusProgram/escrow/rejectFreelancerSubmit";
import { Button, Stack } from "@mui/material";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { FaLock, FaUnlock } from "react-icons/fa6";
import Card from "./Card";
import CardAnimation from "./CardAnimation";
import { notify_delete, notify_error, notify_laoding, notify_success } from "@/app/loading";
import { founderOpenDispute } from "@/lib/NexusProgram/escrow/CopenDipute";
import { ClientTerminat } from "@/lib/NexusProgram/escrow/CTerminate";
import { RequestNewSubmition } from "@/lib/NexusProgram/escrow/RequestNewSubmition";
import { links } from "@/app/layout";
import ApproveModal from "./ApproveModal";

// Add Discord link constant at the top
const DISCORD_LINK = "https://discord.gg/VmgUWefjsZ";

export default function CardAccordionAccept({
  children,
  data,
  title,
  type,
  escrowInfo,
  showTerminate,
  cancel,
  showApprove,
  showReject,
  openDispute,
  closeReject,
  font_size = "text-base",
  escrowDateInfo,
  refreshData,
  cardHeight,
}: any) {
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showNewSubmissionModal, setShowNewSubmissionModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState(7); // Default 7 days

  const calculateNewDeadline = (days: number) => {
    return Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);
  };

  const approveSubmit = async () => {
    try {
      notify_laoding("Approving Submission...!");
      console.log(escrowInfo);
      console.log(data);
      console.log(escrowInfo.escrow.toBase58());
      console.log(escrowInfo.freelancerInfo.address.toBase58());

      const tx = await approvePayment(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
        escrowInfo.freelancerInfo.address
      );
      notify_delete();
      notify_success("Submission Approved!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  const RejectSubmit = async () => {
    try {
      notify_laoding("Rejecting Submission...!");
      const tx = await rejectFreelancerSubmit(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
        data[0].pubkey
      );
      notify_delete();
      notify_success("Submission Rejected!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  const Terminate = async () => {
    try {
      notify_laoding("Terminating Contract...!");
      const tx = await ClientTerminat(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
        data[0].pubkey
      );
      notify_delete();
      notify_success("Transaction Success!");
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  const handleOpenDispute = async () => {
    try {
      setShowDisputeModal(false);
      notify_laoding("Transaction Pending...!");
      const tx = await founderOpenDispute(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
        escrowInfo.reciever,
      );
      notify_delete();
      notify_success("Transaction Success!");
      if (refreshData) await refreshData();
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  const RequestNewSubmitions = async () => {
    try {
      setShowNewSubmissionModal(false);
      notify_laoding("Transaction Pending...!");
      
      const tx = await RequestNewSubmition(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
        data[0].pubkey
      );
      
      notify_delete();
      notify_success("Transaction Success!");
      if (refreshData) await refreshData();
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  console.log({ data });
  return (
    <div>
      <Card className="rounded-b-none border-b-2">
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          className="!py-0 flex items-center !px-3 h-4"
        >
          <div className={`${font_size} sm:text-base font-myanmar text-[#9c9595] font-semibold`}>
            {title}
          </div>
          <Stack flexDirection="row" gap={1}>
            {children}
          </Stack>
        </Stack>
      </Card>
      <Card className={`
        rounded-t-none 
        min-h-24 
        w-[99.5%] 
        mx-auto 
        !px-0 
        ${cardHeight}
        escrow 
        overflow-y-scroll
        shadow-[0_2px_8px_0px_rgba(0,0,0,0.06)]
      `}>
        <Stack spacing={2} className="escrow overflow-y-scroll px-5">
          {data.map((el: any, i: number) => (
            <CardAppAccept
              key={i} 
              title={el.userName}
              role={el.role}
              type={type}
              reject={RejectSubmit}
              approve={approveSubmit}
              escrow={el.escrow}
              apply={el.pubkey}
              chat={el.description}
              escrowInfo={escrowInfo}
              data={el}
            />
          ))}
        </Stack>

        <div className="px-5">
          {escrowInfo.status == 2 ? (
            <div className="w-full p-4 text-center rounded-lg border border-black/30 mt-9 text-xs ">
              Contract has started{" "}
              <span className="font-semibold">{`${data[0].userName}`}</span>{" "}
              will make submission when done
            </div>
          ) : (
            <div className="w-full p-4 text-center rounded-lg border border-black/30 mt-9 text-xs ">
              {
              escrowInfo.status == 4 ?
              "You rejected the submission, please click on terminate to Dispute and End the contract or Request New Submission"
              :
              (escrowInfo.status == 5 ?
              "You are on Dispute Phase Now"
              :
              (escrowInfo.status == 9 ?
                "Freelancer has made submission, please respond within the next 14 days or funds will be released to the contractor"
                :
                (escrowInfo.status == 3 ?
                  "You approved the submission, payment was made and contract terminated"
                  :
                  "Select Freelancer to start contract with"
                )
              )
            )
              }
            </div>
          )}

          <motion.button
            onClick={() =>  escrowInfo.telegramLink.length > 0 && links(escrowInfo.telegramLink)}
            disabled={(escrowInfo.telegramLink.length === 0)}
            className="w-full cursor-default mt-2 pt-2 pb-4 relative text-center text-base font-[500] rounded-lg disabled:opacity-25 mynamarButton"
            style={{
              boxShadow: "1px 1px 3px 1px rgba(0,0,0,0.3)",
              cursor: "pointer",
            }}
          >
            <div className="-mb-2" style={{ fontFamily: "mynamarButton" }}>
              View Submission
            </div>
            <div className="absolute right-3 top-[9px] text-xl">
              {
              (escrowDateInfo.submission !== null) ? 
              <FaUnlock />
              : 
              <FaLock /> 
              }
            </div>
          </motion.button>

          {escrowInfo?.status === 5 && (
            <div className="flex justify-center mt-4 mb-2">
              <Button
                onClick={() => window.open(DISCORD_LINK, '_blank')}
                variant="contained"
                size="small"
                className="!normal-case !text-xs !text-white !bg-black hover:!bg-gray-800 !min-w-[120px] !py-2 !px-6"
              >
                Resolve Dispute
              </Button>
            </div>
          )}

          {escrowInfo.status == 9 && (
            <CardAnimation className="grid grid-cols-2 mt-4 gap-2">
              <Button
                variant="contained"
                onClick={() => showApprove()}
                className="!normal-case !text-sm !py-3 !text-black !bg-green-500 !col-span-1 !rounded-md"
              >
                Approve
              </Button>

              <Button
                variant="contained"
                onClick={() => showReject()}
                className="!normal-case !text-sm !py-3 !bg-red-600 !text-white !col-span-1 !rounded-md"
              >
                Reject
              </Button>
            </CardAnimation>
          )}

          {showTerminate && (
            <>
            {escrowInfo.status == 2 && 
            <CardAnimation className="grid mt-4 gap-2">
              <Button
                variant="contained"
                onClick={() => Terminate()}
                className="!normal-case !text-xs !py-3 !text-white !bg-red-700 !col-span-1 !rounded-md"
              >
                Terminate Contract
              </Button>
            </CardAnimation>
              }

              {escrowInfo.status == 4 && 
            <CardAnimation className="grid grid-cols-2 mt-3 gap-2">
              <Button
                variant="contained"
                onClick={() => setShowDisputeModal(true)}
                className="!normal-case !text-xs !py-3 !bg-red-700 !text-white !col-span-1 !rounded-md"
              >
                Dispute and Request Refund
              </Button>
              <Button
                variant="contained"
                onClick={() => setShowNewSubmissionModal(true)}
                className="!normal-case !text-xs !py-3 !bg-green-500 !text-white !col-span-1 !rounded-md"
              >
                Request New Submission
              </Button>
              </CardAnimation>
              }
            </>
          )}
          {openDispute && (
            <CardAnimation>
              <Button
                variant="contained"
                className="!text-sm !mt-4 !w-full !text-white !bg-black !normal-case !px-10 !py-2"
              >
                Chat with Moderator
              </Button>
            </CardAnimation>
          )}
        </div>
      </Card>
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ApproveModal
            title="Confirmation"
            messageTitle="Are you sure you want to request dispute?"
            messageDescription="To prevent abuse, we charge a dispute resolution fees. Please try as much as possible to resolve your issue before opening a dispute"
            contractor={data[0]?.userName || "Contractor"}
            client="You"
            amount={escrowInfo?.amount ? (escrowInfo.amount / 1000_000) : 0}
          >
            <div className="flex gap-4">
              <Button
                variant="contained"
                onClick={() => handleOpenDispute()}
                className="!normal-case !bg-red-600 hover:!bg-red-700"
              >
                Confirm Dispute
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowDisputeModal(false)}
                className="!normal-case !border-gray-400 !text-gray-600"
              >
                Cancel
              </Button>
            </div>
          </ApproveModal>
        </div>
      )}
      {showNewSubmissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ApproveModal
            title="Request New Submission"
            messageTitle="Set New Deadline"
            messageDescription={
              <div className="space-y-4">
                <p>Please select the number of days for the new deadline:</p>
                <div className="flex justify-center gap-4">
                  {[3, 7, 14, 30].map((days) => (
                    <Button
                      key={days}
                      variant={newDeadline === days ? "contained" : "outlined"}
                      onClick={() => setNewDeadline(days)}
                      className={`!min-w-[60px] ${
                        newDeadline === days 
                          ? "!bg-second !text-white" 
                          : "!border-gray-300"
                      }`}
                    >
                      {days}d
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  New deadline will be set to {newDeadline} days from now
                </p>
              </div>
            }
            contractor={data[0]?.userName || "Contractor"}
            client="You"
            amount={escrowInfo?.amount ? (escrowInfo.amount / 1000_000) : 0}
          >
            <div className="flex gap-4">
              <Button
                variant="contained"
                onClick={() => RequestNewSubmitions()}
                className="!normal-case !bg-second hover:!bg-second/90"
              >
                Confirm New Deadline
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowNewSubmissionModal(false)}
                className="!normal-case !border-gray-400 !text-gray-600"
              >
                Cancel
              </Button>
            </div>
          </ApproveModal>
        </div>
      )}
    </div>
  );
}
