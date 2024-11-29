"use client";

import { notify_delete, notify_error, notify_laoding, notify_success } from "@/app/loading";
import Card from "@/components/Card";
import { fTarminat } from "@/lib/NexusProgram/escrow/Fterminat";
import { openDispute } from "@/lib/NexusProgram/escrow/FopenDipute";
import { submit } from "@/lib/NexusProgram/escrow/submit";
import { getEscrowInfo } from "@/lib/NexusProgram/escrow/utils.ts/getEscrowInfo";
import { get_userr_info } from "@/lib/NexusProgram/escrow/utils.ts/get_userr_info";
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
      const response = await backendApi.get<{data: any[]}>(`/nexus-user`);
      if (response && response.data) {
        const userData = response.data.find((user: any) => user.userId === userId);
        if (userData) {
          setUserData(userData);
        }
      }
    } catch (e) {
      console.log(e);
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

  const submission = async () => {
    try {
      notify_laoding("Transaction Pending")
      const address = pathname.replace("/escrow/ongoing/", "");
      const escrow = new web3.PublicKey(address);
      console.log(material)
      const tx = await submit(anchorWallet, connection, wallet, escrow, material);
      // setShowSubmission(true);
      console.log(tx);
      notify_delete();
      notify_success("Transaction Success!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");      console.log(e);
    }
  };
  
  const Tarminat = async () => {
    try {
      
      notify_laoding("Transaction Pending")
      const address = pathname.replace("/escrow/ongoing/", "");
      const escrow = new web3.PublicKey(address);

      const tx = await fTarminat(anchorWallet, connection, wallet, escrow);
      // setShowSubmission(true);
      console.log(tx);
      notify_delete();
      notify_success("Transaction Success!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    }
  };

  const Dispute = async () => {
    try {
      notify_laoding("Transaction Pending...!");
      const address = pathname.replace("/escrow/ongoing/", "");
      const escrow = new web3.PublicKey(address);

      const tx = await openDispute(anchorWallet, connection, wallet, escrow);
      // setShowSubmission(true);
      console.log(tx);
      notify_delete();
      notify_success("Transaction Success!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    }
  };

  const getEscrowInfos = async () => {
    try {
      const address = pathname.replace("/escrow/ongoing/", "");
      const escrow = new web3.PublicKey(address);
      const info = await getEscrowInfo(anchorWallet, connection, escrow);
      
      // Get escrow data from database
      const databaseEscrowInfo = await backendApi.get(`/escrow/${address}`);
      if ((databaseEscrowInfo as any)?.data) {
        setEscrowInfoData((databaseEscrowInfo as any).data);
      }
      
      // Get founder info from blockchain
      const founder_info = await get_userr_info(
        anchorWallet,
        connection,
        info!.founder
      );

      // Get all users and find founder
      const allUsers = await backendApi.get<{data: any[]}>(`/nexus-user`);
      const founderAddress = info!.founder.toBase58();
      console.log("Founder Address to find:", founderAddress);

      if (allUsers?.data) {
        console.log("All Users:", allUsers.data.map(u => ({
          userId: u.userId,
          address: u.address,
          name: u.name
        })));

        const founderData = allUsers.data.find(
          (user: any) => user.userId === founderAddress || user.address === founderAddress
        );
        
        console.log("Found Founder Data:", founderData);
        
        if (founderData && founder_info) {
          info!.founderInfo = {
            ...founder_info,
            image: founderData.image || dragon.src,
            telegramId: founderData.telegramId || founderData.discordId || '',
            name: founderData.name || founder_info?.name || "Unknown",
            twitter: founderData.twitter || ''
          };

          console.log("Final Mapped Data:", info!.founderInfo);
        } else if (founder_info) {
          info!.founderInfo = founder_info;
        }
      }

      console.log("Founder Info:", info!.founderInfo);
      setEscrowInfo(info);
    } catch (e) {
      console.log("Error in getEscrowInfos:", e);
    }
  };

  const cancel_apply = async () => {
    try {
      notify_laoding("Transaction Pending...!")
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
      notify_success("Transaction Success!")
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


  const links = (link: string) => {
    window.open(link, "_blank");
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
              {escrow_info && <div className="flex-1 font-myanmar_khyay ">
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
              <div className="text-sm font-[500] font-myanmar">{escrow_info.private ? "Private" : "Public"}</div>
              <div className="flex flex-col space-y-2">
                <div className="text-xs text-textColor font-myanmar">
                  Deadline
                </div>
                <div className="text-base font-semibold line-clamp-1 font-myanmar">
                  {deadline}
                </div>
              </div>
            </Stack>
          </Card>}
        </div>

        <div className="grid sm:grid-cols-5 gap-4 mt-5">
          <Card className="!p-0 sm:col-span-2 overflow-hidden h-full 
            max-w-[300px] sm:max-w-none 
            mx-auto w-[95%] 
            [@media(min-width:500px)]:w-[400px] 
            sm:w-full"
          >
            <div className="p-2">
              <Image
                src={escrow_info?.founderInfo?.image || dragon}
                alt={escrow_info?.founderInfo?.name || "Profile"}
                width={500}
                height={500}
                className="w-full h-[180px] [@media(min-width:500px)]:h-[200px] sm:h-[250px] rounded-xl object-cover object-center"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = dragon.src;
                }}
              />
            </div>

            <Stack pt={2} spacing={2} px={1} className="flex-1 flex flex-col">
              <Stack
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                className="w-full py-1"
              >
                <div className="border border-gray-200 rounded-xl px-6 py-3 flex flex-col w-full min-h-[4rem]">
                  <span className="text-xs text-gray-500 mb-1">Contract Creator</span>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl sm:text-3xl font-[600] font-myanmarButton">
                      {escrow_info?.founderInfo?.name || "--"}
                    </div>
                    <span
                      onClick={() => links(escrow_info?.founderInfo?.twitter)}
                      className="flex items-center cursor-pointer hover:text-blue-500 transition-colors duration-200"
                    >
                      <XIcon className="text-3xl" />
                      <div className="text-[10px] text-gray-500 ml-1">
                        (Verified)
                      </div>
                    </span>
                  </div>
                </div>
              </Stack>

              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => {
                    if (escrow_info?.founderInfo?.telegramId) {
                      let link = escrow_info.founderInfo.telegramId;
                      // Remove any existing URL
                      link = link.replace('https://www.youtube.com/', '')
                                .replace('https://youtube.com/', '')
                                .replace('https://t.me/', '')
                                .replace('@', '');
                      
                      // Format as telegram link
                      link = `https://t.me/${link}`;
                      links(link);
                    }
                  }}
                  variant="contained"
                  className="!text-sm !px-8 !py-2 !capitalize !font-semibold !bg-second !text-white"
                  disabled={!escrow_info?.founderInfo?.telegramId}
                >
                  Start Chat
                </Button>
              </div>
            </Stack>
          </Card>

          <div className="sm:col-span-3">
            <Card width="lg" className=" h-fit">
              <div className="text-sm text-textColor">Description</div>

              {escrow_info_data && <div className="py-3 mt-3">
                <div className="line-clamp-5 text-5 text-[13px] leading-7">
                  {escrow_info_data.description}
                </div>
              </div>}
            </Card>
            {/* {escrow_info && (
              <span onClick={() => links(escrow_info.materials)}>
                <Card className="mt-4 text-sm py-4">Link to materials</Card>
              </span>
            )} */}
            <Card className="mt-2 !pt-2 !h-64">
              {escrow_info && escrow_info.status === 9 && (
                
                <Card className="mt-4 !py-3">
                  <Card className="text-xs text-center !shadow-none !border !border-textColor">
                        Your submission has been sent, Wait until the Client Approve it within the next 14 days otherwise the funds will be released to you
                      {/* Your submission was approved and pay has been made to your
                  wallet, project will auto terminate in 24 hours */}
                    </Card>
                  {/* <Stack
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <div className="text-sm text-textColor">Submission</div>
                    <Button
                      variant="contained"
                      disabled={false}
                      className="!text-xs !bg-second !px-4 !py-2 !rounded-md !font-semibold !normal-case !text-white"
                      onClick={() => submission()}
                    >
                      Submit
                    </Button>
                  </Stack> */}
                </Card>
              )}

              {escrow_info && applyInfo && escrow_info.status === 3 &&
                <div className="flex gap-2 mt-4">
                  <div 
                    onClick={() => links(escrow_info?.materials)}
                    className="w-fit cursor-pointer"
                  >
                    <Card className="!py-2 !px-2 grid place-content-center hover:scale-105 transition-transform duration-200">
                      <CiFileOn className="text-6xl mx-auto" />
                      <div className="text-xs mt-1">
                        Link to Resources
                      </div>
                    </Card>
                  </div>
                  <div className="w-full">
                    <Card className="text-xs text-center !shadow-none !border !border-textColor">
                    Your submission was approved and pay has been made to your wallet
                      {/* Your submission was approved and pay has been made to your
                  wallet, project will auto terminate in 24 hours */}
                    </Card>
                  </div>
                </div>}
              {escrow_info && applyInfo && escrow_info.status === 1 && (
                <div className="flex gap-2 mt-4">
                  <Card className="!w-fit !py-2 text-center !px-2 grid place-content-center">
                    <CiFileOn className="text-6xl mx-auto" />
                    {escrow_info && (
                      <div
                        className="text-xs mt-1 hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onClick={() => links(escrow_info?.materials)}
                      >
                        Link to Resources
                      </div>
                    )}
                  </Card>
                  <div className="w-full flex flex-col">
                    <Card className="!shadow-none !border !border-gray-300 !bg-transparent flex items-center justify-center h-[108px] mb-6">
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
              {escrow_info && applyInfo && escrow_info.status === 2 &&
                <div className="flex gap-2 mt-4">
                  <Card className="!w-fit !py-2 text-center !px-2 grid place-content-center">
                    <CiFileOn className="text-6xl mx-auto" />
                    {escrow_info && (
                      <div
                        className="text-xs mt-1 hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onClick={() => links(escrow_info?.materials)}
                      >
                        Link to Resources
                      </div>
                    )}
                  </Card>
                  <div className="w-full">
                    <Card className="text-xs text-center !shadow-none !border !border-textColor">
                      Contract has started please make submission before the
                      deadline
                      {/* Your submission was approved and pay has been made to your
                  wallet, project will auto terminate in 24 hours */}
                    </Card>
                    <Card className="mt-2 !py-3">
                      <Stack
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <div className="text-sm text-textColor">
                          <input
                            onChange={(e) => setMaterial(e.target.value)}
                            placeholder="Submission"
                            className="h-6 border-0 focus:outline-none"
                          />
                        </div>
                        <Button
                          variant="contained"
                          className="!text-xs !bg-second !px-4 !pb-2 !pt-3 !rounded-md !font-semibold !normal-case !text-white"
                          onClick={() => submission()}
                        >
                          Submit
                        </Button>
                      </Stack>
                    </Card>
                  </div>
                </div>}
              {escrow_info && applyInfo && escrow_info.status == 5 &&
                <div>
                  <Card className="text-xs text-center !shadow-none !border !border-textColor">
                    Dispute Mode Now!
                  </Card>
                </div>
              }
              {escrow_info && escrow_info.status === 4 && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    type: "spring",
                    stiffness: 500,
                  }}
                  className="px-4 mt-4"
                >
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      ease: "easeInOut",
                      type: "spring",
                      stiffness: 500,
                    }}
                    className="px-4 mt-4"
                  >
                    <Card className="text-xs text-center !shadow-none !border !border-textColor">
                      Your Submition was rejected you can either Terminate or
                      Dispute
                      {/* Your submission was approved and pay has been made to your
                  wallet, project will auto terminate in 24 hours */}
                    </Card>
                    <Stack
                      flexDirection="row"
                      mt={4}
                      justifyContent="center"
                      alignItems="center"
                      gap={2}
                    >
                      <Button
                        variant="contained"
                        className="!text-xs sm:!text-sm !bg-second !px-4 !py-2 !rounded-md !normal-case !text-white !w-56"
                        onClick={() => handleShowDispute()}
                      >
                        Dispute
                      </Button>

                      <Button
                        variant="contained"
                        className="!text-xs sm:!text-sm !shadow-lg !px-4 !py-2 !rounded-md !bg-white !normal-case !text-second !w-56"
                        onClick={() => Tarminat()}
                      >
                        Terminate
                      </Button>
                    </Stack>
                  </motion.div>
                </motion.div>
                

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
                messageDescription="To prevent abuse, we charge a dispute resolution fees. Please try as much as possible ro resolve your issue before opening a dispute"
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
          </div>
        </div>
      </div>
    </div>
  );
}
