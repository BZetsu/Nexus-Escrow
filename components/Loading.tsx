import React from "react";
import { FadeLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="flex justify-center items-center flex-1 h-full min-h-[70vh]">
      <FadeLoader color="#8B8B8B" />
    </div>
  );
}
