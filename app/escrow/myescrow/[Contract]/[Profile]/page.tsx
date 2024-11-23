"use client";

import Card from "@/components/Card";
import { Button, Stack } from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import coin from "@/public/coin.svg";
import dragon from "@/public/dragon.svg";
import XIcon from "@mui/icons-material/X";
import { motion } from "framer-motion";
import { TiMessages } from "react-icons/ti";
import { FaListUl, FaStar, FaVideo } from "react-icons/fa";
import { buttonType } from "@/lib/types/types";
import { cardStyle } from "@/lib/styles/styles";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { USER_PREFIX } from "@/lib/constants/constants";
import { web3 } from "@project-serum/anchor";
import { links, PROGRAM_ID } from "@/app/layout";
import { get_userr_info } from "@/lib/NexusProgram/escrow/utils.ts/get_userr_info";
import { backendApi } from "@/lib/utils/api.util";
import { getFreeLacerEscrow } from "@/lib/NexusProgram/escrow/utils.ts/getFreelacerEscrow";
import { usePathname } from "next/navigation";
import { getFreelancerEscrowAddress } from "@/lib/NexusProgram/escrow/utils.ts/getFreelancerEscrowAddress";
import { get_apply_info } from "@/lib/NexusProgram/escrow/utils.ts/get_apply_info";

const buttons: buttonType[] = [
  { title: "Message", icon: <TiMessages /> },
  { title: "Shedule Interview", icon: <FaVideo /> },
  { title: "Review", icon: <FaStar /> },
  { title: "Add to watchlist", icon: <FaListUl /> },
];

interface DatabaseResponse {
  data: {
    name: string;
    roles: string[];
    levelOfExpertise: string;
    paymentRatePerHour: number;
    profileOverview: string;
    category: string;
    portfolio: string;
    resume: string;
    twitter: string;
    image: string;
  }
}

export default function page() {
  const menu = ["Profile Summary", "Nexus Jobs"];

  const [tap, setTap] = useState(menu[0]);
  const [userInfo, setUserInfo] = useState<any>();
  const [ongoing, setOngoingEscrow] = useState<any[]>();
  const [completed, setCompletedEscrow] = useState<any[]>();
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const pathname = usePathname();
  const [Info, setInfo] = useState<any>();

  const get_user_info = async () => {
    try {
      // Get the freelancer's address from the URL
      const pathSegments = pathname.split('/');
      const freelancerAddress = pathSegments[pathSegments.length - 1];
      console.log("Freelancer address:", freelancerAddress);

      if (!freelancerAddress) {
        console.log("No freelancer address found");
        return;
      }

      // Get freelancer's blockchain info first
      const freelancerPubKey = new web3.PublicKey(freelancerAddress);
      const [userPDA] = web3.PublicKey.findProgramAddressSync(
        [freelancerPubKey.toBuffer(), Buffer.from(USER_PREFIX)],
        PROGRAM_ID
      );

      const freelancer_info = await get_userr_info(
        anchorWallet,
        connection,
        userPDA
      );

      console.log("Freelancer blockchain info:", freelancer_info);
      setInfo(freelancer_info);

      // Get freelancer's database info using their public key
      const databaseEscrowInfo = await backendApi.get(
        `/nexus-user/${freelancerPubKey.toBase58()}`
      );

      console.log("Freelancer database info:", databaseEscrowInfo);

      // Set database info with proper error handling
      if ((databaseEscrowInfo as any)?.data) {
        await new Promise(resolve => {
          setUserInfo((databaseEscrowInfo as any).data);
          setTimeout(resolve, 500);
        });
      }

    } catch (e) {
      console.log("Error fetching freelancer info:", e);
    }
  };

  const getOngoingEscrow = async () => {
    try {
      const pathSegments = pathname.split('/');
      const freelancerAddress = pathSegments[pathSegments.length - 1];
      if (!freelancerAddress) return;
      
      const freelancerPubKey = new web3.PublicKey(freelancerAddress);
      
      // Add delay and retry logic with exponential backoff
      const getEscrows = async (retries = 3, delay = 2000) => {
        try {
          // Add initial delay
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return await getFreelancerEscrowAddress(
            freelancerPubKey,
            connection,
            "finalized" // Use finalized to reduce load
          );
        } catch (err: any) {
          if (retries > 0 && err.toString().includes('429')) {
            console.log(`Retrying after ${delay}ms delay... (${retries} retries left)`);
            // Exponential backoff
            return getEscrows(retries - 1, delay * 2);
          }
          throw err;
        }
      };

      const ongoing = await getEscrows();
      
      if (ongoing) {
        // Process in batches to avoid rate limits
        const processEscrows = (escrows: any[]) => {
          const ongoingEscrows = escrows.filter((escrow) => escrow.status !== 3);
          const completedEscrows = escrows.filter((escrow) => escrow.status === 3);
          
          setOngoingEscrow(ongoingEscrows);
          setCompletedEscrow(completedEscrows);
        };

        processEscrows(ongoing);
      }
      
    } catch (e) {
      console.log("Error fetching ongoing escrows:", e);
    }
  };

  useEffect(() => {
    if (!anchorWallet) return;
    get_user_info();
    getOngoingEscrow()
  }, [anchorWallet])

  const output = (value: string | undefined, name: string) => {
    if (value && value.length > 0) {
      return value;
    }
    return name;  // Return the name as fallback
  };
  
  const stringLengthHandle = (string: string | undefined | null) => {
    if (!string) return "";
    
    if (string.length > 25) {
      return (
        string.slice(0, 20) + 
        "..." + 
        string.slice(string.length - 4, string.length)
      );
    }
    return string;
  };
  

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-5 !mb-16">
      <div className="col-span-1 md:col-span-2">
        <Card className="!p-0 overflow-hidden">
          <div className="w-full rounded-xl m-[auto] px-[0.8rem] pt-[0.8rem] ">
            <Image 
              src={(() => {
                const imageUrl = userInfo?.image || dragon.src;
                console.log("Rendering freelancer image with URL:", imageUrl);
                return imageUrl;
              })()} 
              alt="Profile"
              width={500}
              height={350}
              className="w-full h-auto object-cover rounded-xl"
              priority
              unoptimized
            />
          </div>

          <Stack pt={3} pb={2} spacing={3} px={2}>
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <div className="text-lg font-[500] line-clamp-1 font-mynamarButton">
              {userInfo && output(userInfo.name, "Name")}
              </div>

              <Stack
                flexDirection="row"
                gap={0.4}
                alignItems="center"
                className="text-sm font-[500]"
              >
                <div className="w-[1.2rem]">
                  <Image src={coin} alt="coin" />
                </div>
                <div className="pt-[.5rem]">
                  <span>             
                    {userInfo && Number(userInfo.paymentRatePerHour)}
                  </span>
                  <span> / Hour</span>
                </div>
              </Stack>
            </Stack>
          </Stack>

          <Stack
            py={2}
            px={2.5}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack
              flexDirection="row"
              gap={2}
              alignItems="center"
              className="text-xs"
            >
              <div className="text-textColor">
              {userInfo && output(userInfo.roles[0], "Role")}
              </div>
              <div className="px-4 py-2 bg-[#1DA1F2] text-black font-[500] rounded">
              {userInfo && output(userInfo.levelOfExpertise, "Level Of Expertise")}
              </div>
            </Stack>
              {userInfo && <span
              onClick={() => links(userInfo.twitter)}
              >
            <XIcon className="text-2xl" />

              </span>}
          </Stack>
        </Card>

        {/* <div className="grid grid-cols-2 gap-4 mt-4 ">
          {buttons.map((bt, index) => (
            <motion.button
              whileTap={{ scale: 0.98 }}
              key={index}
              className="text-sm"
            >
              <Card>
                <Stack
                  flexDirection="row"
                  gap={1}
                  justifyContent="center"
                  alignItems="center"
                >
                  <div className="text-lg">{bt.icon}</div>

                  <div className="line-clamp-1">{bt.title}</div>
                </Stack>
              </Card>
            </motion.button>
          ))}
        </div> */}
      </div>

      <div className="cls-span-1 md:col-span-3">
        <Card className="rounded-b-none px-0 border-b-2 pb-0 pt-[0.2rem]">
          <Stack flexDirection="row">
            {menu.map((el, i) => (
              <div
                key={i}
                className={`${
                  tap === el &&
                  "border-b-4 border-black transition-all duration-300 ease-in-out"
                }`}
              >
                <Button
                  variant="text"
                  disabled={tap === el}
                  onClick={() => setTap(el)}
                  className={`${
                    tap === el ? "!text-black/70" : "!text-gray-400"
                  } !normal-case md:!text-xs !text-sm !py-3 !px-4 ${
                    tap === el && "!text-black !font-semibold"
                  }`}
                >
                  {el}
                </Button>
              </div>
            ))}
          </Stack>
        </Card>
        {tap === menu[0] && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              type: "spring",
              stiffness: 200,
            }}
          >
            <Card className="rounded-t-none pb-2">
              <Stack
                className="text-lg sm:text-2xl font-[500]"
                flexDirection="row"
                gap={6}
                justifyContent="center"
                alignContent="center"
                py={3}
              >
            <div>{ongoing ? ongoing.length : "--"} Ongoing Jobs</div>
            <div>{completed ? completed.length : "--"} Jobs Completed</div>
              </Stack>

              <div className="px-1 mt-4 text-xs text-textColor font-[500]">
                0 Leaderboard Ratings
              </div>
            </Card>

            <Card className="mt-5 h-[15rem]">
              <div className="text-xs text-textColor">Profile Overview</div>
              <div className="text-sm leading-6 line-clamp-5 mt-2">
              {userInfo && userInfo.profileOverview}
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 px-1">
            <div className={`${cardStyle} !py-4`}>{userInfo && output(userInfo.category, "Category")}</div>
              {/* <div className={`${cardStyle} !py-4`}>{userInfo && output(userInfo.country, "Country")}</div> */}
              {/* <div className={`${cardStyle} !py-4`}>{userInfo && output(userInfo.timezone, "Time Zone")}</div> */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 px-1">
            <div className={`${cardStyle} !py-4`}>{userInfo && stringLengthHandle(output(userInfo.portfolio, "Portfolio")!)}</div>
            <div className={`${cardStyle} !py-4`}>{userInfo && stringLengthHandle(output(userInfo.resume, "Resume")!)}</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
