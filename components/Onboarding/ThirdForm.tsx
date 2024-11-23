"use client";

import { Button, Stack } from "@mui/material";
import React, { useMemo, useState } from "react";
import TimezoneSelect, { type ITimezone } from "react-timezone-select";
import Select from "react-select";
import countryList from "react-select-country-list";
import { useRouter } from "next/navigation";
import { inputStyle } from "@/lib/styles/styles";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { notify_delete, notify_error, notify_laoding, notify_success } from "@/app/loading";
import { backendApi } from "@/lib/utils/api.util";
import { update_user } from "@/lib/user/update_user";

export default function ThirdForm({ handleGoToStep }: any) {
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [profileOverview, setProfileOverview] = useState("");
  const [category, setCategory] = useState("");
  const [expertise, setExpertise] = useState("");
  const [resume, setResume] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [value, setValue] = useState("");
  const [paymentRate, setPaymentRate] = useState<string>("");
  
  const options: any = useMemo(() => countryList().getData(), []);
  const router = useRouter();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const wallet = useWallet();

  const changeHandler = (value: any) => {
    setValue(value);
  };

  const handleSubmit = async () => {
    try {
      notify_laoding("Saving profile...");

      // First update blockchain
      const tx = await update_user(
        anchorWallet,
        connection,
        "User",
        "https://res.cloudinary.com/tech-aku/image/upload/v1731698489/Uploads/tvko7orf3xpcuhjizbs9.jpg",
        category || "",
        "Freelancer",
        expertise || "",
        "",
        profileOverview || "",
        paymentRate ? Number(paymentRate) : 0,
        false,
        resume || "",
        portfolio || "",
        "",
        "",
        "",
        "",
        "",
        value?.value || "",
        selectedTimezone?.toString() || "",
        wallet
      );

      // Then update database
      await backendApi.patch(
        `/nexus-user/${anchorWallet?.publicKey.toBase58()}`,
        {
          timeZone: selectedTimezone?.toString() || "",
          country: value?.value || "",
          category: category || "",
          levelOfExpertise: expertise || "",
          profileOverview: profileOverview || "",
          resume: resume || "",
          portfolio: portfolio || "",
          paymentRatePerHour: paymentRate || "NaN",
          roles: ["Freelancer"]
        }
      );

      notify_delete();
      notify_success("Profile saved successfully!");
      handleGoToStep("first");
      router.push("/escrow");

    } catch (error) {
      notify_delete();
      notify_error("Failed to save profile");
      console.error(error);
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
            value={profileOverview}
            onChange={(e) => setProfileOverview(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-8 w-[90vw] sm:w-[450px] md:w-[600px]">
          <input 
            className={`${inputStyle}`} 
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Select
            placeholder="country"
            options={options}
            value={value}
            onChange={changeHandler}
          />

          <TimezoneSelect
            placeholder="time zone"
            value={selectedTimezone}
            onChange={setSelectedTimezone}
          />
        </div>
      </div>

      <div className="mt-2">
        <div className="flex flex-wrap w-[90vw] sm:w-[450px] md:w-[600px] gap-y-8 gap-x-3">
          <input 
            className={inputStyle} 
            placeholder="Level of expertise"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-2">
        <div className="flex flex-wrap w-[90vw] sm:w-[450px] md:w-[600px] gap-y-8 gap-x-3">
          <input 
            className={inputStyle} 
            placeholder="Link Resume"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />

          <input 
            className={inputStyle} 
            placeholder="Link Portfolio"
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-2">
        <div className="flex flex-wrap w-[90vw] sm:w-[450px] md:w-[600px] gap-y-8 gap-x-3">
          <input 
            className={inputStyle} 
            placeholder="Payment Rate per Hour"
            type="number"
            min="0"
            value={paymentRate}
            onChange={(e) => setPaymentRate(e.target.value)}
          />
        </div>
      </div>

      <Button
        className="!bg-main !font-semibold !text-second !text-base !capitalize !px-12 !mt-8"
        variant="contained"
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Stack>
  );
}
