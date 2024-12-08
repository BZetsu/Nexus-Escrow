"use client";

import { notify_delete, notify_error, notify_laoding, notify_success } from "@/app/loading";
import Card from "@/components/Card";
import { fTarminat } from "@/lib/NexusProgram/escrow/Fterminat";
import { openDispute } from "@/lib/NexusProgram/escrow/FopenDipute";
import { submit } from "@/lib/NexusProgram/escrow/submit";
import { getEscrowInfo } from "@/lib/NexusProgram/escrow/utils.ts/getEscrowInfo";
import { get_userr_info } from "@/lib/NexusProgram/escrow/utils.ts/get_userr_info";
import coin from "@/public/coin.svg";
import dragon from "@/public/Image.jpg";
import XIcon from "@mui/icons-material/X";
import { Button, Container, Modal, Stack } from "@mui/material";
import { web3 } from "@project-serum/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CiFileOn } from "react-icons/ci";
import { closeApply } from "@/lib/NexusProgram/escrow/FreelancercloseApply";
import { get_apply_info } from "@/lib/NexusProgram/escrow/utils.ts/get_apply_info";
import { timeLeft } from "@/lib/utils/time_formatter";
import { backendApi } from "@/lib/utils/api.util";
import ApproveModal from "@/components/ApproveModal";
import { IoMdClose } from "react-icons/io";
import { MdVerified } from "react-icons/md";
import CountdownTimer from "@/components/CountdownTimer";
import { inputStyle } from "@/lib/styles/styles";

interface EscrowData {
  data: Array<{
    contactName: string;
    deadline: number;
    amount: string;
    telegramLink: string;
    materials: string;
    description: string;
    escrowAddress: string;
  }>
}

interface FounderResponse {
  data: Array<{
    image: string;
    name: string;
    twitter: string;
    address: string;
    userId: string;
  }>
}

// Add Discord link constant at the top of the file
const DISCORD_LINK = "https://discord.gg/VmgUWefjsZ";

export default function page() {
  const [material, setMaterial] = useState<string>("");
  const [deadline, setDeadline] = useState<any>();
  const [escrow_info, setEscrowInfo] = useState<any>();
  const [escrow_info_data, setEscrowInfoData] = useState<any>();
  const [applyInfo, setApplyInfo] = useState<any>();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const [showDispute, setShowDispute] = useState(false);

  function handleShowDispute() {
    setShowDispute(true);
  }

  function handleCloseModal() {
    setOpen(false);
  }

  function handleOpenModal() {
    setOpen(true);
  }

  const [showSubmission, setShowSubmission] = useState(false);

  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  const [userData, setUserData] = useState<any>(null);

  const getUserData = async (userId: string) => {
    try {
      const response = await backendApi.get<{
        data: Array<{
          userId: string;
          name: string;
          image: string;
          twitter?: string;
          isVerified?: boolean;
        }>;
      }>('/nexus-user');

      if (response?.data) {
        // Find user by userId (which is the founder's address)
        const userData = response.data.find(user => 
          user.userId === escrow_info?.founder?.toBase58()
        );

        if (userData) {
          setUserData({
            ...userData,
            image: userData.image || dragon.src,
            twitter: userData.twitter || '',
            isVerified: userData.isVerified || false
          });
        }
      }
    } catch (e) {
      console.error('Error fetching user data:', e);
    }
  };

  const getApply = async () => {
    try {
      const PROGRAM_ID = new web3.PublicKey(
        "3GKGywaDKPQ6LKXgrEvBxLAdw6Tt8PvGibbBREKhYDfD"
      );

      const address = pathname.replace("/escrow/ongoing/", "");
      const escrow = new web3.PublicKey(address);

      const [apply] = web3.PublicKey.findProgramAddressSync(
        [anchorWallet!.publicKey.toBuffer(), escrow.toBuffer()],
        PROGRAM_ID
      );

      const applyinfos = await get_apply_info(anchorWallet, connection, apply);
      console.log("applyinfos")
      console.log(applyinfos)
      setApplyInfo(applyinfos);

    } catch(e) {
      console.log(e);
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submission = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      notify_laoding("Making Submission...");

      const address = pathname.replace("/escrow/ongoing/", "");
      const escrow = new web3.PublicKey(address);
      console.log(material)
      const tx = await submit(anchorWallet, connection, wallet, escrow, material);
      notify_delete();
      notify_success("Submitted Successfully!");
      
      // Add refresh
      await Promise.all([
        getEscrowInfos(),
        getApply()
      ]);

    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const [isDisputing, setIsDisputing] = useState(false);

  const Tarminat = async () => {
    if (isDisputing) return;
    
    try {
      setIsDisputing(true);
      notify_laoding("Terminating Contract...");

      const address = pathname.replace("/escrow/ongoing/", "");
      const escrow = new web3.PublicKey(address);

      const tx = await fTarminat(anchorWallet, connection, wallet, escrow);
      notify_delete();
      notify_success("Contract Terminated Successfully!");

      // Add refresh
      await Promise.all([
        getEscrowInfos(),
        getApply()
      ]);

    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    } finally {
      setIsDisputing(false);
    }
  };

  const [isTerminating, setIsTerminating] = useState(false);

  const Dispute = async () => {
    if (isTerminating) return;
    
    try {
      notify_laoding("Opening Dispute...")!;
      const address = pathname.replace("/escrow/ongoing/", "");
      const escrow = new web3.PublicKey(address);

      const tx = await openDispute(anchorWallet, connection, wallet, escrow);
      notify_delete();
      notify_success("Dispute Opened!");

      // Add refresh
      await Promise.all([
        getEscrowInfos(),
        getApply()
      ]);

    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    } finally {
      setIsTerminating(false);
    }
  };

  const getEscrowInfos = async () => {
    try {
      const address = pathname.replace("/escrow/ongoing/", "");
      const escrow = new web3.PublicKey(address);
      const info = await getEscrowInfo(anchorWallet, connection, escrow);
      
      if (!info || !info.founder) {
        console.log("No escrow info or founder found");
        return;
      }

      // Get escrow data - handle 404 gracefully
      let telegramContact = '';
      try {
        const databaseEscrowInfo = await backendApi.get<EscrowData>(`/escrow/${address}`);
        console.log("Raw Database Response:", databaseEscrowInfo);
        
        if (databaseEscrowInfo?.data) {
          // If data is an array, get first item
          const escrowData = Array.isArray(databaseEscrowInfo.data) 
            ? databaseEscrowInfo.data[0] 
            : databaseEscrowInfo.data;
            
          console.log("Escrow Data to use:", escrowData);
          setEscrowInfoData(escrowData);
        }
      } catch (err) {
        console.log("Error fetching escrow data:", err);
        // Try alternate endpoint if first one fails
        try {
          const allEscrows = await backendApi.get<EscrowData>(`/escrow`);
          const thisEscrow = allEscrows?.data?.find((e: any) => e.escrowAddress === address);
          if (thisEscrow) {
            setEscrowInfoData(thisEscrow);
          }
        } catch (e) {
          console.log("Error fetching from alternate endpoint:", e);
        }
      }

      // Get founder info from blockchain
      const founder_info = await get_userr_info(
        anchorWallet,
        connection,
        info.founder
      );

      // Set founder info even if database lookup fails
      info.founderInfo = {
        ...founder_info,
        image: dragon.src, // Fallback to dragon image
        telegramId: telegramContact,
        name: founder_info?.name || "Unknown",
        twitter: ''
      };

      // Try to get additional founder info from database
      try {
        const founderResponse = await backendApi.get<FounderResponse>(`/nexus-user`);
        if (founderResponse?.data?.length > 0) {
          const founderData = founderResponse.data.find(
            user => user.userId === info.founder.toBase58()
          );
          
          if (founderData) {
            info.founderInfo = {
              ...info.founderInfo,
              image: founderData.image && !founderData.image.includes('youtube.com')
                ? founderData.image 
                : dragon.src,
              name: founderData.name || info.founderInfo.name,
              twitter: founderData.twitter || ''
            };
          }
        }
      } catch (err) {
        console.log("Error fetching founder data:", err);
      }

      setEscrowInfo(info);
    } catch (e) {
      console.log("Error in getEscrowInfos:", e);
    }
  };

  const cancel_apply = async () => {
    try {
      notify_laoding("Cancelling Application...")
      console.log(pathname);
      const address = pathname.replace("/escrow/ongoing/", "");
      const escrow = new web3.PublicKey(address);
      const tx = await closeApply(
        anchorWallet,
        connection,
        wallet,
        escrow,
      );
      notify_delete();
      notify_success("Application Cancelled!")

      // Add refresh
      await Promise.all([
        getEscrowInfos(),
        getApply()
      ]);

    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    }
  };

  useEffect(() => {
    if (!anchorWallet) return;
    getEscrowInfos();
    getApply();
  }, [anchorWallet]);

  useEffect(() => {
    if (escrow_info?.founderInfo?.userId) {
      getUserData(escrow_info.founderInfo.userId);
    }
  }, [escrow_info]);

  useEffect(() => {
    if (escrow_info) {
      setDeadline(timeLeft(escrow_info.deadline));
    }
  }, [escrow_info]);

  useEffect(() => {
    if (escrow_info) {
      console.log("Escrow Info Materials:", {
        materials: escrow_info.materials,
        status: escrow_info.status
      });
    }
  }, [escrow_info]);

  useEffect(() => {
    if (escrow_info) {
      console.log("Debug Materials:", {
        escrow_info_materials: escrow_info.materials,
        escrow_info_data_materials: escrow_info_data?.materials,
        status: escrow_info.status,
        full_escrow: escrow_info
      });
    }
  }, [escrow_info, escrow_info_data]);

  const links = (link: string) => {
    window.open(link, "_blank");
  };

  const getStatusText = (status: number) => {
    if (status === 0) {
      return <span className="italic">Pending...</span>;
    }
    // ... rest of status checks
  };

  const [showDescription, setShowDescription] = useState(false);

  // Add this effect to handle automatic privacy switch
  useEffect(() => {
    const handlePrivacyOnContractStart = async () => {
      if (escrow_info && escrow_info.status === 2 && !escrow_info?.private) {
        try {
          const address = pathname.replace("/escrow/ongoing/", "");
          await backendApi.patch(`escrow/update/${address}`, {
            deadline: Number(escrow_info.deadline),
            telegramLink: escrow_info.telegramLink || "",
            private: true,
            description: escrow_info_data?.description || ""
          });
          
          // Update local state
          setEscrowInfo((prev: any) => ({
            ...prev,
            private: true
          }));
        } catch (error) {
          console.error("Failed to update privacy:", error);
        }
      }
    };

    handlePrivacyOnContractStart();
  }, [escrow_info?.status]);

  // Add this helper function at the component level
  const isPendingApplication = (escrowInfo: any, applyInfo: any) => {
    return applyInfo && !escrowInfo?.reciever;
  };

  return (
    <div>
      <div className="max-w-5xl mx-auto mb-28">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-8">
          <Card className="!py-4 !col-span-1 sm:!col-span-3 !px-4" width="lg">
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              className="text-base sm:text-xl font-[600] h-12"
            >
              {escrow_info && <div className="flex-1 font-myanmar_khyay">
                {escrow_info.contractName}
              </div>}

              <Stack flexDirection="row" gap={1} alignItems={"flex-start"}>
                <Image src={coin} alt="coin" className="w-5" />
                <div className="font-myanmar_khyay">
                  {escrow_info ? Number(escrow_info.amount) / 1000_000 : "--"}
                </div>
              </Stack>
            </Stack>
          </Card>

     {escrow_info && deadline && <Card className="!py-4 !px-4 col-span-1 sm:max-w-72 grid place-items-center">
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                gap={2}
              >
                <div className="flex items-center gap-2">
                  <div className="text-black font-semibold">
                    Private
                  </div>
                  <div className="w-2 h-2 rounded-full bg-red-500 -translate-y-0.5" />
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="text-xs text-textColor font-myanmar">
                    Deadline
                  </div>
                  <div className="text-base font-semibold line-clamp-1 font-myanmar">
                    <CountdownTimer deadline={escrow_info.deadline} />
                  </div>
                </div>
              </Stack>
            </Card>
          }
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-4 px-0">
          <Card className="!p-0 col-span-1 sm:col-span-2 overflow-hidden h-[457px] w-full">
            <div className="p-2">
              <Image
                src={escrow_info?.founderInfo?.image || dragon.src}
                alt={escrow_info?.founderInfo?.name || "Profile"}
                width={500}
                height={500}
                className="w-full h-[150px] [@media(min-width:500px)]:h-[200px] sm:h-[180px] rounded-xl object-cover object-center mt-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = dragon.src;
                }}
              />
            </div>

            <Stack pt={2} spacing={2} px={4} className="flex-1 flex flex-col">
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                className="w-full py-1"
              >
                <div className="border border-gray-200 rounded-xl px-3 sm:px-6 py-2 sm:py-3 flex flex-col w-full min-h-[4rem]">
                  <span className="text-[10px] sm:text-xs text-gray-500 mb-1">Contract Creator</span>
                  <div className="flex items-center justify-between">
                    <div className="text-lg sm:text-xl md:text-2xl font-[600] font-myanmarButton">
                      {escrow_info?.founderInfo?.name || "--"}
                    </div>
                    <span
                      onClick={() => links(escrow_info?.founderInfo?.twitter)}
                      className="flex items-center cursor-pointer hover:text-blue-500 transition-colors duration-200 -mt-1"
                    >
                      <XIcon className="text-xl sm:text-3xl" />
                      <MdVerified className="text-gray-400 ml-1 text-lg translate-y-[2px]" />
                    </span>
                  </div>
                </div>
              </Stack>

              <div className="flex flex-col gap-3 mt-4">
                <Button
                  onClick={() => links(escrow_info?.telegramLink)}
                  variant="contained"
                  className="!text-sm !px-8 !py-2 !capitalize !font-semibold !bg-second w-full"
                >
                  Start Chat
                </Button>

                <Button
                  onClick={() => links(escrow_info?.materials)}
                  variant="contained"
                  className="!text-sm !px-8 !py-2 !capitalize !font-semibold !bg-white !text-second !border !border-gray-200 w-full font-myanmar_khyay flex items-center justify-center gap-2"
                >
                  <CiFileOn className="text-xl -mt-[2px]" />
                  Link to Resources
                </Button>
              </div>
            </Stack>
          </Card>

          <div className="col-span-1 sm:col-span-3 w-full">
            <div className="space-y-4 w-full">
              <Card width="lg" className="h-fit min-h-[250px] w-full">
                <div className="text-sm text-textColor mb-3">Description</div>
                <div 
                  className="text-[13px] leading-7 text-gray-700 cursor-pointer"
                  onClick={() => setShowDescription(true)}
                >
                  {escrow_info?.description || escrow_info_data?.description ? (
                    <div>{escrow_info_data?.description || escrow_info?.description}</div>
                  ) : (
                    <div className="text-gray-500">No description available</div>
                  )}
                </div>
              </Card>
              {/* {escrow_info && (
                <span onClick={() => links(escrow_info.materials)}>
                  <Card className="mt-4 text-sm py-4">Link to materials</Card>
                </span>
              )} */}
              <Card className="!pt-2 !pb-8 sm:!pb-4 !h-[320px] sm:!h-48 w-full">
                {escrow_info && (
                  <>
                    {/* For Pending Applications */}
                    {isPendingApplication(escrow_info, applyInfo) && (
                      <div className="flex gap-2 mt-4 px-4 pb-4">
                        <div className="w-full flex flex-col">
                          <Card className="!shadow-none !border !border-gray-300 !bg-transparent flex items-center justify-center h-[80px] mb-4">
                            <div className="text-sm text-gray-600 text-center">
                              Your Application has been sent
                            </div>
                          </Card>
                          <div className="flex justify-center gap-4">
                            <Button
                              variant="contained"
                              className="!text-sm !px-8 !py-2 !capitalize !font-semibold !bg-second"
                              onClick={() => cancel_apply()}
                            >
                              Cancel Application
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* For Ongoing Contracts */}
                    {!isPendingApplication(escrow_info, applyInfo) && (
                      <>
                        {escrow_info.status === 9 && (
                          <div className="flex gap-2 mt-4">
                            <div className="w-full">
                              <Card className="text-xs text-center !shadow-none !border !border-textColor">
                                Your submission has been sent, The Contract Creator will approve it within the next 14 days or the payment will be released to you
                              </Card>
                            </div>
                          </div>
                        )}

                        {applyInfo && escrow_info.status === 3 && (
                          <div className="flex gap-2 mt-4">
                            <div className="w-full">
                              <Card className="text-xs text-center !shadow-none !border !border-textColor">
                                Your submission was approved and pay has been made to your wallet
                              </Card>
                            </div>
                          </div>
                        )}

                        {applyInfo && escrow_info.status === 2 && (
                          <div className="flex flex-col gap-2 mt-4">
                            <div className="w-full">
                              <Card className="text-xs text-center !shadow-none !border !border-textColor">
                                Contract has started please make submission before the deadline
                              </Card>
                              
                              <div className="relative w-full mt-2">
                                <textarea
                                  value={material}
                                  onChange={(e) => setMaterial(e.target.value)}
                                  placeholder="Enter your submission link or details here..."
                                  className={`
                                    w-full
                                    !h-[60px]
                                    px-6
                                    py-4
                                    pr-[120px]
                                    text-sm
                                    bg-white
                                    border
                                    border-gray-200/80
                                    rounded-xl
                                    resize-none
                                    outline-none
                                    transition-all
                                    duration-200
                                    placeholder:text-gray-100
                                    placeholder:text-xs
                                    hover:border-gray-300
                                    focus:border-second
                                    focus:shadow-[0_2px_8px_0px_rgba(0,0,0,0.08)]
                                    font-myanmar
                                  `}
                                  rows={1}
                                />
                                <div className="absolute right-2 top-[40%] -translate-y-1/2">
                                  <Button
                                    onClick={submission}
                                    disabled={isSubmitting || !material.trim()}
                                    className="!text-sm !bg-second !px-4 !py-1.5 !rounded-md !normal-case 
                                      !transition-all !duration-200 
                                      !text-white
                                      hover:!bg-opacity-90 hover:!scale-[1.02] 
                                      active:!scale-[0.98]
                                      disabled:!opacity-50 disabled:!cursor-not-allowed
                                      disabled:!scale-100 disabled:hover:!bg-second"
                                  >
                                    {isSubmitting ? (
                                      <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                        <span className="text-white">Submitting...</span>
                                      </div>
                                    ) : (
                                      <span className="text-white">Submit</span>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {applyInfo && escrow_info.status === 5 && (
                          <div className="flex flex-col gap-3">
                            <Card className="text-xs text-center !shadow-none !border !border-textColor">
                              Dispute Mode Now!
                            </Card>
                            
                            <Button
                              onClick={() => window.open(DISCORD_LINK, '_blank')}
                              variant="contained"
                              className="!text-xs sm:!text-sm !bg-black hover:!bg-gray-800 !px-4 !py-2 !rounded-md !normal-case !text-white !w-full"
                            >
                              Resolve Dispute
                            </Button>
                          </div>
                        )}

                        {escrow_info.status === 4 && (
                          <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                              duration: 0.8,
                              ease: "easeInOut",
                              type: "spring",
                              stiffness: 500,
                            }}
                            className="px-4 mt-2"
                          >
                            <Card className="text-xs text-center !shadow-none !border !border-textColor h-[50px] flex items-center justify-center">
                              <div className="px-4">
                                Your Submission was rejected you can either Terminate or Dispute
                              </div>
                            </Card>
                            
                            <Stack
                              flexDirection="row"
                              mt={2}
                              justifyContent="center"
                              alignItems="center"
                              gap={2}
                              className="pb-2 px-8"
                            >
                              <Button
                                variant="contained"
                                className="!text-xs sm:!text-sm !bg-second !px-4 !py-2 !rounded-md !normal-case !text-white !w-56 hover:!bg-second/90"
                                onClick={() => handleShowDispute()}
                              >
                                Dispute
                              </Button>

                              <Button
                                variant="contained"
                                className="!text-xs sm:!text-sm !shadow-lg !px-4 !py-2 !rounded-md !bg-white !normal-case !text-second !w-56 
                                  !border-2 !border-gray-300/60 hover:!bg-gray-50 disabled:!opacity-50 
                                  !shadow-gray-200/50"
                                onClick={() => Tarminat()}
                                disabled={isDisputing}
                              >
                                {isDisputing ? "Terminating..." : "Terminate"}
                              </Button>
                            </Stack>
                          </motion.div>
                        )}
                      </>
                    )}
                  </>
                )}
              </Card>
              {escrow_info && <Modal
                open={showDispute}
                onClose={() => setShowDispute(false)}
                className="grid place-items-center"
              >
                <ApproveModal
                  client={applyInfo?.userName || "User"}
                  contractor={escrow_info?.founderInfo?.name || "Contractor"}
                  amount={Number(escrow_info?.amount || 0) / 1000_000}
                  title="Confirmation"
                  messageTitle="Are you sure you want to request dispute??"
                  messageDescription={
                    <>
                      To prevent abuse, we charge a dispute resolution fees.
                      <br />
                      Please try as much as possible to resolve your issue before opening a dispute.
                    </>
                  }
                >
                  <Button
                    onClick={() => Dispute()}
                    variant="contained"
                    className="!normal-case !text-black !text-sm !bg-green-500 !px-8 !py-2"
                  >
                    Dispute
                  </Button>
                </ApproveModal>
              </Modal>}
              <Modal
                open={showDescription}
                onClose={() => setShowDescription(false)}
                className="grid place-items-center"
              >
                <Card width="md" className="max-h-screen overflow-y-hidden relative">
                  <div
                    className="absolute top-5 right-5 cursor-pointer"
                    onClick={() => setShowDescription(false)}
                  >
                    <IoMdClose className="text-2xl" />
                  </div>

                  <div className="text-base font-[500]">Description</div>

                  <p className="mt-5 p-2 text-sm leading-7">
                    {escrow_info_data?.description || escrow_info?.description}
                  </p>
                </Card>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
