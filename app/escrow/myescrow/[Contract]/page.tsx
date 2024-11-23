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
import { backendApi } from "@/lib/utils/api.util";
import { notify_delete, notify_error, notify_laoding, notify_success, notify_worning } from "@/app/loading";
import { founderOpenDispute } from "@/lib/NexusProgram/escrow/CopenDipute";
import { approveFreelancer } from "@/lib/NexusProgram/escrow/approveFreelancer";
import { updateEscrow } from "@/lib/NexusProgram/escrow/update_escrow";
import { rejectFreelancerSubmit } from "@/lib/NexusProgram/escrow/rejectFreelancerSubmit";
import { approvePayment } from "@/lib/NexusProgram/escrow/ApprovePayment";
import { cancelEscrow } from "@/lib/NexusProgram/escrow/cancel_escrow";

export default function page() {
  const [open, setOpen] = useState(false);
  const [escrowInfo, setEscrowInfo] = useState<any>();
  const [escrowDateInfo, setEscrowDateInfo] = useState<any>();
  const [applys, setApplys] = useState<any[]>();
  const [showStartProject, setShowStartProject] = useState(false);
  const [showApproveSubmit, setShowApproveSubmit] = useState(false);
  const [showRejectSubmit, setShowRejectSubmit] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [openDispute, setOpenDispute] = useState(false);
  const [error, setError] = useState("");
  const [deadline, setDeadline] = useState("");
  const [newdeadline, setNewDeadline] = useState<any>();
  const [descriptionInput, setDescriptionInput] = useState("");
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [originalDescription, setOriginalDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [copied, setCopied] = useState(false);
  const [select, setSelect] = useState<any>()

  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const wallet = useWallet();
  const pathname = usePathname();

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

  const update_escrow = async () => {
    try {
      const address = pathname.replace("/escrow/myescrow/", "");
      const escrow = new web3.PublicKey(address);
      const now = Date.now();
      const date = new Date(newdeadline);
      const milliseconds = date.getTime();

      if (milliseconds <= now) {
        return notify_worning("Time Need to be more than the current time!");
      }
      notify_laoding("Transaction Pending...!")

      const tx = await updateEscrow(
        anchorWallet,
        connection,
        escrow,
        milliseconds / 1000,
        wallet
      );
      notify_delete();
      notify_success("Transaction Success!");
      handleCloseModal();
      setEscrowInfo((preEscrow: any) => ({...preEscrow, DeadLine: milliseconds / 1000}));
      // setForm((prevForm) => ({ ...prevForm, DeadLine: newdeadline / 1000 }));
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    }
  }  

  const getEscrowInfosss = async () => {
    try {
      const address = pathname.replace("/escrow/myescrow/", "");
      const escrow = new web3.PublicKey(address);
      const info = await getEscrowInfo(anchorWallet, connection, escrow);
      info!.escrow = escrow;
      console.log("info");
      console.log(info, "info too");

      const databaseEscrowInfo = await backendApi.get(`/escrow/${address}`);
      console.log(databaseEscrowInfo);
      console.log("databaseEscrowInfo");
      setEscrowDateInfo((databaseEscrowInfo as any)!.data);
        // if(!databaseEscrowInfo) {console.log('Do something')}

      const freelancerInfo = await get_userr_info(
        anchorWallet,
        connection,
        info!.reciever
      );
      console.log(freelancerInfo);
      info!.freelancerInfo = freelancerInfo;
      setEscrowInfo(info);
    } catch (e) {
      console.log(e);
    }
  };

  const getApplys = async () => {
    try {
      // notify_laoding("Transaction Pending...!");
      const address = pathname.replace("/escrow/myescrow/", "");
      const escrow = new web3.PublicKey(address);
      const info = await getApplyEscrow(connection, escrow, "confirmed");

      const data = await backendApi.get(`/freelancer?escrowAddress=${address}`);

      console.log("APPLYYYYYYYYYYYYYYYYYYYYYY");
      console.log(info);
      console.log("APPLYYYYYYYYYYYYYYYYYYYYYYDATAINFOOOOO");
      console.log(data);
      setApplys(info
        // .filter((apply) => apply.status !== "Rejected")
      );
      // notify_delete();
      // notify_success("Transaction Success!")
    } catch (e) {
      // notify_delete();
      // notify_error("Transaction Failed!");      
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

  function handleShowApproveSubmit() {
    setShowApproveSubmit(true);
  }

  function handleShowRejectSubmit() {
    setShowRejectSubmit(true);
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
    setIsDescriptionModalOpen(true);
  }

  function handleDescriptionModalClose() {
    if (descriptionInput.trim() === "") {
      setDescriptionError("Description cannot be empty");
    } else {
      setDescriptionError("");
      setIsDescriptionModalOpen(false);
      setIsDescriptionEditing(false);
      setOriginalDescription(descriptionInput);
    }
  }

  function handleSaveDescription() {
    if (descriptionInput.trim() === "") {
      setDescriptionError("Description cannot be empty");
    } else {
      setDescriptionError("");
      setIsDescriptionModalOpen(false);
      // Implement the save logic here (if needed)
      setOriginalDescription(descriptionInput);
    }
  }

  useEffect(() => {
    if (escrowInfo && escrowDateInfo) {
      setTitleInput(escrowInfo.contractName || "Build a team dashboard");
      setDescriptionInput(escrowDateInfo.description || "No description available");
      setOriginalDescription(
        escrowInfo.description || "No description available"
      );
      setDeadline(timeLeft(escrowInfo.deadline));
    }
  }, [escrowInfo]);

  function handleOpenDispute() {
    setShowTerminate(false);
    setShowApprove(false);
    setOpenDispute(true);
  }

  const copyToClipboard = () => {
    const pageUrl = window.location.href;

    navigator.clipboard
      .writeText(pageUrl)
      .then(() => {
        setCopied(true);

        // Hide the popup after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const updateDescription = async () => {
    try {
      notify_laoding("Transaction Pending...!")
      const address = pathname.replace("/escrow/myescrow/", "");
      console.log(escrowDateInfo)

      console.log(descriptionInput)

      const apiResponse = await backendApi.patch(`escrow/update/${address}`,
        {
          description: descriptionInput,
          deadline: Number(escrowInfo.deadline),
          telegramLink: "escrowInfo.telegramLink",
          private: escrowDateInfo.private
        }
      );
      console.log(apiResponse);
      notify_delete();
      notify_success("Transaction Success!");
      handleSaveDescription()
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    }
  }

  const privates = async (privat: boolean) => {
    try {
      notify_laoding("Transaction Pending...!")
      const address = pathname.replace("/escrow/myescrow/", "");
      console.log(escrowDateInfo)
      console.log(privat);
      
      const apiResponse = await backendApi.patch(`escrow/update/${address}`,
        {
          deadline: Number(escrowInfo.deadline),
          telegramLink: "escrowInfo.telegramLink",
          private: privat
        }
      );
      setEscrowDateInfo((prevForm:  any) => ({
          ...prevForm,
          private: privat,
        }))
      console.log(apiResponse);
      notify_delete();
      notify_success("Transaction Success!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    }
  }

  const approveSubmit = async () => {
    try {
      notify_laoding("Transaction Pending...!");
      console.log(escrowInfo);
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
      notify_success("Transaction Success!");
      setShowApproveSubmit(false);
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  const RejectSubmit = async () => {
    try {

      notify_laoding("Transaction Pending...!");
      const dataa = escrowInfo.reciever
      ? applys?.filter(
          (ap: any) =>
            ap.user.toBase58() == escrowInfo.reciever.toBase58()
        )
      : []
      
      const tx = await rejectFreelancerSubmit(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
        dataa![0].pubkey
      );
      notify_delete();
      notify_success("Transaction Success!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  const OpenDispute = async () => {
    try {
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
      handleOpenDispute()
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };
  
  const terminating = async () => {
    try {
      notify_laoding("Transaction Pending...!");
      const tx = await cancelEscrow(
        anchorWallet,
        connection,
        escrowInfo.escrow,
        wallet,
      );
      notify_delete();
      notify_success("Transaction Success!");
      handleOpenDispute()
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  const approve = async () => {
    try {
      notify_laoding("Transaction Pending...!");
      // console.log(escrow.toBase58());
      const apply = (applys!.filter((escrow: any) => escrow.pubkey.toBase58() == select.toBase58()))[0].pubkey;

      const tx = await approveFreelancer(
        anchorWallet,
        connection,
        wallet,
        apply,
        escrowInfo.escrow
      );
      notify_delete();
      notify_success("Transaction Success!");
      setShowStartProject(false);
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };


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
                    className="text-base line-clamp-1 sm:text-2xl !font-bold font-myanmarButton h-6 border-0 focus:outline-none"
                    placeholder="Eg. Enter a new title"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                  />
                ) : (
                  <div className="text-base line-clamp-1 sm:text-2xl !font-[700] font-myanmarButton">
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
                  {escrowInfo ? Number(escrowInfo.amount) / 1000_000 : "--"}
                </div>
              </Stack>
            </Stack>
          </Card>

          <div
            className="bg-white rounded-xl p-5 h-full hidden sm:block cursor-pointer"
            onClick={copyToClipboard}
          >
            <Image src={linksvg} alt="" className="w-[30px] py-[3px]" />
          </div>
          {copied && (
            <div className="absolute top-28 left-1/2 transform -translate-x-1/2 mt-2 px-4 py-2 bg-gray-300 text-white rounded">
              Copied!
            </div>
          )}
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
            <div className="text-xs sm:text-sm mt-3 leading-7 min-h-24 py-2">
              {isDescriptionEditing ? (
                <input
                  type="text"
                  ref={descriptionInput}
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
            {escrowInfo &&  escrowDateInfo && <Stack
              flexDirection="row"
              gap={1}
              className="text-sm"
              alignItems="center"
            >
              <div>Public</div>
              <Switch
              // onClick={() => privates()}
              checked={escrowDateInfo.private}
              onChange={(e) =>{
                console.log(e.target.checked);
                privates(e.target.checked)
                // setEscrowDateInfo((prevForm:  any) => ({
                //   ...prevForm,
                //   private: !e.target.checked,
                // }))
              }}
               className="-mt-[6px]" />
              <div>Private</div>
            </Stack>}

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
            {escrowInfo && escrowDateInfo && applys && (
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
                font_size="!text-sm"
                escrowInfo={escrowInfo}
                showTerminate={showTerminate}
                showApprove={handleShowApproveSubmit}
                showReject={handleShowRejectSubmit}
                openDispute={openDispute}
                cancel={handleCancelProjectTermination}
                escrowDateInfo={escrowDateInfo}
              >
                {escrowInfo && escrowInfo.status !== 5 && escrowInfo.status !== 3 && escrowInfo.status !== 6 && escrowInfo.status !== 1 && <Stack flexDirection="row" gap={1}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setShowTerminate(true);
                      setShowReject(false);
                      setOpenDispute(false);
                    }}
                    className="!text-xs !bg-white !font-semibold !normal-case !text-second !px-4 !py-2"
                  >
                    Terminate
                  </Button>
                </Stack>}
                {escrowInfo && escrowInfo.status == 1 && <Stack flexDirection="row" gap={1}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      terminating()
                    }}
                    className="!text-xs !bg-white !font-semibold !normal-case !text-second !px-4 !py-2"
                  >
                    Terminate
                  </Button>
                </Stack>}
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
                  : applys.filter((apply) => apply.status !== "Rejected")
              }
              startProject={handleShowStartProject}
              setSelect={setSelect}
              approve={approve}
              type="Chat"
              page={"approve"}
              link={"approve"}
              font_size="!text-sm"
              padding="!pt-[0.2rem]"
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
            value={newdeadline}
            onChange={(e) => {
              setNewDeadline(e.target.value);
            }}
          />

          <Stack alignItems="center" mt={5}>
            <Button
              variant="contained"
              className="!text-second !text-xs sm:!text-sm !bg-main !normal-case !px-10 !py-2"
              onClick={() => update_escrow()}
            >
              Done
            </Button>
          </Stack>
        </Card>
      </Modal>

      {applys && applys.length > 0 && escrowInfo && escrowInfo.reciever && <Modal
        open={showApproveSubmit}
        onClose={() => setShowApproveSubmit(false)}
        className="grid place-items-center"
      >
        <ApproveModal
          contractor={applys?.filter(
                (ap: any) =>
                  ap.user.toBase58() === escrowInfo.reciever.toBase58()
              )[0].userName
            }
          amount={Number(escrowInfo.amount) / 1000_000}
          title="Confirmation"
          messageTitle="Are you sure you want to approve submission??"
          messageDescription="Money will be released to the contractor and Contract will be Terminated!"
        >
          <Button
            onClick={() => approveSubmit()}
            variant="contained"
            className="!normal-case !text-black !text-sm !bg-green-500 !px-8 !py-2"
          >
            Approve
          </Button>
        </ApproveModal>
      </Modal>}

    {/* this is for the Reject popUP */}
      {applys && applys.length > 0 && escrowInfo && escrowInfo.reciever && <Modal
        open={showRejectSubmit}
        onClose={() => setShowRejectSubmit(false)}
        className="grid place-items-center"
      >
        <ApproveModal
          contractor={applys?.filter(
                (ap: any) =>
                  ap.user.toBase58() === escrowInfo.reciever.toBase58()
              )[0].userName
            }
          amount={Number(escrowInfo.amount) / 1000_000}
          title="Confirmation"
          messageTitle="Are you sure you want to reject submission??"
          messageDescription=""
        >
          <Button
            onClick={() => RejectSubmit()}
            variant="contained"
            className="!normal-case !text-black !text-sm !bg-red-700 !px-8 !py-2"
          >
            Reject
          </Button>
        </ApproveModal>
      </Modal>}
      
      {applys && select && escrowInfo && <Modal
        open={showStartProject}
        onClose={() => setShowStartProject(false)}
        className="grid place-items-center"
      >
        <ApproveModal
          contractor={(applys.filter((escrow: any) => escrow.pubkey.toBase58() == select.toBase58()))[0].userName}
          amount={Number(escrowInfo.amount) / 1000_000}
          title="Confirmation"
          messageTitle="Are you sure to start the contract??"
          messageDescription="Contract can oly be terminated by both parties mutually agreeing to do so"
        >
          <Button
            onClick={() => approve()}
            variant="contained"
            className="!normal-case !text-black !text-sm !bg-green-500 !px-8 !py-2"
          >
            Start Contract
          </Button>
        </ApproveModal>
      </Modal>}

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
              To prevent abuse, we charge a dispute resolution fee.
              <br />
              Please try as much as pussible to resolve your issues before
              opening a dispute.
            </>
          }
        >
          <Button
            variant="contained"
            onClick={() => OpenDispute()}
            // onClick={handleOpenDispute}
            className="!normal-case !text-white !text-xs !bg-black !px-16 !py-2"
          >
            Open dispute
          </Button>
        </ApproveModal>
      </Modal>

      <Modal
        open={isDescriptionModalOpen}
        onClose={handleDescriptionModalClose}
        aria-labelledby="description-modal"
        aria-describedby="edit-description"
      >
        <div className="bg-white p-5 rounded-md w-[90%] md:w-[60rem]  mx-auto mt-32 max-h-[70vh] overflow-y-auto">
          <h2 id="description-modal-title" className="text-xl font-semibold">
            Edit Description
          </h2>
          <textarea
            className="w-full h-[50rem] mt-3 p-2 border rounded-md focus:outline-none"
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
          />
          {descriptionError && (
            <p className="text-red-500 mt-2">{descriptionError}</p>
          )}
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="contained"
              onClick={() => updateDescription()}
              disabled={descriptionInput === originalDescription}
            >
              Save
            </Button>
            <Button variant="outlined" onClick={handleDescriptionModalClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
