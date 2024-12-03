"use client";

import { Button, Stack } from "@mui/material";
import React, { useMemo, useState } from "react";
import TimezoneSelect, { type ITimezone } from "react-timezone-select";
import { FaXTwitter } from "react-icons/fa6";
import { inputStyle } from "@/lib/styles/styles";
import { useRouter } from "next/navigation";

export default function ThirdForm({ handleGoToStep }: any) {
  const router = useRouter();
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const [twitterUsername, setTwitterUsername] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyTwitter = async () => {
    if (!twitterUsername) return;
    setIsVerifying(true);
    try {
      // Add your verification logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsVerified(true);
    } catch (error) {
      console.error('Twitter verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Stack gap={3} alignItems="center" className="py-10">
      <div className="mt-2">
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
          <textarea
            rows={3}
            className="block flex-1 border-0 bg-transparent w-[90vw] sm:w-[350px] md:w-[600px] py-2 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 outline-none sm:text-sm sm:leading-6"
            placeholder="Profile Overview"
          />
        </div>
      </div>

      <div className="mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-8 w-[90vw] sm:w-[450px] md:w-[600px]">
          <input className={`${inputStyle}`} placeholder="Category" />

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <FaXTwitter className="text-gray-400" />
            </div>
            <input
              className={`${inputStyle} pl-10 pr-20`}
              placeholder="Twitter Username"
              value={twitterUsername}
              onChange={(e) => setTwitterUsername(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {isVerified ? (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <button
                  onClick={verifyTwitter}
                  disabled={isVerifying || !twitterUsername}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    isVerifying || !twitterUsername
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isVerifying ? '...' : 'Verify'}
                </button>
              )}
            </div>
          </div>

          <TimezoneSelect
            placeholder="time zone"
            value={selectedTimezone}
            onChange={setSelectedTimezone}
          />
        </div>
      </div>

      <div className="mt-2">
        <div className="flex flex-wrap w-[90vw] sm:w-[450px] md:w-[600px] gap-y-8 gap-x-3">
          <input className={inputStyle} placeholder="Level of expertise" />

          <input className={inputStyle} placeholder="Level of expertise" />
        </div>
      </div>

      <div className="mt-2">
        <div className="flex flex-wrap w-[90vw] sm:w-[450px] md:w-[600px] gap-y-8 gap-x-3">
          <input className={inputStyle} placeholder="Link Resume" />

          <input className={inputStyle} placeholder="Link Resume" />
        </div>
      </div>

      <Button
        className="!bg-main !font-semibold !text-second !text-base !capitalize !px-12 !mt-8"
        variant="contained"
        onClick={() => {
          handleGoToStep("first");
          router.push("/escrow");
        }}
      >
        Submit
      </Button>
    </Stack>
  );
}