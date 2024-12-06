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
import React, { useEffect, useRef, useState, Suspense } from "react";
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
import { useEscrowCache } from "@/lib/hooks/useEscrowCache";
import { USER_PREFIX } from "@/lib/constants/constants";
import CountdownTimer from "@/components/CountdownTimer";
const idl = require("@/data/nexus.json");

interface EscrowResponse {
  data: {
    description: string;
    telegramLink: string;
    private: boolean;
  }
}

interface FreelancerResponse {
  data: Array<{
    userId: string;
    address: string;
    name: string;
  }>;
}

// Add loading component
const LoadingState = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
    <div className="h-24 bg-gray-200 rounded-md"></div>
  </div>
);

// Add this component at the top level of the file
const RedirectToEscrow = ({ contractAddress }: { contractAddress: string }) => {
  const router = useRouter();
  
  useEffect(() => {
    router.push(`/escrow/${contractAddress}`);
  }, [contractAddress, router]);

  return <LoadingState />;
};

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
  const [showShareModal, setShowShareModal] = useState(false);

  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const wallet = useWallet();
  const pathname = usePathname();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const checkAccess = async () => {
    if (!anchorWallet) {
      console.log("No wallet connected");
      return false;
    }

    try {
      const address = pathname.replace("/escrow/myescrow/", "");
      
      if (!address) {
        console.error('Invalid escrow address');
        return false;
      }

      const escrow = new web3.PublicKey(address);
      const info = await getEscrowInfo(anchorWallet, connection, escrow);
      
      if (!info) {
        console.error('Invalid escrow info');
        return false;
      }

      // Try both direct wallet comparison and PDA comparison
      const PROGRAM_ID = new web3.PublicKey(idl.metadata.address);
      const [expectedFounder] = web3.PublicKey.findProgramAddressSync(
        [anchorWallet.publicKey.toBuffer(), Buffer.from(USER_PREFIX)],
        PROGRAM_ID
      );

      const isFounderByPDA = info.founder.equals(expectedFounder);
      const isFounderByWallet = info.founder.equals(anchorWallet.publicKey);

      console.log("Comprehensive Access Check:", {
        connectedWallet: anchorWallet.publicKey.toBase58(),
        escrowFounder: info.founder.toBase58(),
        calculatedFounderPDA: expectedFounder.toBase58(),
        isFounderByPDA,
        isFounderByWallet,
        escrowInfo: info
      });

      // Allow access if either check passes
      return isFounderByPDA || isFounderByWallet;

    } catch (e: any) {
      console.error('Access check failed:', e);
      console.error('Error details:', e.stack);
      return false;
    }
  };

  useEffect(() => {
    const verifyAccess = async () => {
      setIsLoading(true);
      const accessResult = await checkAccess();
      setHasAccess(accessResult);
      
      if (accessResult) {
        await Promise.all([
          getEscrowInfosss(),
          getApplys()
        ]);
      }
      setIsLoading(false);
    };
    
    verifyAccess();
  }, [anchorWallet, pathname, connection]);

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
      await getEscrowInfosss();
      setEscrowInfo((preEscrow: any) => ({...preEscrow, DeadLine: milliseconds / 1000}));
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
      
      console.log("Escrow Info:", info);
      
      info!.escrow = escrow;
      console.log("info");
      console.log(info, "info too");

      const databaseEscrowInfo = await backendApi.get(`/escrow/${address}`);
      console.log(databaseEscrowInfo);
      console.log("databaseEscrowInfo");
      setEscrowDateInfo((databaseEscrowInfo as any)!.data);

      const freelancerInfo = await get_userr_info(
        anchorWallet,
        connection,
        info!.reciever
      );
      console.log(freelancerInfo);
      info!.freelancerInfo = freelancerInfo;
      setEscrowInfo(info);
    } catch (e) {
      console.log("Error in getEscrowInfosss:", e);
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
      setTitleInput(escrowInfo.contractName || "Contract Title");
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
      notify_laoding("Updating Description...!")
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
      notify_success("Description Updated!");
      handleSaveDescription()
    } catch (e) {
      notify_delete();
      notify_error("Update Failed!");
      console.log(e);
    }
  }

  const privates = async (privat: boolean) => {
    try {
      notify_laoding("Switching Privacy...");
      const address = pathname.replace("/escrow/myescrow/", "");
      
      const currentEscrow = await backendApi.get<EscrowResponse>(`/escrow/${address}`);
      const currentData = currentEscrow.data;

      const apiResponse = await backendApi.patch(`escrow/update/${address}`,
        {
          deadline: Number(escrowInfo.deadline),
          description: currentData.description,
          telegramLink: currentData.telegramLink,
          private: privat
        }
      );
      
      setEscrowDateInfo((prevForm: any) => ({
        ...prevForm,
        private: privat,
      }));
      
      notify_delete();
      notify_success("Privacy Switched!");
    } catch (e) {
      notify_delete();
      notify_error("Switch Failed!");
      console.log(e);
    }
  };

  const approveSubmit = async () => {
    try {
      // Debug logs to see what we're working with
      console.log("Approval Debug:", {
        escrowInfo,
        freelancerInfo: escrowInfo?.freelancerInfo,
        applys,
        escrowDateInfo
      });

      // Get the current freelancer from applys array
      const currentFreelancer = escrowInfo?.reciever 
        ? applys?.find((ap: any) => ap.user.toBase58() === escrowInfo.reciever.toBase58())
        : null;

      console.log("Current Freelancer:", currentFreelancer);

      // Add validation checks with more specific error messages
      if (!escrowInfo) {
        notify_error("Missing escrow information!");
        return;
      }

      if (!escrowInfo.escrow) {
        notify_error("Invalid escrow address!");
        return;
      }

      if (!currentFreelancer || !currentFreelancer.user) {
        notify_error("No freelancer selected for this contract!");
        return;
      }

      // Get freelancer's wallet address from the database
      const freelancerResponse = await backendApi.get<FreelancerResponse>(`/nexus-user`);
      console.log("API Response:", freelancerResponse); // Debug log

      // Check if response exists and has the expected structure
      if (!freelancerResponse || !freelancerResponse.data) {
        notify_error("Failed to fetch freelancer data!");
        return;
      }

      const freelancerData = freelancerResponse.data.find(
        (user: any) => user.userId === currentFreelancer.user.toBase58()
      );

      if (!freelancerData || !freelancerData.address) {
        notify_error("Could not find freelancer's wallet address!");
        return;
      }

      notify_laoding("Approving Submission...");

      console.log("Payment Details:", {
        escrowAddress: escrowInfo.escrow.toBase58(),
        freelancerUserId: currentFreelancer.user.toBase58(),
        freelancerWalletAddress: freelancerData.address
      });

      const tx = await approvePayment(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
        new web3.PublicKey(freelancerData.address) // Use wallet address instead of userId
      );

      notify_delete();
      notify_success("Submission Approved!");
      setShowApproveSubmit(false);
      await getEscrowInfosss();
      await getApplys();
      window.location.reload();
    } catch (e: any) {
      console.error("Approval Error:", e);
      notify_delete();
      notify_error("Approval Failed: " + (e.message || "Unknown error"));
    }
  };

  const RejectSubmit = async () => {
    try {

      notify_laoding("Rejecting Submission...!");
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
      notify_success("Submission Rejected!")
      await getEscrowInfosss();
      await getApplys();
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  const OpenDispute = async () => {
    try {
      notify_laoding("Opening Dispute...!");
      const tx = await founderOpenDispute(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
        escrowInfo.reciever,
      );
      notify_delete();
      notify_success("Dispute Opened!");
      handleOpenDispute()
      await getEscrowInfosss();
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };
  
  const terminating = async () => {
    try {
      notify_laoding("Terminating Contract...!");
      const tx = await cancelEscrow(
        anchorWallet,
        connection,
        escrowInfo.escrow,
        wallet,
      );
      notify_delete();
      notify_success("Contract Terminated!");
      handleOpenDispute()
      await getEscrowInfosss();
      await getApplys();
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  const approve = async () => {
    try {
      notify_laoding("Starting Contract...!");
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
      notify_success("Contract Started!");
      setShowStartProject(false);
      await getEscrowInfosss();
      await getApplys();
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");   
      console.log(e);
    }
  };

  const address = pathname.replace("/escrow/myescrow/", "");
  const { data: cachedEscrowInfo, loading: escrowLoading } = useEscrowCache(
    address,
    anchorWallet,
    connection
  );

  useEffect(() => {
    if (cachedEscrowInfo) {
      setEscrowInfo(cachedEscrowInfo);
    }
  }, [cachedEscrowInfo]);

  const refreshAccordions = async () => {
    await Promise.all([
      getEscrowInfosss(),
      getApplys()
    ]);
  };

  const handleShare = async (type: 'link' | 'blinks') => {
    if (type === 'link') {
      const pageUrl = window.location.href;
      await navigator.clipboard.writeText(pageUrl);
      notify_success("Link copied to clipboard!");
    } else {
      // Handle Blinks generation here
      notify_worning("Blinks generation coming soon!");
    }
    setShowShareModal(false);
  };

  if (!anchorWallet || isLoading) {
    return <LoadingState />;
  }

  if (hasAccess === false) {
    const contractAddress = pathname.replace("/escrow/myescrow/", "");
    return <RedirectToEscrow contractAddress={contractAddress} />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <div>
        <div className="max-w-7xl mx-auto pt-4">
          <div className="flex items-center gap-3 w-full">
            <Card width="lg" className="flex-1 shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] sm:shadow-[0_4px_20px_0px_rgba(0,0,0,0.1)]">
              <Stack
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                className="w-full"
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
                      className="text-xl text-textColor pt-[2px] opacity-30"
                      style={{ display: "unset" }}
                    />
                  </button>
                </Stack>
                
                {/* USDC Amount - Adjusted position and weight */}
                <Stack flexDirection="row" gap={1} alignItems={"flex-start"}>
                  <Image src={Coin} alt="coin" className="w-5" />
                  <div className="font-myanmar_khyay text-sm sm:text-xl font-[600] sm:font-semibold leading-none mt-[2px]">
                    {escrowInfo ? Number(escrowInfo.amount) / 1000_000 : "--"}
                  </div>
                </Stack>
              </Stack>
            </Card>

            {/* Desktop share button - hide on mobile */}
            <div
              className="bg-white rounded-xl p-5 h-full hidden sm:block cursor-pointer"
              onClick={() => setShowShareModal(true)}
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
                {escrowInfo && escrowInfo.status !== 6 && escrowInfo.status !== 3 && escrowInfo.status !== 7 && (
                  <button onClick={handleDescriptionEdit}>
                    <FaEdit className="text-lg text-textColor opacity-30" />
                  </button>
                )}
              </div>
              <div 
                className={`text-xs sm:text-sm mt-3 leading-7 min-h-24 py-2 ${
                  (escrowInfo?.status === 6 || escrowInfo?.status === 3 || escrowInfo?.status === 7) 
                    ? 'cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors' 
                    : ''
                }`}
                onClick={() => {
                  if (escrowInfo?.status === 6 || escrowInfo?.status === 3 || escrowInfo?.status === 7) {
                    setIsDescriptionModalOpen(true);
                  }
                }}
              >
                {descriptionInput}
              </div>
            </Card>

            <Card className="col-span-1">
              {escrowInfo &&  escrowDateInfo && (
                <>
                  <Stack
                    flexDirection="row"
                    gap={1}
                    className="text-sm mb-6 items-center justify-between w-full"
                    alignItems="center"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`transition-colors ${!escrowDateInfo.private ? 'text-black font-semibold' : 'text-gray-500'}`}>
                        Public
                      </div>
                      <Switch
                        checked={escrowDateInfo.private}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          privates(e.target.checked)
                        }}
                        className="-mt-[6px]"
                        disabled={escrowInfo?.status === 6 || escrowInfo?.status === 3 || escrowInfo?.status === 7}
                      />
                      <div className={`transition-colors ${escrowDateInfo.private ? 'text-black font-semibold' : 'text-gray-500'}`}>
                        Private
                      </div>
                    </div>
                    
                    {/* Mobile share button */}
                    <div
                      className="sm:hidden cursor-pointer flex items-center"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Image src={linksvg} alt="" className="w-[18px] h-[18px]" />
                    </div>
                  </Stack>

                  <div className="mt-auto pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2 flex items-center justify-between">
                      <span>Deadline</span>
                      {escrowInfo && escrowInfo.status !== 6 && escrowInfo.status !== 3 && escrowInfo.status !== 7 && (
                        <IconButton 
                          onClick={() => setOpen(true)}
                          className="-mr-2"
                        >
                          <EditOutlinedIcon className="text-textColor text-base opacity-30" />
                        </IconButton>
                      )}
                    </div>
                    <div className="flex items-center">
                      {escrowInfo && (escrowInfo.status === 6 || escrowInfo.status === 3 || escrowInfo.status === 7) ? (
                        <span className="text-gray-500">Contract Ended</span>
                      ) : (
                        <CountdownTimer deadline={escrowInfo.deadline} />
                      )}
                    </div>
                  </div>
                </>
              )}
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
                  refreshData={refreshAccordions}
                  cardHeight="h-[400px]"
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
                cardHeight="h-[400px]"
              />
            )}
          </div>
        </div>

        <Modal
          open={open}
          onClose={handleCloseModal}
          className="grid place-items-center"
        >
          <Card className="text-center text-lg p-10 w-[90%] max-w-[500px]">
            <div>Active Deadline</div>
            <div className="mt-6 text-3xl font-[500]">
              {escrowInfo ? deadline : "2d 24hrs 30min"}
            </div>
            <input
              className={`${inputStyle} mx-auto mt-8 w-full h-12 px-4 text-lg`}
              type="datetime-local"
              value={newdeadline}
              onChange={(e) => {
                setNewDeadline(e.target.value);
              }}
            />

            <Stack alignItems="center" mt={5}>
              <Button
                variant="contained"
                className="!text-second !text-xs sm:!text-sm !bg-main !normal-case !px-10 !py-3"
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
            showUSDC={true}
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
            messageTitle="Are you sure you want to reject this submission??"
            messageDescription=""
            showUSDC={true}
          >
            <Button
              onClick={() => RejectSubmit()}
              variant="contained"
              className="!normal-case !text-white !text-sm !bg-red-700 !px-8 !py-2"
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
            messageDescription="Contract can only be terminated by both parties mutually agreeing to do so"
            showUSDC={true}
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
          aria-describedby="view-description"
        >
          <div className="bg-white p-5 rounded-md w-[90%] md:w-[60rem] mx-auto mt-32 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 id="description-modal-title" className="text-xl font-semibold">
                Contract Description
              </h2>
              {escrowInfo && (escrowInfo.status === 6 || escrowInfo.status === 3 || escrowInfo.status === 7) && (
                <div className="text-sm text-gray-500">
                  Contract {escrowInfo.status === 7 ? 'Terminated' : 'Completed'}
                </div>
              )}
            </div>
            
            <div className="mt-3 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
              {descriptionInput}
            </div>

            {escrowInfo && (escrowInfo.status === 6 || escrowInfo.status === 3 || escrowInfo.status === 7) ? (
              <div className="flex justify-end mt-4">
                <Button variant="outlined" onClick={handleDescriptionModalClose}>
                  Close
                </Button>
              </div>
            ) : (
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
            )}
          </div>
        </Modal>

        <Modal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          className="grid place-items-center"
        >
          <Card className="w-[90%] max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Share Contract</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleShare('link')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Share link to this contract
              </button>
              
              <button
                onClick={() => handleShare('blinks')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Blinks
              </button>
            </div>
          </Card>
        </Modal>
      </div>
    </Suspense>
  );
}
