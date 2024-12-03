"use client";

import DragonImg from "@/public/dragon.jpg";
import { Button, Stack } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { escape } from "querystring";
import React, { useState, useEffect } from "react";
import { backendApi } from "@/lib/utils/api.util";

const links = (_link: string) => {
  window.open(_link, "_blank");
};

const getImageUrl = (info: any, escrowInfo: any) => {
  console.log("Image URL check:", {
    freelancerInfo: escrowInfo?.freelancerInfo,
    userPublicKey: info?.user?.toBase58(),
    directImage: escrowInfo?.freelancerInfo?.image
  });

  if (escrowInfo?.freelancerInfo?.image && escrowInfo.freelancerInfo.image !== '') {
    return escrowInfo.freelancerInfo.image;
  }

  if (info?.user) {
    const userAddress = info.user.toBase58();
    return `https://new-nexus-platform-backend.onrender.com/api/v1/nexus-user`;
  }

  return DragonImg.src;
};

interface UserDetails {
  name: string;
  image: string;
  roles: string[];
  paymentRatePerHour?: number;
  // add other fields as needed
}

// Add interface for API response
interface ApiResponse {
  data: {
    data: Array<{
      address: string;
      name: string;
      image: string;
      roles: string[];
      paymentRatePerHour: number;
    }>;
  };
}

export default function CardAppAccept({
  title,
  role,
  type,
  approve,
  reject,
  escrow,
  apply,
  escrowInfo,
  chat,
  data
}: any) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (data?.user) {
          const response = await backendApi.get<ApiResponse>('/nexus-user');
          const users = response.data.data;
          const userDetail = users.find((user: any) => 
            user.address === data.user.toBase58()
          );
          if (userDetail) {
            setUserDetails(userDetail);
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [data?.user]);

  // Add debug log
  console.log("CardAppAccept Full Data:", {
    data,
    title,
    role,
    escrowInfo
  });

  console.log("CardAppAccept data:", {
    data,
    escrow,
    apply
  });

  console.log("Role data:", {
    freelancerInfo: escrowInfo?.freelancerInfo,
    roles: escrowInfo?.freelancerInfo?.roles,
    category: escrowInfo?.freelancerInfo?.category,
    role: role,
    data: data
  });

  console.log("Image data:", {
    freelancerImage: escrowInfo?.freelancerInfo?.image,
    fallback: DragonImg.src,
    userInfo: data?.userInfo
  });

  const handleProfileClick = () => {
    if (data?.user) {
      const userAddress = data.user.toBase58();
      const escrowAddress = escrow.toBase58();
      router.push(`/escrow/myescrow/${escrowAddress}/${userAddress}`);
    }
  };

  return (
    <>
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        className="py-4"
      >
        <Stack flexDirection="row" alignItems="start" gap={3}>
          <div className="relative w-20 h-20 overflow-hidden rounded-lg">
            <Image
              src={userDetails?.image || DragonImg.src}
              alt={title || "Applicant"}
              fill
              className="object-cover object-center"
              priority
              sizes="80px"
              onError={(e: any) => {
                e.target.src = DragonImg.src;
              }}
            />
          </div>
          <Stack spacing={1} alignItems="start" className="min-w-[120px] mt-2">
            <div
              onClick={handleProfileClick}
              className="text-base cursor-pointer font-[600] line-clamp-1 text-left hover:text-blue-600 transition-colors"
            >
              {userDetails?.name || title}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-xs text-gray-700 font-[400] line-clamp-1">
                {userDetails?.roles?.[0] || "Developer"}
              </div>
              <div className="text-[10px] text-red-500">
                Twitter not verified
              </div>
            </div>
          </Stack>
        </Stack>

        <Button
          onClick={() => links(chat)}
          variant="contained"
          className="!normal-case !text-[11px] !text-white !bg-second !px-5 !pt-2 !h-fit"
        >
          {type}
        </Button>
      </Stack>
      <div className="border-b border-gray-200" />
    </>
  );
}
