"use client";

import { Button, Stack } from "@mui/material";
import React, { useMemo, useState } from "react";
import TimezoneSelect, { type ITimezone } from "react-timezone-select";
import Select from "react-select";
import countryList from "react-select-country-list";
import { useRouter } from "next/navigation";
import { inputStyle } from "@/lib/styles/styles";

export default function ThirdForm({ handleGoToStep }: any) {
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const [value, setValue] = useState("");
  const options: any = useMemo(() => countryList().getData(), []);

  const changeHandler = (value: any) => {
    setValue(value);
  };

  const router = useRouter();
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