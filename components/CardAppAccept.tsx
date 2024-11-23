"use client";

import DragonImg from "@/public/dragon.jpg";
import { Button, Stack } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { escape } from "querystring";
import React from "react";

export default function CardApp({
  title,
  role,
  type,
  approve,
  reject,
  escrow,
  apply,
  escrowInfo,
  chat
}: any) {
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
      <Stack flexDirection="row" alignItems="center" gap={1}>
        <Image
          src={DragonImg}
          alt="dragon"
          className="w-20 h-14 rounded-lg object-cover object-center"
        />
        <Stack spacing={0.4}>
          <div
            className="text-base cursor-pointer font-[600] line-clamp-1"
            onClick={() => router.push("/escrow/myescrow/name/name")}
          >
            {title}
          </div>
          <div className="text-xs text-textColor font-[300] line-clamp-1">
            {role}
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
