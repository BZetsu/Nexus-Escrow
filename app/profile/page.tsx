"use client";

import Card from "@/components/Card";
import {
  Button,
  createTheme,
  Modal,
  Stack,
  TextField,
  ThemeProvider,
} from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import dragon from "@/public/dragon.svg";
import { motion } from "framer-motion";
import { cardStyle, inputMuiFontSize, inputStyle } from "@/lib/styles/styles";
import { profileOverview } from "@/lib/fakedata/Data";
import TimeZoneInput from "@/components/TimeZoneInput";
import CountryInput from "@/components/CountryInput";
import ExpertiseLevelInput from "@/components/ExpertiseLevelInput";
import { update_user } from "@/lib/user/update_user";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  notify_delete,
  notify_error,
  notify_laoding,
  notify_success,
  PROGRAM_ID,
} from "../layout";
import { get_userr_info } from "@/lib/NexusProgram/escrow/utils.ts/get_userr_info";
import { USER_PREFIX } from "@/lib/constants/constants";
import { web3 } from "@project-serum/anchor";
import { backendApi } from "@/lib/utils/api.util";
import { getFreeLacerEscrow } from "@/lib/NexusProgram/escrow/utils.ts/getFreelacerEscrow";
import XIcon from "@mui/icons-material/X";
import VerifiedIcon from '@mui/icons-material/Verified';

interface EditFormState {
  username: string;
  roleDescription: string;
  levelOfExpertise: string;
  paymentRate: string;
  profileOverview: string;
  category: string;
  country: string;
  timeZone: string;
  linkResume: string;
  linkPortfolio: string;
  twitterId: string;
  others: string;
  nigotion: boolean;
  discord_id: string;
  telegram_id: string;
  website: string;
  linkedin: string;
}

export default function page() {
  const menu = ["Profile Summary", "Nexus Jobs", "Payment History"];

  const menu1 = ["Level of expertise", "Payment rate"];

  const [tap, setTap] = useState(menu[0]);
  const [userInfo, setUserInfo] = useState<any>();
  const [ongoing, setOngoingEscrow] = useState<any>();
  const [completed, setCompletedEscrow] = useState<any>();
  const [Info, setInfo] = useState<any>();

  const address = "HxVh4haF3Uu2QibqQqinEDXGxx5ThtARA24vaMfhSCaW";

  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  const [showEdit, setShowEdit] = useState(false);

  const [editForm, setEditForm] = useState<EditFormState>({
    username: "",
    roleDescription: "",
    levelOfExpertise: "",
    paymentRate: "",
    profileOverview: profileOverview,
    category: "",
    country: "",
    timeZone: "",
    linkResume: "",
    linkPortfolio: "",
    twitterId: "",
    others: "",
    nigotion: false,
    discord_id: "",
    telegram_id: "",
    website: "",
    linkedin: ""
  });

  const theme = createTheme({
    typography: {
      fontFamily: "Myanmar Text",
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  const get_user_info = async () => {
    try {
      const [freelancer] = web3.PublicKey.findProgramAddressSync(
        [anchorWallet!.publicKey.toBuffer(), Buffer.from(USER_PREFIX)],
        PROGRAM_ID
      );

      const user_info = await get_userr_info(
        anchorWallet,
        connection,
        freelancer
      );

      const databaseEscrowInfo = await backendApi.get(
        `/nexus-user/${anchorWallet?.publicKey.toBase58()}`
      );

      await new Promise<void>((resolve) => {
        setUserInfo((databaseEscrowInfo as any).data);
        setEditForm({
          username: (databaseEscrowInfo as any)?.data?.name || "",
          roleDescription: (databaseEscrowInfo as any)?.data?.roles?.[0] || "",
          levelOfExpertise: (databaseEscrowInfo as any)?.data?.levelOfExpertise || "",
          paymentRate: (databaseEscrowInfo as any)?.data?.paymentRatePerHour || "",
          profileOverview: (databaseEscrowInfo as any)?.data?.profileOverview || "",
          category: (databaseEscrowInfo as any)?.data?.category || "",
          country: (databaseEscrowInfo as any)?.data?.country || "",
          timeZone: (databaseEscrowInfo as any)?.data?.timezone || "",
          linkResume: (databaseEscrowInfo as any)?.data?.resume || "",
          linkPortfolio: (databaseEscrowInfo as any)?.data?.portfolio || "",
          twitterId: (databaseEscrowInfo as any)?.data?.twitter || "",
          others: (databaseEscrowInfo as any)?.data?.others || "",
          nigotion: (databaseEscrowInfo as any)?.data?.negotiation || false,
          discord_id: (databaseEscrowInfo as any)?.data?.discordId || "",
          telegram_id: (databaseEscrowInfo as any)?.data?.telegramId || "",
          website: (databaseEscrowInfo as any)?.data?.website || "",
          linkedin: (databaseEscrowInfo as any)?.data?.linkedin || ""
        });
        setInfo(user_info);
        setTimeout(resolve, 500);
      });

      window.dispatchEvent(new CustomEvent('userInfoUpdated', { 
        detail: (databaseEscrowInfo as any).data 
      }));

    } catch (e) {
      console.log(e);
    }
  };

  const getOngoingEscrow = async () => {
    try {
      const ongoing = await getFreeLacerEscrow(
        anchorWallet,
        connection,
        "confirmed"
      );
      console.log("ongoing");
      console.log(ongoing);
      setOngoingEscrow(ongoing.filter((escrow) => escrow.status !== 3));
      setCompletedEscrow(ongoing.filter((escrow) => escrow.status === 3));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!anchorWallet) return;
    get_user_info();
    getOngoingEscrow();
  }, [anchorWallet]);

  useEffect(() => {
    const fixImageUrl = async () => {
      if (!userInfo?.image || 
          userInfo.image === 'https://www.youtube.com/' || 
          !userInfo.image.startsWith('http')) {
        try {
          await updateImageInDatabase("https://res.cloudinary.com/tech-aku/image/upload/v1731698489/Uploads/tvko7orf3xpcuhjizbs9.jpg");
        } catch (error) {
          console.error("Failed to update image URL:", error);
        }
      }
    };

    if (userInfo) {
      fixImageUrl();
    }
  }, [userInfo]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      notify_laoding("Updating Profile...");

      const res = await update_user(
        anchorWallet,
        connection,
        editForm.username,
        userInfo?.image || "https://res.cloudinary.com/tech-aku/image/upload/v1731698489/Uploads/tvko7orf3xpcuhjizbs9.jpg",
        editForm.category,
        editForm.roleDescription,
        editForm.levelOfExpertise,
        editForm.others,
        editForm.profileOverview,
        Number(editForm.paymentRate),
        editForm.nigotion,
        editForm.linkResume,
        editForm.linkPortfolio,
        editForm.discord_id,
        editForm.telegram_id,
        editForm.website,
        editForm.linkedin,
        editForm.twitterId,
        editForm.country,
        editForm.timeZone,
        wallet
      );

      await get_user_info();
      
      notify_delete();
      notify_success("Profile Updated!");
      setShowEdit(false);

    } catch (e) {
      notify_delete();
      notify_error("Profile Update Failed!");
      console.log(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const output = (value: string | undefined | null, name: string) => {
    if (name === "Payment Rate") {
      return value || "0";
    }
    
    return value && value.length > 0 ? value : name;
  };

  const stringLengthHandle = (string: string) => {
    if (string && string.length > 25) {
      return string.slice(0, 20) + "..." + string.slice(string.length - 4);
    }
    return string;
  };

  const updateImageInDatabase = async (newImageUrl: string) => {
    try {
      const response = await backendApi.patch(
        `/nexus-user/${anchorWallet?.publicKey.toBase58()}`,
        {
          image: newImageUrl
        }
      );
      await get_user_info();
      
      return response;
    } catch (error) {
      console.error("Error updating image in database:", error);
      throw error;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        notify_laoding("Uploading image...");

        const formData = new FormData();
        formData.append("uploadedFile", file);

        interface UploadResponse {
          data: {
            metaData: {
              url: string;
            };
          };
        }

        // 1. Upload image to storage
        const response = await backendApi.post<UploadResponse>(
          "/bucket/upload",
          formData,
          {
            headers: { 
              "Content-Type": "multipart/form-data" 
            }
          }
        );

        if (!response?.data?.metaData?.url) {
          throw new Error('Failed to get image URL from upload');
        }

        const newImageUrl = response.data.metaData.url;

        // 2. Update database
        await updateImageInDatabase(newImageUrl);
        
        // 3. Update blockchain
        await update_user(
          anchorWallet,
          connection,
          userInfo.name,
          newImageUrl,
          userInfo.category,
          userInfo.roles[0],
          userInfo.levelOfExpertise,
          userInfo.others || "",
          userInfo.profileOverview,
          Number(userInfo.paymentRatePerHour),
          userInfo.negotiation || false,
          userInfo.resume || "",
          userInfo.portfolio || "",
          userInfo.discordId || "",
          userInfo.telegramId || "",
          userInfo.website || "",
          userInfo.linkedin || "",
          userInfo.twitter || "",
          userInfo.country || "",
          userInfo.timeZone || "",
          wallet
        );
        
        notify_delete();
        notify_success("Profile picture updated successfully!");
        
        await get_user_info();

      } catch (error) {
        console.error('Error uploading image:', error);
        notify_delete();
        notify_error("Failed to update profile picture");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-5">
      <div className="col-span-1 md:col-span-2">
        <Card className="!p-0 
          !h-[10rem]                        
          [@media(max-width:620px)]:!h-[9rem]  
          [@media(max-width:520px)]:!h-[8.5rem]
          [@media(max-width:420px)]:!h-[8rem]
          [@media(max-width:320px)]:!h-[7.5rem]
          sm:!h-[18rem]                     
          md:!h-[22rem]                     
          lg:!h-[28rem]"
        >
          <div className="!flex sm:!flex-col h-full">
            <div className="relative w-[50%] sm:w-full h-full">
              <div className="!px-[0.8rem] pt-[0.8rem] rounded-xl w-full sm:w-auto h-[calc(100%-2rem)] relative group">
                <Image
                  src={(() => {
                    const imageUrl = userInfo?.image || dragon.src;
                    return imageUrl;
                  })()}
                  alt="Profile"
                  width={500}
                  height={350}
                  className="w-full h-full object-cover rounded-xl 
                    max-w-[250px] min-h-[140px]           
                    [@media(max-width:620px)]:min-h-[120px]
                    [@media(max-width:520px)]:min-h-[110px]
                    [@media(max-width:420px)]:min-h-[100px]
                    [@media(max-width:320px)]:min-h-[90px]
                    sm:max-w-full sm:h-[80px]        
                    md:h-[280px]         
                    lg:h-[300px]"
                  priority
                  unoptimized
                />
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-3 right-4 
                    sm:-bottom-3 sm:right-4
                    hidden sm:flex sm:items-center sm:gap-2
                    opacity-0 group-hover:opacity-100
                    bg-white/90 hover:bg-white
                    shadow-lg hover:shadow-xl
                    rounded-md px-4 py-2
                    text-sm font-semibold
                    transform translate-y-1 group-hover:translate-y-0
                    transition-all duration-200 ease-in-out"
                >
                  {isUploading ? "Uploading..." : "Change Profile Picture"}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-3 right-4
                    sm:hidden
                    bg-white/90 hover:bg-white
                    shadow-lg hover:shadow-xl
                    rounded-full p-2.5
                    transition-all duration-200 ease-in-out"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 px-4 pb-6">
              <div className="text-2xl sm:text-3xl md:text-4xl font-[600] line-clamp-1 font-myanmar px-3 pt-4">
                {userInfo?.name || "Name"}
              </div>

              <div className="w-full -mt-1">
                <div className="border border-gray-200 rounded-md px-3 py-3  
                  w-full flex justify-between items-center 
                  bg-white/50 backdrop-blur-sm">
                  <div className="text-sm sm:text-base md:text-lg text-black/80 font-medium">
                    {userInfo?.roles?.[0] || "Role"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => userInfo?.twitter && window.open(userInfo.twitter, '_blank')}
                      className="hover:text-blue-500 transition-colors cursor-pointer"
                    >
                      <XIcon className="text-lg hover:text-blue-500 transition-colors" />
                    </span>
                    <span className="cursor-pointer">
                      <VerifiedIcon 
                        className={`text-lg ${userInfo?.isVerified ? 'text-blue-500' : 'text-gray-400'} 
                        hover:text-blue-500 transition-colors`} 
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 mt-[14px] ">
          <div className={`${cardStyle} !py-4 !text-[#575757] font-semibold`}>
            {userInfo && output(userInfo.levelOfExpertise, "Level Of Expertise")}
          </div>
          <div className={`${cardStyle} !py-4 !text-[#575757] font-semibold flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <img 
                alt="coin" 
                width="37" 
                height="32" 
                className="w-6 h-6 -translate-y-[2px]"
                src="/_next/static/media/coin.0c914039.svg" 
              />
              <span className="flex items-center translate-y-[1px]">
                {userInfo && (Number(userInfo.paymentRatePerHour) || 0)}
              </span>
            </div>
            <span className="text-sm text-gray-500 translate-y-[2px]">/month</span>
          </div>
        </div>
      </div>

      <div className="cls-span-1 md:col-span-3">
        <Card className="rounded-b-none !p-0 border-b-2" width="lg">
          <div className="flex justify-between items-center">
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
                    } !normal-case !text-[10px] md:!text-xs !py-3 sm:!py-5 !px-2 sm:!px-4 ${
                      tap === el && "!text-black !font-semibold !font-myanmar"
                    }`}
                  >
                    {el}
                  </Button>
                </div>
              ))}
            </Stack>

            {tap === menu[0] && (
              <Button
                variant="contained"
                onClick={() => setShowEdit(true)}
                className="!text-gray-800 !mx-2 sm:!mx-4 !bg-white hover:!bg-gray-50 !px-2 sm:!px-3 !py-1 sm:!py-2 !text-[10px] sm:!text-xs !normal-case !shadow-md hover:!shadow-lg !border !border-gray-100"
              >
                Edit Profile
              </Button>
            )}
          </div>
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
            <Card className="rounded-t-none pb-2 !h-[5rem] sm:!h-[6rem]" width="lg">
              <div className="flex flex-row justify-center items-center gap-8 py-1 sm:py-2 font-myanmar_khyay">
                <div className="text-base sm:text-xl">
                  <span className="font-[500]">{ongoing ? ongoing.length : "--"}</span>
                  <span className="text-gray-500"> Ongoing Jobs</span>
                </div>
                <div className="text-base sm:text-xl">
                  <span className="font-[500]">{completed ? completed.length : "--"}</span>
                  <span className="text-gray-500"> Jobs Completed</span>
                </div>
              </div>
            </Card>

            <Card className="mt-4 !h-[13rem]" width="lg">
              <div className="text-xs text-textColor">Profile Overview</div>
              <div className="text-sm leading-6 line-clamp-[6] mt-2">
                {userInfo && userInfo.profileOverview}
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-[14px] px-1">
              <div className={`${cardStyle} !py-4 !text-[#575757] font-semibold`}>
                {userInfo && output(userInfo.category, "Category")}
              </div>
              <div className={`${cardStyle} !py-4 !text-[#575757] font-semibold`}>
                {userInfo && output(userInfo.country, "Country")}
              </div>
              <div className={`${cardStyle} !py-4 !text-[#575757] font-semibold`}>
                {userInfo && output(userInfo.timeZone, "Time Zone")}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 px-1">
              <div className={`${cardStyle} !py-4 !text-[#575757] font-semibold`}>
                {userInfo && stringLengthHandle(output(userInfo.portfolio, "Portfolio")!)}
              </div>
              <div className={`${cardStyle} !py-4 !text-[#575757] font-semibold`}>
                {userInfo && stringLengthHandle(output(userInfo.resume, "Resume")!)}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ThemeProvider theme={theme}>
        <Modal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          className="grid place-items-center overflow-y-scroll"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}>
            <Card width="md">
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField
                    label="Username"
                    variant="outlined"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    sx={inputMuiFontSize}
                  />

                  <div className="relative flex items-center">
                    <TextField
                      label="Twitter Id"
                      variant="outlined"
                      value={editForm.twitterId}
                      onChange={(e) =>
                        setEditForm({ ...editForm, twitterId: e.target.value })
                      }
                      sx={inputMuiFontSize}
                      style={{ width: "20rem" }}
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                      <span
                        onClick={() => editForm.twitterId && window.open(editForm.twitterId, '_blank')}
                        className="hover:text-blue-500 transition-colors cursor-pointer"
                      >
                        <XIcon className="text-lg hover:text-blue-500 transition-colors" />
                      </span>
                      <span className="cursor-pointer">
                        <VerifiedIcon 
                          className={`text-lg ${userInfo?.isVerified ? 'text-blue-500' : 'text-gray-400'} 
                          hover:text-blue-500 transition-colors`} 
                        />
                      </span>
                    </div>
                  </div>
                </Stack>

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
                  <TextField
                    label="Role Description"
                    variant="outlined"
                    value={editForm.roleDescription}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        roleDescription: e.target.value,
                      })
                    }
                    sx={inputMuiFontSize}
                  />

                  <ExpertiseLevelInput
                    editForm={editForm}
                    setEditForm={setEditForm}
                  />

                  <TextField
                    label="Payment Rate"
                    variant="outlined"
                    value={editForm.paymentRate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, paymentRate: e.target.value })
                    }
                    sx={inputMuiFontSize}
                  />
                </div>

                <TextField
                  label="Profile Overveiw"
                  variant="outlined"
                  multiline
                  rows={6}
                  value={editForm.profileOverview}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      profileOverview: e.target.value,
                    })
                  }
                  sx={inputMuiFontSize}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <TextField
                    label="Category"
                    variant="outlined"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    sx={inputMuiFontSize}
                  />

                  <CountryInput editForm={editForm} setEditForm={setEditForm} />

                  <TimeZoneInput
                    editForm={editForm}
                    setEditForm={setEditForm}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <TextField
                    label="Link Resume"
                    variant="outlined"
                    value={editForm.linkResume}
                    onChange={(e) =>
                      setEditForm({ ...editForm, linkResume: e.target.value })
                    }
                    sx={inputMuiFontSize}
                  />

                  <TextField
                    label="Link Portfolio"
                    variant="outlined"
                    value={editForm.linkPortfolio}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        linkPortfolio: e.target.value,
                      })
                    }
                    sx={inputMuiFontSize}
                  />
                </div>

                <Button
                  type="submit"
                  variant="contained"
                  className="!mt-8 !text-black !bg-main !text-xs !px-6 !py-2 !normal-case !w-fit !mx-auto !font-mynamarButton"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </Stack>
            </Card>
          </form>
        </Modal>
      </ThemeProvider>
    </div>
  );
}
