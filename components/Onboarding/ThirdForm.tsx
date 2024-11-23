"use client";

import { Button, Stack } from "@mui/material";
import React, { useMemo, useState, useEffect } from "react";
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
  console.log("=== ThirdForm component rendered - NEW VERSION ===");

  const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [profileOverview, setProfileOverview] = useState("");
  const [category, setCategory] = useState("");
  const [expertise, setExpertise] = useState("");
  const [resume, setResume] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [value, setValue] = useState<any>(null);
  const [paymentRate, setPaymentRate] = useState<string>("");
  const [paymentRateError, setPaymentRateError] = useState<string>("");
  
  const options: any = useMemo(() => countryList().getData(), []);
  const router = useRouter();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const wallet = useWallet();

  useEffect(() => {
    console.log('Component mounted');
    console.log('Initial payment rate:', paymentRate);
  }, []);

  useEffect(() => {
    console.log('Payment rate changed to:', paymentRate);
  }, [paymentRate]);

  const changeHandler = (value: any) => {
    setValue(value);
  };

  const validatePaymentRate = (value: string): string => {
    if (value.length > 1 && value.startsWith('0')) {
      return value.replace(/^0+/, '');
    }
    return value;
  };

  const handleSubmit = async () => {
    if (paymentRate === "") {
      setPaymentRateError("Payment rate is required. Enter 0 if no minimum rate.");
      return;
    }
    
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
        Number(paymentRate),
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
          ...(selectedTimezone && { timeZone: selectedTimezone.toString() }),
          ...(value?.value && { country: value.value }),
          ...(category && { category }),
          ...(expertise && { levelOfExpertise: expertise }),
          ...(profileOverview && { profileOverview }),
          ...(resume && { resume }),
          ...(portfolio && { portfolio }),
          paymentRatePerHour: paymentRate.toString(),
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

  console.log("Payment Rate State:", paymentRate);
  console.log("Payment Rate Type:", typeof paymentRate);

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
        <div className="flex flex-col w-[90vw] sm:w-[450px] md:w-[600px] gap-y-2">
          <div className="relative">
            <input 
              className={`${inputStyle} ${!paymentRate ? 'border-red-500' : ''}`}
              placeholder="Payment Rate per Hour (Required) *"
              type="text"
              value={paymentRate}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setPaymentRate("");
                  setPaymentRateError("Payment rate is required. Enter 0 if no minimum rate.");
                } else if (/^\d+$/.test(value)) {
                  const cleanedValue = value === "0" ? "0" : value.replace(/^0+/, '');
                  setPaymentRate(cleanedValue);
                  setPaymentRateError("");
                }
              }}
            />
            <span className="text-red-500 absolute -top-5 right-0 text-sm">* Required Field</span>
          </div>
          {paymentRateError && (
            <span className="text-red-500 text-sm">
              {paymentRateError}
            </span>
          )}
          <div className="text-sm space-y-1">
            <span className="text-red-500 block">
              {!paymentRate && "This field cannot be empty. Enter 0 if you don't have a minimum rate."}
            </span>
            <span className="text-gray-500 block">
              * Payment rate is mandatory. You must enter a number (0 is allowed).
            </span>
          </div>
        </div>
      </div>

      <Button
        className={`!font-semibold !text-second !text-base !capitalize !px-12 !mt-8 ${
          paymentRate 
            ? '!bg-main cursor-pointer' 
            : '!bg-gray-400 cursor-not-allowed'
        }`}
        variant="contained"
        onClick={handleSubmit}
        disabled={!paymentRate}
      >
        {!paymentRate 
          ? 'Enter Payment Rate to Submit' 
          : 'Submit'
        }
      </Button>
    </Stack>
  );
}
