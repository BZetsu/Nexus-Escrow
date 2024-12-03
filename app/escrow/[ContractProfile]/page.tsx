"use client";

import { notify_delete, notify_error, notify_laoding, notify_success } from "@/app/loading";
import Card from "@/components/Card";
import { closeApply } from "@/lib/NexusProgram/escrow/FreelancercloseApply";
import { FreelacerApply } from "@/lib/NexusProgram/escrow/freelacerApply";
import { getEscrowInfo } from "@/lib/NexusProgram/escrow/utils.ts/getEscrowInfo";
import { get_apply_info } from "@/lib/NexusProgram/escrow/utils.ts/get_apply_info";
import { get_userr_info } from "@/lib/NexusProgram/escrow/utils.ts/get_userr_info";
import { USER_PREFIX, PROGRAM_ID } from "@/lib/constants/constants";
import { inputStyle } from "@/lib/styles/styles";
import { backendApi } from "@/lib/utils/api.util";
import { formatTime, timeLeft } from "@/lib/utils/time_formatter";
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
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CiFileOn } from "react-icons/ci";
import { FaFileAlt } from "react-icons/fa";
import { FaFile } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { IconButton } from "@mui/material";
import CountdownTimer from "@/components/CountdownTimer";
import VerifiedIcon from '@mui/icons-material/Verified';

interface UserProfileResponse {
  data: {
    profilePicture: string;
    username: string;
    // other fields...
  }
}

interface EscrowResponse {
  data: {
    description: string;
    private: boolean;
    // add other fields as needed
  }
}

interface FounderResponse {
  data: {
    image: string;
    name: string;
    publicKey: string;
    // add other fields as needed
  }
}

export default function page() {
  const [open, setOpen] = useState(false);
  const [applyInfo, setApplyInfo] = useState<any>();
  const [telegram, setTelegram] = useState<string>("");
  const [escrowInfo, setEscrowInfo] = useState<any>();
  const [escrowDateInfo, setEscrowDateInfo] = useState<any>();
  const [founderProfilePic, setFounderProfilePic] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDispute, setShowDispute] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  function handleCloseModal() {
    setOpen(false);
  }

  function handleOpenModal() {
    setOpen(true);
  }

  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const pathname = usePathname();

  const getApply = async () => {
    try {
      const PROGRAM_ID = new web3.PublicKey(
        "3GKGywaDKPQ6LKXgrEvBxLAdw6Tt8PvGibbBREKhYDfD"
      );

      const address = pathname.replace("/escrow/", "");
      const escrow = new web3.PublicKey(address);

      const [apply] = web3.PublicKey.findProgramAddressSync(
        [anchorWallet!.publicKey.toBuffer(), escrow.toBuffer()],
        PROGRAM_ID
      );

      const applyinfos = await get_apply_info(anchorWallet, connection, apply);

      setApplyInfo(applyinfos);

    } catch(e) {
      console.log(e);
    }
  }

  const getEscrowInfos = async () => {
    try {
      setIsLoading(true);
      const address = pathname.replace("/escrow/", "");
      const escrow = new web3.PublicKey(address);
      const info = await getEscrowInfo(anchorWallet, connection, escrow);
      
      if (!info || !info.founder) return;

      const founder_info = await get_userr_info(
        anchorWallet,
        connection,
        info.founder
      );
      info.escrow = escrow;

      const [freelancer] = web3.PublicKey.findProgramAddressSync(
        [anchorWallet!.publicKey.toBuffer(), Buffer.from(USER_PREFIX)],
        PROGRAM_ID
      );

      const freelancer_info = await get_userr_info(
        anchorWallet,
        connection,
        freelancer
      );

      const databaseEscrowInfo = await backendApi.get<EscrowResponse>(`/escrow/${address}`);
      const founderAddress = info?.founderInfo?.walletAddress || info?.founder?.toBase58();
      
      if (founderAddress) {
        const founderInfo = await backendApi.get<FounderResponse>(`/nexus-user/${founderAddress}`);
        if (founderInfo?.data?.image) {
          setFounderProfilePic(founderInfo.data.image);
        }
      }

      setEscrowDateInfo(databaseEscrowInfo.data);
      info.founderInfo = founder_info;
      info.freelancer = freelancer_info;
      setEscrowInfo(info);
      setTelegram(freelancer_info?.telegramId || '');

      if (founder_info?.name) {
        await getFounderProfile(founder_info.name);
      }

    } catch (e) {
      console.error('Error loading escrow info:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getFounderProfile = async (username: string) => {
    try {
      console.log("Fetching profile for username:", username);
      const response = await backendApi.get<UserProfileResponse>(`/users/by-username/${username}`);
      console.log("API Response:", response);
      
      if (response && response.data && response.data.profilePicture) {
        console.log("Profile picture URL:", response.data.profilePicture);
        setFounderProfilePic(response.data.profilePicture);
      }
    } catch (e) {
      console.log("Error fetching founder profile:", e);
    }
  };

  const apply = async () => {
    if (isApplying || !telegram.trim()) {
      notify_error("Please enter a valid Telegram contact");
      return;
    }

    try {
      setIsApplying(true);
      notify_laoding("Applying to work...");

      await FreelacerApply(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
        Number(escrowInfo.amount),
        telegram,
        escrowInfo.contractName,
        Number(escrowInfo.deadline)        
      );

      notify_delete();
      notify_success("Applied Successfully!");
      handleCloseModal();

    } catch (e) {
      notify_delete();
      notify_error("Application Failed!");
    } finally {
      setIsApplying(false);
    }
  };

  const cancel_apply = async () => {
    if (isCanceling) return;

    try {
      setIsCanceling(true);
      notify_laoding("Canceling Application...");

      await closeApply(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
      );

      notify_delete();
      notify_success("Application Canceled Successfully!");
      
    } catch (e) {
      notify_delete();
      notify_error("Cancellation Failed!");
    } finally {
      setIsCanceling(false);
    }
  };

  const checkAccess = async () => {
    try {
      if (!anchorWallet) {
        return;
      }

      const address = pathname.replace("/escrow/", "");
      const escrow = new web3.PublicKey(address);
      
      // Get escrow info first
      const info = await getEscrowInfo(anchorWallet, connection, escrow);
      
      if (!info || !info.founder) {
        return;
      }

      // Keep the check but remove redirect
      const isCreator = info.founder.toBase58() === anchorWallet.publicKey.toBase58();

    } catch (e) {
      console.error('Access check failed:', e);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [anchorWallet, pathname]);

  useEffect(() => {
    if (!anchorWallet) return;
    getEscrowInfos();
    getApply();
  }, [anchorWallet]);

  useEffect(() => {
    if (escrowInfo && escrowInfo.deadline) {
      // Initial update
      setCountdown(timeLeft(escrowInfo.deadline));
      
      // Update every second
      const timer = setInterval(() => {
        setCountdown(timeLeft(escrowInfo.deadline));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [escrowInfo]);

  const router = useRouter();

  const links = (link: string) => {
    console.log("Opening link:", link);
    if (link && link.length > 0) {
      // Add https:// if not present
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        link = 'https://' + link;
      }
      window.open(link, "_blank");
    }
  };
  const [showDescription, setShowDescription] = useState(false);

  // Add this effect to handle automatic privacy switch
  useEffect(() => {
    const handlePrivacyOnContractStart = async () => {
      if (escrowInfo && escrowInfo.status === 2 && !escrowDateInfo?.private) {
        try {
          const address = pathname.replace("/escrow/", "");
          await backendApi.patch(`escrow/update/${address}`, {
            deadline: Number(escrowInfo.deadline),
            telegramLink: escrowInfo.telegramLink || "",
            private: true,
            description: escrowDateInfo?.description || ""
          });
          
          // Update local state
          setEscrowDateInfo((prev: any) => ({
            ...prev,
            private: true
          }));
        } catch (error) {
          console.error("Failed to update privacy:", error);
        }
      }
    };

    handlePrivacyOnContractStart();
  }, [escrowInfo?.status]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-8">
          <Card className="!col-span-1 sm:!col-span-3 !p-3" width="lg">
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              className="text-base sm:text-xl font-[600] w-full pt-2"
            >
              <div className="flex-1 text-base sm:text-2xl font-bold translate-y-1">
                {escrowInfo && escrowInfo.contractName !== "" ? (
                  <span className="text-black">
                    {escrowInfo.contractName}
                  </span>
                ) : (
                  <span className="text-gray-500/70">
                    Contract Title
                  </span>
                )}
              </div>

              <Stack flexDirection="row" alignItems="center" gap={1}>
                <div className="-translate-y-1">
                  <Image 
                    src={coin} 
                    alt="coin" 
                    className="w-6 h-6" 
                    priority
                  />
                </div>
                <div className="text-lg translate-y-0">
                  {escrowInfo ? Number(escrowInfo.amount) / 1000_000 : "--"}
                </div>
              </Stack>
            </Stack>
          </Card>

          <Card className="!py-2 !px-4 col-span-1 sm:max-w-72">
            {escrowInfo && (
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                className="h-full min-h-[60px]"
                gap={2}
              >
                <div className="text-sm font-[500] flex items-center gap-2">
                  <div className={`transition-colors ${
                    !escrowDateInfo?.private ? 'text-black font-semibold' : 'text-gray-500'
                  }`}>
                    {escrowDateInfo?.private ? "Private" : "Public"}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    escrowDateInfo?.private ? 'bg-red-500' : 'bg-green-500'
                  } -translate-y-0.5`} />
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="text-xs text-textColor">Deadline</div>
                  <div className="flex items-center gap-2">
                    {escrowInfo.deadline ? (
                      <CountdownTimer deadline={escrowInfo.deadline} />
                    ) : (
                      <div className="text-base font-semibold">--</div>
                    )}
                  </div>
                </div>
              </Stack>
            )}
          </Card>
        </div>

        <div className="grid sm:grid-cols-5 gap-4 mt-5">
          <Card 
            className="!p-0 sm:col-span-2 overflow-hidden h-[320px] sm:h-[520px]"
          >
            <div className="flex flex-col sm:flex-col p-2 sm:p-3 h-full">
              <Image
                src={founderProfilePic || escrowInfo?.founderInfo?.image || dragon}
                alt="profile"
                width={500}
                height={500}
                className="w-[700px] h-[140px] sm:w-full sm:h-[320px] 
                           rounded-xl object-cover 
                           px-2 sm:px-0
                           object-[center_75%] sm:object-center"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = dragon.src;
                }}
              />

              <div className="mt-7 px-1">
                <div className="text-xs text-gray-400 mb-2 font-medium">
                  Contract Creator
                </div>
                <div className="border border-gray-200 rounded-xl px-4 py-4 flex items-center justify-between w-full">
                  <div className="text-base sm:text-xl font-[600] font-myanmarButton">
                    {escrowInfo ? escrowInfo.founderInfo.name : "--"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => links(escrowInfo.founderInfo.twitter)}
                      className="cursor-pointer hover:text-blue-400 transition-colors duration-200"
                    >
                      <XIcon className="text-xl" />
                    </span>
                    <span className="cursor-pointer">
                      <VerifiedIcon 
                        className={`text-lg ${escrowInfo?.isVerified ? 'text-blue-500' : 'text-gray-400'} 
                        hover:text-blue-500 transition-colors`} 
                      />
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => {
                    if (escrowInfo && escrowDateInfo) {
                      const telegramLink = escrowDateInfo.telegramLink;
                      if (telegramLink) {
                        let link = telegramLink;
                        if (!link.includes('.') && !link.startsWith('@') && !link.includes('t.me')) {
                          link = `https://t.me/${link}`;
                        }
                        else if (!link.startsWith('http://') && !link.startsWith('https://')) {
                          link = `https://${link}`;
                        }
                        window.open(link, '_blank');
                      }
                    }
                  }}
                  variant="contained"
                  className="!text-[10px] sm:!text-sm !font-semibold !capitalize !bg-second !py-2 w-full sm:w-fit sm:!px-12"
                >
                  Start Chat
                </Button>
              </div>
            </div>
          </Card>

          <div className="sm:col-span-3 flex flex-col gap-4">
            <Card width="lg" className="h-[320px]">
              <div className="text-xs text-textColor">Description</div>
              <div className="mt-3">
                <div
                  className="line-clamp-5 text-5 text-[12px] leading-7 cursor-pointer h-14"
                  onClick={() => setShowDescription(true)}
                >
                  {escrowDateInfo && escrowDateInfo.description !== ""
                    ? escrowDateInfo.description
                    : "--"}
                </div>
              </div>
            </Card>

            <Card className="flex-1 h-[50px]">
              <Button
                className="!mt-2 !mb-2 w-full !bg-white hover:bg-opacity-0 shadow-none !normal-case border border-gray-300"
                style={{ display: "unset" }}
              >
                <span onClick={() => links(escrowInfo.materials)}>
                  <Card className="text-base !flex !justify-center gap-1 !items-start">
                    <div>
                      <CiFileOn className="text-xl" />
                    </div>
                    <div className="!normal-case">Link to Resources</div>
                  </Card>
                </span>
              </Button>

              {!applyInfo ? (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={handleOpenModal}
                    variant="contained"
                    disabled={isApplying}
                    className="!text-xs sm:!text-sm !font-semibold !normal-case !py-2 !text !px-10 !bg-main !text-second !w-fit disabled:!opacity-50"
                  >
                    Apply to work
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center h-[30px] items-end mt-4">
                  <Button
                    variant="contained"
                    onClick={() => cancel_apply()}
                    disabled={isCanceling}
                    className="!text-xs sm:!text-sm !font-semibold !bg-main !text-second !w-fit !normal-case !py-3 !px-8 disabled:!opacity-50"
                  >
                    {isCanceling ? "Canceling..." : "Cancel Apply"}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleCloseModal}
        className="grid place-items-center"
      >
        <Card width="xs">
          <div className="p-5">
            <div className="text-sm">
              <span className="text-red-600">Hint: </span>
              People who fill up their profile properly are likely to get hired
              <br />
              Go to{" "}
              <span
                className="font-semibold underline cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                "My Profile"
              </span>
            </div>

            <div className="mt-10 w-full">
              <label className="block mb-2 text-sm font-medium">
                Telegram Link for communication:
              </label>
              <input
                value={telegram}
                className={`${inputStyle} w-full h-14 px-4 py-4 text-base border-2 ring-2 focus:ring-2 focus:ring-offset-2`}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="Enter your Telegram username or link"
              />
            </div>

            <Stack mt={5} alignItems="center">
              <Button
                onClick={() => apply()}
                variant="contained"
                disabled={isApplying}
                className="!text-xs sm:!text-sm !font-semibold !normal-case !py-2 !text !px-10 !bg-main !text-second !w-fit disabled:!opacity-50"
              >
                {isApplying ? "Applying..." : "Apply to work"}
              </Button>
            </Stack>
          </div>
        </Card>
      </Modal>

      {escrowDateInfo && escrowDateInfo.description && <Modal
        open={showDescription}
        onClose={() => setShowDescription(false)}
        className="grid place-items-center"
      >
        <Card width="md" className=" max-h-screen overflow-y-hidden relative">
          <div
            className="absolute top-5 right-5 cursor-pointer"
            onClick={() => setShowDescription(false)}
          >
            <IoMdClose className="text-2xl" />
          </div>

          <div className="text-base font-[500]">Description</div>

          <p className="mt-5 p-2 text-sm leading-7">
            {escrowDateInfo.description}
          </p>
        </Card>
      </Modal>}
    </div>
  );
}

