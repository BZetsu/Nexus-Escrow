"use client";

import Card from "@/components/Card";
import CardAccordion from "@/components/CardAccordion";
import CardAccordionAccept from "@/components/CardAccordionAccept";
import { getApplyEscrow } from "@/lib/NexusProgram/escrow/utils.ts/getApplyEscrow";
import { getEscrowInfo } from "@/lib/NexusProgram/escrow/utils.ts/getEscrowInfo";
import { get_userr_info } from "@/lib/NexusProgram/escrow/utils.ts/get_userr_info";
import { timeLeft } from "@/lib/utils/time_formatter";
import { inputStyle } from "@/lib/styles/styles";
import Coin from "@/public/coin.svg";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Button, IconButton, Modal, Stack, Switch } from "@mui/material";
import { web3 } from "@project-serum/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import linksvg from "@/public/linksvg.svg";
import ApproveModal from "@/components/ApproveModal";
import { FaEdit } from "react-icons/fa";

export default function page() {
  const [open, setOpen] = useState(false);
  const [escrowInfo, setEscrowInfo] = useState<any>();
  const [applys, setApplys] = useState<any[]>();
  const [showStartProject, setShowStartProject] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [openDispute, setOpenDispute] = useState(false);
  const [error, setError] = useState("");
  const [deadline, setDeadline] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  const anchorWallet = useAnchorWallet();
  // const wallet = useWallet();
  const { connection } = useConnection();
  // const router = useRouter()
  const pathname = usePathname();
  // const searchParams = useSearchParams()

  function handleOpenModal() {
    setOpen(true);
  }

  function handleCloseModal() {
    setOpen(false);
    const date = new Date(deadline);
    if (date.toDateString() !== "Invalid Date") {
      const epochTime = Math.floor(date.getTime() / 1000);
      setDeadline(timeLeft(epochTime));
    }
  }

  const getEscrowInfosss = async () => {
    try {
      // const address = searchParams.get("escrow");
      const address = pathname.replace("/escrow/myescrow/", "");
      const escrow = new web3.PublicKey(address);
      const info = await getEscrowInfo(anchorWallet, connection, escrow);
      info!.escrow = escrow;
      console.log("info");
      console.log(info, "info too");

      const freelancerInfo = await get_userr_info(
        anchorWallet,
        connection,
        info!.reciever
      );
      console.log(freelancerInfo);
      info!.freelancerInfo = freelancerInfo;
      // console.log(info);
      setEscrowInfo(info);
    } catch (e) {
      console.log(e);
    }
  };

  const getApplys = async () => {
    try {
      // const address = searchParams.get("escrow");
      const address = pathname.replace("/escrow/myescrow/", "");
      const escrow = new web3.PublicKey(address);
      const info = await getApplyEscrow(connection, escrow, "confirmed");
      console.log("apply");
      console.log(info);
      setApplys(info);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!anchorWallet) return;
    getEscrowInfosss();
    getApplys();
  }, [anchorWallet]);

  const filter = () => {
    console.log(applys![0].pubkey.toBase58());
    // console.log(escrowInfo.reciever.toBase58());
    const wddd = applys?.filter(
      (ap: any) => ap.pubkey.toBase58() == escrowInfo.reciever.toBase58()
    );
    console.log(wddd);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  function handleTitleEdit() {
    if (isEditing) {
      if (titleInput.trim() === "") {
        setError("Title cannot be empty");
      } else {
        setError("");
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  }

  function handleCancelProjectTermination() {
    setShowTerminate(false);
    setShowReject(false);
  }

  function handleShowStartProject() {
    setShowStartProject(true);
  }

  function handleShowApprove() {
    setShowApprove(true);
  }

  function handleShowReject() {
    setShowReject(true);
    setShowTerminate(false);
  }

  function handleCloseReject() {
    setShowReject(false);
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  function handleDescriptionEdit() {
    if (isDescriptionEditing) {
      if (descriptionInput.trim() === "") {
        setError("Description cannot be empty");
      } else {
        setError("");
        setIsDescriptionEditing(false);
      }
    } else {
      setIsDescriptionEditing(true);
    }
  }

  useEffect(() => {
    if (isDescriptionEditing && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isDescriptionEditing]);

  useEffect(() => {
    if (escrowInfo) {
      setTitleInput(escrowInfo.contractName || "Build a team dashboard");
      setDescriptionInput(escrowInfo.description || "No description available");
      setDeadline(timeLeft(escrowInfo.deadline));
    }
  }, [escrowInfo]);

  function handleOpenDispute() {
    setShowTerminate(false);
    setShowApprove(false);
    setOpenDispute(true);
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto pt-4">
        <div className="flex items-center gap-3">
          <Card width="lg">
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack flexDirection="row" alignItems="start" gap={1}>
                {isEditing ? (
                  <input
                    type="text"
                    ref={inputRef}
                    className="text-base line-clamp-1 sm:text-2xl font-semibold font-myanmarButton h-6 border-0 focus:outline-none"
                    placeholder="Eg. Enter a new title"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                  />
                ) : (
                  <div className="text-base line-clamp-1 sm:text-2xl font-semibold font-myanmarButton">
                    {titleInput}
                  </div>
                )}

                <button onClick={handleTitleEdit}>
                  <FaEdit
                    className="text-xl text-textColor pt-[2px]"
                    style={{ display: "unset" }}
                  />
                </button>
              </Stack>
              <Stack flexDirection="row" alignItems="start" gap={1}>
                <Image src={Coin} alt="coin" className="w-5 pt-[2px]" />
                <div className="text-sm sm:text-xl font-semibold leading-none ">
                  {escrowInfo ? Number(escrowInfo.amount) : "--"}
                </div>
              </Stack>
            </Stack>
          </Card>

          <div className="bg-white rounded-xl p-5 h-full hidden sm:block">
            <Image src={linksvg} alt="" className="w-[30px] py-[3px]" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Card className="col-span-1 md:col-span-3" width="lg">
            <div className="flex justify-between items-center w-full">
              <div className="text-xs sm:text-sm text-textColor">
                Description
              </div>
              <button onClick={handleDescriptionEdit}>
                <FaEdit className="text-lg text-textColor" />
              </button>
            </div>
            <div className="text-xs sm:text-sm mt-3 leading-7 min-h-24 px-5 py-2">
              {isDescriptionEditing ? (
                <input
                  type="text"
                  ref={descriptionInputRef}
                  className="text-base line-clamp-1 sm:text-sm font-semibold font-myanmarButton h-6 border-0 focus:outline-none"
                  placeholder="Enter a new description"
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                />
              ) : (
                <div>{descriptionInput}</div>
              )}
            </div>
          </Card>

          <Card className="col-span-1">
            <Stack
              flexDirection="row"
              gap={1}
              className="text-sm"
              alignItems="center"
            >
              <div>Public</div>
              <Switch className="-mt-[6px]" />
              <div>Private</div>
            </Stack>

            <Stack mt={4} spacing={2}>
              <div className="text-xs text-textColor">Deadline</div>
              <Stack flexDirection="row" gap={1} alignItems="center">
                <div
                  onClick={() => filter()}
                  className="text-lg font-[500] line-clamp-1"
                >
                  {deadline}
                </div>
                <IconButton onClick={handleOpenModal}>
                  <EditOutlinedIcon className="text-textColor -mt-2  text-base" />
                </IconButton>
              </Stack>
            </Stack>
          </Card>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <Stack spacing={2}>
            {escrowInfo && applys && (
              <CardAccordionAccept
                data={
                  escrowInfo.reciever
                    ? applys?.filter(
                        (ap: any) =>
                          ap.user.toBase58() == escrowInfo.reciever.toBase58()
                      )
                    : []
                }
                title="Approved Contractor"
                type="Chat"
                escrowInfo={escrowInfo}
                showTerminate={showTerminate}
                showApprove={handleShowApprove}
                reject={showReject}
                openDispute={openDispute}
                cancel={handleCancelProjectTermination}
              >
                <Stack flexDirection="row" gap={1}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      // setShowTerminate(true);
                      setShowReject(false);
                      setOpenDispute(false);
                    }}
                    className="!text-xs !bg-white !font-semibold !normal-case !text-second !px-4 !py-2"
                  >
                    Terminate
                  </Button>
                </Stack>
              </CardAccordionAccept>
            )}

            {/* {showStartProject && (
              <CardAnimation>
                <Stack
                  flexDirection="row"
                  justifyContent="center"
                  gap={2}
                  mt={1}
                >
                  <Button
                    variant="contained"
                    className="!text-xs !px-5 !font-semibold !py-2 !bg-main !text-second !normal-case"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    className="!text-xs !px-5 !font-semibold !py-2 !bg-main !text-second !normal-case"
                    onClick={() => {
                      setShowStartProject(false);
                      setShowTerminate(true);
                    }}
                  >
                    Reject
                  </Button>
                </Stack>
              </CardAnimation>
            )}
            {showTerminate && (
              <CardAnimation>
                <Stack
                  flexDirection="row"
                  justifyContent="center"
                  gap={2}
                  mt={1}
                >
                  <Button
                    variant="contained"
                    onClick={() => setOpen(true)}
                    className="!text-xs !px-5 !font-semibold !py-2 !bg-main !text-second !normal-case"
                  >
                    Request new submissin
                  </Button>
                  <Button
                    variant="contained"
                    className="!text-xs !px-5 !font-semibold !py-2 !bg-main !text-second !normal-case"
                    onClick={() => {
                      setShowTerminate(false);
                      setShowRefund(true);
                    }}
                  >
                    Dispute and Request refund
                  </Button>
                </Stack>
              </CardAnimation>
            )}

            {showRefund && (
              <CardAnimation>
                <div className="text-xs text-black font-[200]">
                  Your dispute has been resolved, and refund completed, please
                  terminate the project
                </div>
              </CardAnimation>
            )} */}
          </Stack>
          {applys && escrowInfo && (
            <CardAccordion
              title="Applications"
              data={
                escrowInfo.reciever
                  ? applys?.filter(
                      (ap: any) =>
                        ap.user.toBase58() !== escrowInfo.reciever.toBase58()
                    )
                  : applys
              }
              startProject={handleShowStartProject}
              type="Approve"
              page={"approve"}
              link={"approve"}
            />
          )}
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleCloseModal}
        className="grid place-items-center"
      >
        <Card className="text-center text-lg p-10">
          <div>Active Deadline</div>
          <div className="mt-6 text-3xl font-[500]">
            {escrowInfo ? deadline : "2d 24hrs 30min"}
          </div>
          <input
            className={`${inputStyle} mx-auto mt-8 w-[80%]`}
            type="datetime-local"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
            }}
          />

          <Stack alignItems="center" mt={5}>
            <Button
              variant="contained"
              className="!text-second !text-xs sm:!text-sm !bg-main !normal-case !px-10 !py-2"
              onClick={handleCloseModal}
            >
              Done
            </Button>
          </Stack>
        </Card>
      </Modal>

      <Modal
        open={showStartProject}
        onClose={() => setShowStartProject(false)}
        className="grid place-items-center"
      >
        <ApproveModal
          title="Confirmation"
          messageTitle="Are you sure to start the contract??"
          messageDescription="Contract can oly be terminated by both parties mutually agreeing to do so"
        >
          <Button
            variant="contained"
            className="!normal-case !text-black !text-sm !bg-green-500 !px-8 !py-2"
          >
            Start Contract
          </Button>
        </ApproveModal>
      </Modal>

      <Modal
        open={showApprove}
        onClose={() => setShowApprove(false)}
        className="grid place-items-center"
      >
        <ApproveModal
          title="Dispute Request"
          messageTitle="Are you sure you want tot request a dispute??"
          messageDescription={
            <>
              There is an ongoing dispute on this contract, please use the link below to chat with a moderator
            </>
          }
        >
          <Button
            variant="contained"
            onClick={handleOpenDispute}
            className="!normal-case !text-white !text-xs !bg-black !px-16 !py-2"
          >
            Open dispute
          </Button>
        </ApproveModal>
      </Modal>
    </div>
  );
}
