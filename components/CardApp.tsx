"use client";

import DragonImg from "@/public/dragon.jpg";
import { Button, Stack } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { escape } from "querystring";
import React from "react";

export default function CardApp({
  data,
  title,
  role,
  type,
  approve,
  escrow,
  apply,
  link,
  type2 = false,
  startProject,
  setSelect
}: any) {
  console.log("CardApp Full Data:", {
    data,
    title,
    role
  });

  const links = (_link: string) => {
    window.open(_link, "_blank");
  };

  const router = useRouter();
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack flexDirection="row" alignItems="start" gap={1}>
        <Image
          src={data?.userInfo?.image || DragonImg.src}
          alt={title || "Applicant"}
          width={80}
          height={56}
          className="w-20 h-14 rounded-lg object-cover object-center"
          priority
          unoptimized
          onError={(e) => {
            e.currentTarget.src = DragonImg.src;
          }}
        />
        <Stack spacing={0.4} alignItems="start" className="min-w-[120px]">
          <div className="text-base cursor-pointer font-[600] line-clamp-1 text-left">
            {title}
          </div>
          <div className="text-xs text-gray-700 font-[400] line-clamp-1">
            {data?.role || role || "Developer"}
          </div>
        </Stack>
      </Stack>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => links(link)}
          variant="contained"
          className="!normal-case !text-[11px] !text-white  !bg-second !px-4  !pt-2"
        >
          {type}
        </Button>

        {type2 && (
          <Button
            variant="outlined"
            onClick={() => {
              startProject()
              setSelect(apply)
            }
          }
            className="!normal-case !text-[11px] !border !border-black !text-second !px-4 !pt-2"
          >
            {type2}
          </Button>
        )}
      </div>
    </Stack>
  );
}
