"use client";

import DragonImg from "@/public/dragon.jpg";
import { Button, Stack } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { escape } from "querystring";
import React, { useState } from "react";

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
    return `https://new-nexus-platform-backend.onrender.com/api/v1/bucket/upload/${userAddress}`;
  }

  return DragonImg.src;
};

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

  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack flexDirection="row" alignItems="start" gap={1}>
        <div className="relative w-20 h-14">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
          )}
          <Image
            src={getImageUrl(data, escrowInfo)}
            alt={title || "Applicant"}
            width={80}
            height={56}
            className={`w-20 h-14 rounded-lg object-cover object-center transition-opacity duration-200 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            priority
            unoptimized
            onError={(e) => {
              console.log("Image load error for:", e.currentTarget.src);
              e.currentTarget.src = DragonImg.src;
              setImageLoaded(true);
            }}
            onLoad={() => {
              console.log("Image loaded successfully");
              setImageLoaded(true);
            }}
          />
        </div>
        <Stack spacing={0.4} alignItems="start" className="min-w-[120px]">
          <div
            className="text-base cursor-pointer font-[600] line-clamp-1 text-left"
            onClick={() => {
              if (data?.user) {
                const userAddress = data.user.toBase58();
                const escrowAddress = escrow.toBase58();
                console.log("Navigation:", { userAddress, escrowAddress });
                router.push(`/escrow/myescrow/${escrowAddress}/${userAddress}`);
              }
            }}
          >
            {title}
          </div>
          <div className="text-xs text-gray-700 font-[400] line-clamp-1">
            {data?.role || escrowInfo?.freelancerInfo?.roles?.[0] || "Developer"}
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
      {/* {escrowInfo && escrowInfo.status == 9 && (
        <>
          <Button
            onClick={() => approve()}
            variant="contained"
            className="!normal-case !text-xs !text-white !font-semibold !bg-second !px-5 !py-2 !h-fit"
          >
            Approve
          </Button>
          <Button
            onClick={() => reject()}
            variant="contained"
            className="!normal-case !text-xs !text-white !font-semibold !bg-second !px-5 !py-2 !h-fit"
          >
            Reject
          </Button>
        </>
      )} */}
    </Stack>
  );
}
