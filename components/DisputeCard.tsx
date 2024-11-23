import { Button, Stack } from "@mui/material";
import Image from "next/image";
import React from "react";

export default function DisputeCard({ title, role, image, contactLink, id }: any) {
  return (
    <div className="flex gap-4">
      <img
        src={image}
        className="w-28 h-28 rounded-xl object-cover object-center"
        alt=""
      />

      <Stack spacing={1} className="text-center" mt={1}>
        <div className="text-2xl font-semibold">{title}</div>
        <div className="text-base text-textColor">{role}</div>
        <Button
          onClick={() => contactLink(id)}
          variant="outlined"
          className="!border !border-black !text-black !text-xs !font-semibold"
        >
          {role == "Client" ?
          "Reject"
          :
          "Approve"
          }
        </Button>
      </Stack>
    </div>
  );
}
