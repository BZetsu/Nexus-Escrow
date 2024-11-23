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

export default function page() {
  const [open, setOpen] = useState(false);
  const [applyInfo, setApplyInfo] = useState<any>();
  const [telegram, setTelegram] = useState<string>("");
  const [escrowInfo, setEscrowInfo] = useState<any>();
  const [escrowDateInfo, setEscrowDateInfo] = useState<any>();

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
      const address = pathname.replace("/escrow/", "");
      const escrow = new web3.PublicKey(address);
      const info = await getEscrowInfo(anchorWallet, connection, escrow);
      
      // Get founder's info from blockchain
      const founder_info = await get_userr_info(
        anchorWallet,
        connection,
        info!.founder
      );

      // Get founder's info from database using the correct endpoint
      const founderDatabaseInfo = await backendApi.get(
        `/nexus-user/${info!.founder.toBase58()}`
      );

      info!.founderInfo = {
        ...founder_info,
        image: founderDatabaseInfo?.data?.image || dragon.src,  // Use database image first
        name: founderDatabaseInfo?.data?.name || founder_info?.name || "--"
      };

      setEscrowInfo(info);

      // Get escrow details
      const databaseEscrowInfo = await backendApi.get(`/escrow/${address}`);
      setEscrowDateInfo((databaseEscrowInfo as any)!.data);

    } catch (e) {
      console.log(e);
    }
  };

  const apply = async () => {
    try {
      if (telegram.length == 0) {
        return console.log("need telegram first");
      }
      notify_laoding("Transaction Pending...!")
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
      notify_success("Transaction Success!");
      handleCloseModal();
      
      // Quick refresh after success
      await getEscrowInfos();
      await getApply();

    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
      console.log(e);
    }
  };

  const cancel_apply = async () => {
    try {
      notify_laoding("Transaction Pending...!")
      console.log(escrowInfo)
      const tx = await closeApply(
        anchorWallet,
        connection,
        wallet,
        escrowInfo.escrow,
      );
      
      notify_delete();
      notify_success("Transaction Success!")
      
      // Quick refresh after success
      await getEscrowInfos();
      await getApply();

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

  const router = useRouter();

  const links = (link: string) => {
    console.log(link);
    if (link.length > 0) {
      // const http = "https://www.";
      // link = http.concat(link);
      // link = link.replace("https://www.", "https://www.");
      window.open(link, "_blank");
    }
  };
  const [showDescription, setShowDescription] = useState(false);

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
                {escrowInfo && escrowInfo.contractName !== ""
                  ? escrowInfo.contractName
                  : "Build a team dashboard"}
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
          <Card className="!p-0 sm:col-span-2 overflow-hidden ">
            <div className="flex sm:flex-col p-2">
              <Image
                src={escrowInfo?.founderInfo?.image || dragon.src}
                alt="profile"
                width={500}
                height={500}
                className="w-[100px] p-1 sm:p-0 sm:w-full rounded-xl object-cover object-center"
                priority
                unoptimized
              />

              <Stack pt={2} spacing={3} px={1}>
                <Stack
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="start"
                >
                  <div className="text-base sm:text-xl font-[600] font-myanmarButton">
                    {escrowInfo ? escrowInfo.founderInfo.name : "--"}
                  </div>
                  <span
                    onClick={() => links(escrowInfo.founderInfo.twitter)}
                    className="hidden sm:block"
                  >
                    <XIcon className="text-lg" />
                  </span>
                </Stack>

                <div className="flex gap-4 items-end sm:min-h-[81px] !mt-11">
                  <Button
                    onClick={() => escrowInfo && links(escrowInfo.telegramLink)}
                    variant="contained"
                    className="!text-[10px] sm:!text-sm !px-10 !font-semibold !pt-3 !capitalize !bg-second !w-fit !mx-auto !pb-[.8rem]"
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
              </Stack>
            </div>
          </Card>

          <div className="sm:col-span-3">
            <Card width="lg" className=" h-72">
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

            <Card className="mt-4">
              <Button
                className="!mt-4 w-full !bg-white hover:bg-opacity-0 shadow-none !normal-case"
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

              {!applyInfo ? <Stack alignItems="center" mt={4}>
                <Button
                  variant="contained"
                  onClick={handleOpenModal}
                  className="!text-xs sm:!text-sm !font-semibold !bg-main !text-second !w-fit !normal-case !py-3 !px-8"
                >
                  Apply to work
                </Button>
              </Stack>
            :
            <Stack alignItems="center" mt={4}>
            <Button
              variant="contained"
              onClick={() => cancel_apply()}
              className="!text-xs sm:!text-sm !font-semibold !bg-main !text-second !w-fit !normal-case !py-3 !px-8"
            >
              Cancel Apply
            </Button>
          </Stack>
            }
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
              People who fill up their profile properly are likely to get hire
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