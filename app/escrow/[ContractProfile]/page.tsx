"use client";

import { notify_delete, notify_error, notify_laoding, notify_success } from "@/app/loading";
import Card from "@/components/Card";
import { closeApply } from "@/lib/NexusProgram/escrow/FreelancercloseApply";
import { FreelacerApply } from "@/lib/NexusProgram/escrow/freelacerApply";
import { getEscrowInfo } from "@/lib/NexusProgram/escrow/utils.ts/getEscrowInfo";
import { get_apply_info } from "@/lib/NexusProgram/escrow/utils.ts/get_apply_info";
import { get_userr_info } from "@/lib/NexusProgram/escrow/utils.ts/get_userr_info";
import { USER_PREFIX } from "@/lib/constants/constants";
import { inputStyle } from "@/lib/styles/styles";
import { backendApi } from "@/lib/utils/api.util";
import { formatTime, timeLeft } from "@/lib/utils/time_formatter";
import coin from "@/public/coin.svg";
import dragon from "@/public/dragon.svg";
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
      
      console.log("Escrow Info:", info);
      console.log("Telegram Link:", info?.telegramLink);

      const founder_info = await get_userr_info(
        anchorWallet,
        connection,
        info!.founder
      );
      info!.escrow = escrow;

      const PROGRAM_ID = new web3.PublicKey(
        "3GKGywaDKPQ6LKXgrEvBxLAdw6Tt8PvGibbBREKhYDfD"
      );

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
      console.log("Database Escrow Info:", databaseEscrowInfo);

      const founderAddress = info?.founderInfo?.walletAddress || info?.founder?.toBase58();
      
      if (founderAddress) {
        const founderInfo = await backendApi.get<FounderResponse>(`/nexus-user/${founderAddress}`);
        if (founderInfo?.data?.image) {
          setFounderProfilePic(founderInfo.data.image);
        }
      }

      setEscrowDateInfo(databaseEscrowInfo.data);
      info!.founderInfo = founder_info;
      info!.freelancer = freelancer_info;
      console.log("infoOOOOOOOOOOOO " + info);
      console.log(info);
      setEscrowInfo(info);
      // console.log(info, "info", formatTime(info!.deadline));
      setTelegram(freelancer_info!.telegramId);

      if (founder_info && founder_info.name) {
        console.log("Found founder name:", founder_info.name);
        await getFounderProfile(founder_info.name);
      }
    } catch (e) {
      console.log(e);
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
    try {
      if (telegram.length == 0) {
        return console.log("need telegram first");
      }
      notify_laoding("Applying to work...!")
      console.log(escrowInfo)
      const tx = await FreelacerApply(
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
      notify_success("Applied Successfully!")
    } catch (e) {
      notify_delete();
      notify_error("Application Failed!");
      console.log(e);
    }
  };

  const cancel_apply = async () => {
    try {
      notify_laoding("Canceling Application...!")
      console.log(escrowInfo)
      const tx = await closeApply(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
      );
      notify_delete();
      notify_success("Transaction Success!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
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

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-8">
          <Card className=" !col-span-1 sm:!col-span-3" width="lg">
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              className="text-base sm:text-xl font-[600] pt-2"
            >
              <div className="flex-1 text-base sm:text-2xl">
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

              <Stack flexDirection="row" alignItems="start" gap={0.4}>
                <Image src={coin} alt="coin" className="w-5 mt-[1px]" />
                <div>{escrowInfo ? Number(escrowInfo.amount) / 1000_000 : "--"}</div>
              </Stack>
            </Stack>
          </Card>

          <Card className="!py-3 !px-4 col-span-1 sm:max-w-72 grid place-items-center">
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <div className="text-sm font-[500]">{escrowDateInfo && escrowDateInfo.private ? "Private" : "Public"}</div>
              <div className="flex flex-col space-y-2">
                <div className="text-xs text-textColor">Deadline</div>
                <div className="text-base font-semibold line-clamp-1">
                  {escrowInfo && escrowInfo.deadline
                    ? timeLeft(escrowInfo.deadline)
                    : "2d 24hrs 30min"}
                </div>
              </div>
            </Stack>
          </Card>
        </div>

        <div className="grid sm:grid-cols-5 gap-4 mt-5">
          <Card className="!p-0 sm:col-span-2 overflow-hidden h-[550px]">
            <div className="flex sm:flex-col p-2 h-full">
              <Image
                src={founderProfilePic || escrowInfo?.founderInfo?.image || dragon}
                alt="profile"
                width={500}
                height={500}
                className="w-[100px] h-[100px] p-1 sm:p-0 sm:w-full sm:h-[350px] rounded-xl object-cover object-center"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = dragon.src;
                }}
              />

              <Stack pt={2} spacing={2} px={1} className="flex-1 flex flex-col">
                <Stack
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  className="w-full py-1"
                >
                  <div className="border border-gray-200 rounded-xl px-6 py-3 flex items-center justify-between w-full min-h-[4rem]">
                    <div className="text-xl sm:text-3xl font-[600] font-myanmarButton flex items-center mt-2">
                      {escrowInfo ? escrowInfo.founderInfo.name : "--"}
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                      <span
                        onClick={() => links(escrowInfo.founderInfo.twitter)}
                        className="flex items-center cursor-pointer hover:text-blue-400 transition-colors duration-200"
                      >
                        <XIcon className="text-2xl" />
                      </span>
                      <div className="text-[10px] text-gray-500 flex items-center">
                        (Not Verified)
                      </div>
                    </div>
                  </div>
                </Stack>

                <div className="flex flex-col gap-4 justify-end h-[100px]">
                  <div className="flex gap-4 items-center justify-center pb-4 mb-6">
                    <Button
                      onClick={() => {
                        if (escrowInfo && escrowDateInfo) {
                          console.log("Database Escrow Info:", escrowDateInfo);
                          const telegramLink = escrowDateInfo.telegramLink;
                          if (telegramLink) {
                            let link = telegramLink;
                            // Check if it's a username only
                            if (!link.includes('.') && !link.startsWith('@') && !link.includes('t.me')) {
                              link = `https://t.me/${link}`;
                            }
                            // Add https if needed
                            else if (!link.startsWith('http://') && !link.startsWith('https://')) {
                              link = `https://${link}`;
                            }
                            console.log("Opening telegram link:", link);
                            window.open(link, '_blank');
                          } else {
                            console.log("No telegram link found in database info:", escrowDateInfo);
                          }
                        }
                      }}
                      variant="contained"
                      className="!text-[10px] sm:!text-sm !px-12 !font-semibold !pt-3 !capitalize !bg-second !w-fit !pb-[.8rem] !py-3"
                    >
                      Start Chat
                    </Button>

                    <span
                      onClick={() => links(escrowInfo.founderInfo.twitter)}
                      className="sm:hidden"
                    >
                      <XIcon className="text-sm" />
                    </span>
                  </div>
                </div>
              </Stack>
            </div>
          </Card>

          <div className="sm:col-span-3 flex flex-col gap-4">
            <Card width="lg" className="h-72">
              <div className="text-xs text-textColor">Description</div>

              <div className=" mt-3">
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

            <Card className="flex-1">
              <Button
                className="!mt-4 w-full !bg-white hover:bg-opacity-0 shadow-none !normal-case border border-gray-300"
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
                <div className="flex justify-center h-[120px] items-end pb-4">
                  <Button
                    variant="contained"
                    onClick={handleOpenModal}
                    className="!text-xs sm:!text-sm !font-semibold !bg-main !text-second !w-fit !normal-case !py-3 !px-8"
                  >
                    Apply to work
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center h-[120px] items-end pb-4">
                  <Button
                    variant="contained"
                    onClick={() => cancel_apply()}
                    className="!text-xs sm:!text-sm !font-semibold !bg-main !text-second !w-fit !normal-case !py-3 !px-8"
                  >
                    Cancel Apply
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
              <label>Telegram Link for communication:</label>
              <input
                value={telegram}
                className={`${inputStyle} w-full`}
                onChange={(e) => setTelegram(e.target.value)}
              />
            </div>

            <Stack mt={5} alignItems="center">
              <Button
                onClick={() => apply()}
                variant="contained"
                className="!text-xs sm:!text-sm !font-semibold !normal-case !py-2 !text !px-10 !bg-main !text-second !w-fit"
              >
                Apply to work
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

