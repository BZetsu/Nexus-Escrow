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
import { usePathname, useRouter } from "next/navigation";
import { getFreelancerEscrowAddress } from "@/lib/NexusProgram/escrow/utils.ts/getFreelancerEscrowAddress";
import { get_apply_info } from "@/lib/NexusProgram/escrow/utils.ts/get_apply_info";
import VerifiedIcon from '@mui/icons-material/Verified';

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

const getLevelColor = (level: string) => {
  switch(level?.toLowerCase()) {
    case 'intermediate':
      return 'bg-blue-500';
    case 'expert':
      return 'bg-green-500';
    case 'entry level':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

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
  const router = useRouter();

  const handleProfileClick = (userId: string) => {
    router.push(`/escrow/myescrow/${pathname.split('/')[3]}/${userId}`);
  };

  const get_user_info = async () => {
    try {
      const pathSegments = pathname.split('/');
      const userId = pathSegments[pathSegments.length - 1];
      console.log("Looking up userId:", userId);

      // Get all users and filter
      const response = await backendApi.get('/nexus-user');
      console.log("Database response:", response);

      // Find the specific user with matching userId
      const userData = (response as any)?.data?.find(
        (user: any) => user.userId === userId
      );

      if (!userData) {
        console.log("No user found with userId:", userId);
        return;
      }

      console.log("Found user in database:", userData);
      setUserInfo(userData);

      if (!userData.address) {
        console.log("No wallet address found for user");
        return;
      }

      // For Zetsu 3, this should be "8in9sHxip8WUFbc9xaSYPUB1uTQhqgZJ9NZarSy4ecHt"
      console.log("Using wallet address for blockchain lookup:", userData.address);
      const freelancerPubKey = new web3.PublicKey(userData.address);
      const [userPDA] = web3.PublicKey.findProgramAddressSync(
        [freelancerPubKey.toBuffer(), Buffer.from(USER_PREFIX)],
        PROGRAM_ID
      );

      const freelancer_info = await get_userr_info(
        anchorWallet,
        connection,
        userPDA
      );

      console.log("Blockchain data for user:", freelancer_info);
      setInfo(freelancer_info);

    } catch (e) {
      console.log("Error in get_user_info:", e);
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
          <div className="w-[95%] rounded-xl mx-auto mt-3 relative h-[250px]">
            <Image 
              src={userInfo?.image || dragon.src}
              alt="Profile"
              fill
              className="object-cover rounded-xl"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          <Stack pt={3} pb={2} spacing={3} px={2}>
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <div className="text-xl font-[600] line-clamp-1 font-mynamarButton">
              {userInfo && output(userInfo.name, "Name")}
              </div>

              <Stack
                flexDirection="row"
                gap={0.4}
                alignItems="center"
                className="text-sm font-[600]"
              >
                <div className="w-[1.2rem]">
                  <Image src={coin} alt="coin" />
                </div>
                <div className="pt-[.5rem]">
                  <span>             
                    {userInfo && Number(userInfo.paymentRatePerHour || 0)}
                  </span>
                  <span> / Month</span>
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
              className="text-sm"
            >
              <div className="text-textColor">
              {userInfo && output(userInfo.roles[0], "Role")}
              </div>
              <div className={`px-2 py-1 text-white rounded-md text-[11px] ${getLevelColor(userInfo?.levelOfExpertise)}`}>
                {userInfo && output(userInfo.levelOfExpertise, "Level")}
              </div>
            </Stack>
            <div className="flex items-center gap-2">
              {userInfo && (
                <span
                  onClick={() => handleProfileClick(userInfo.userId)}
                  className="hover:text-blue-500 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <XIcon className="text-2xl" />
                  <VerifiedIcon 
                    className={`text-xl ${userInfo.isVerified ? 'text-blue-500' : 'text-gray-400'}`} 
                  />
                </span>
              )}
            </div>
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
                className="text-base font-[500]"
                flexDirection="row"
                gap={4}
                justifyContent="center"
                alignContent="center"
                py={2}
              >
                <div className="font-mynamarButton">
                  {ongoing ? ongoing.length : "--"} Ongoing Jobs
                </div>
                <div className="font-mynamarButton">
                  {completed ? completed.length : "--"} Jobs Completed
                </div>
              </Stack>
            </Card>

            <Card className="mt-5 h-[15rem]">
              <div className="text-xs text-textColor">Profile Overview</div>
              <div className="text-sm leading-6 line-clamp-5 mt-2">
                {userInfo && userInfo.profileOverview}
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 px-1">
              <div className={`${cardStyle} !py-4 !text-black`}>
                {userInfo && output(userInfo.category, "Category")}
              </div>
              <div className={`${cardStyle} !py-4 !text-black`}>
                {userInfo && output(userInfo.country, "Country")}
              </div>
              <div className={`${cardStyle} !py-4 !text-black`}>
                {userInfo && output(userInfo.timezone, "Time Zone")}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 px-1">
              <Button
                onClick={() => userInfo?.portfolio && window.open(userInfo.portfolio, '_blank')}
                variant="outlined"
                className="!normal-case !py-4 !text-black hover:!bg-gray-50 !border-2 !border-gray-300 !rounded-xl !bg-white !font-semibold !shadow-sm"
              >
                Portfolio
              </Button>
              <Button
                onClick={() => userInfo?.resume && window.open(userInfo.resume, '_blank')}
                variant="outlined"
                className="!normal-case !py-4 !text-black hover:!bg-gray-50 !border-2 !border-gray-300 !rounded-xl !bg-white !font-semibold !shadow-sm"
              >
                Resume
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}