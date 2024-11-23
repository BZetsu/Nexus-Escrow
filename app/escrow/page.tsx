"use client";

import Card from "@/components/Card";
import CardContract from "@/components/CardContract";
import Loading from "@/components/Loading";
import { initEscrow } from "@/lib/NexusProgram/escrow/init_escrow";
import { getAllEscrow } from "@/lib/NexusProgram/escrow/utils.ts/getAllEscrow";
import { inputStyle } from "@/lib/styles/styles";
import { formatTime } from "@/lib/utils/time_formatter";
import coin from "@/public/coin.svg";
import { Button, Stack, Switch } from "@mui/material";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import Image from "next/image";
import React, { Suspense, useEffect, useState } from "react";
import { notify_delete, notify_error, notify_laoding, notify_success } from "../layout";
import { backendApi } from "@/lib/utils/api.util";

export default function Page() {
  const [timeValue, setTimeValue] = useState("");
  const [escrows, setEscrows] = useState<any[]>([]);
  const [form, setForm] = useState({
    ContractName: "",
    TelegramLink: "",
    DeadLine: 0,
    Amount: 0,
    Link: "",
    Description: "",
    private: false,
  });

  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  const isDisabled = () => {
    return (
      !form.TelegramLink ||
      !form.ContractName ||
      !form.Amount ||
      !form.DeadLine ||
      !form.Description ||
      !form.Link
    );
  };

  const fetchEscrows = async () => {
    try {
      const escrow = await getAllEscrow(connection, "confirmed");
      console.log(escrow);
      console.log("databaseEscrowInfo");
      const databaseEscrowInfo = await backendApi.get(`/escrow`);
      console.log(databaseEscrowInfo);
      (databaseEscrowInfo as any).data!.map((data: any) => {
        escrow.map((es: any, id: any) => {
          if (es.pubkey.toBase58() == data.escrowAddress) {
            console.log(data.escrowAddress)
            console.log(es.pubkey.toBase58())
            console.log(data.contactName)
            console.log(data.private)
            escrow[id].private = data.private;
          }
        })
      })
      setEscrows(escrow);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (anchorWallet) {
      fetchEscrows();
    }
  }, [anchorWallet]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    const milliseconds = date.getTime();
    const formattedTime = formatTime(milliseconds);
    setTimeValue(e.target.value);
    setForm((prevForm) => ({ ...prevForm, DeadLine: milliseconds / 1000 }));
    console.log(
      timeValue,
      e.target.value,
      date,
      new Date(milliseconds),
      formattedTime,
      "time"
    );
  };

  const handleSubmit = async () => {
    try {
      console.log(form);
      console.log(form.private);
      notify_laoding("Transaction Pending...!")
      await initEscrow(
        anchorWallet!,
        connection,
        form.ContractName,
        form.TelegramLink,
        form.Link,
        form.Description,
        form.Amount,
        form.DeadLine,
        form.private,
        wallet
      );
      notify_delete();
      notify_success("Transaction Success!")
    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");      
      console.log(e);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 place-content-center w-full py-10 max-w-7xl mx-auto mb-10">
        <form onSubmit={(e) => e.preventDefault()}>
          <Card className="pb-7">
            <Stack flexDirection="row" justifyContent="space-between">
              <div className="text-sm sm:text-base text-textColor font-myanmar">
                Create new escrow contract
              </div>
              <Stack
                flexDirection="row"
                gap={0.3}
                className="text-xs sm:text-sm pt-[0.2rem]"
                alignItems="flex-start"
              >
                <div>Public</div>
                <div className="mt-[-6px]">
                  <Switch
                    color="warning"
                    checked={form.private}
                    onChange={(e) =>{
                      setForm((prevForm) => ({
                        ...prevForm,
                        private: e.target.checked,
                      }))
                      console.log(!e.target.checked);
                      console.log(form);
                    }
                    }
                    size="small"
                  />
                </div>

                <div>Private</div>
              </Stack>
            </Stack>

            <Stack
              spacing={2}
              width="100%"
              mt={5}
              className="text-xs sm:text-sm"
            >
              <div>
                <label className="font-myanmar">Contract Name</label>
                <input
                  value={form.ContractName}
                  onChange={(e) =>
                    setForm((prevForm) => ({
                      ...prevForm,
                      ContractName: e.target.value,
                    }))
                  }
                  className={`${inputStyle} w-full`}
                  placeholder="E.g., Build a landing page"
                />
              </div>

              <div className="grid gap-6 grid-cols-4">
                <div className="col-span-3">
                  <label className="font-myanmar">Telegram Link</label>
                  <input
                    type="text"
                    value={form.TelegramLink}
                    onChange={(e) =>
                      setForm((prevForm) => ({
                        ...prevForm,
                        TelegramLink: e.target.value,
                      }))
                    }
                    className={`${inputStyle} w-full`}
                    placeholder="E.g., https://example.tme.com"
                  />
                </div>

                <div className="col-span-1">
                  <label className="font-myanmar">Deadline</label>
                  <input
                    type="date"
                    value={timeValue}
                    onChange={handleTimeChange}
                    className={`${inputStyle} w-full`}
                    placeholder="E.g., 2024-08-15"
                  />
                </div>
              </div>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                <div className="col-span-1">
                  <label className="font-myanmar">Input USDC amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={form.Amount}
                      onChange={(e) =>
                        setForm((prevForm) => ({
                          ...prevForm,
                          Amount: Number(e.target.value),
                        }))
                      }
                      className={`${inputStyle} w-full`}
                      placeholder="200"
                    />
                    <div className="absolute right-4 top-[50%] translate-y-[-50%]">
                      <Image src={coin} alt="coin" className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="font-myanmar">Link to resources</label>
                  <input
                    type="text"
                    value={form.Link}
                    onChange={(e) =>
                      setForm((prevForm) => ({
                        ...prevForm,
                        Link: e.target.value,
                      }))
                    }
                    className={`${inputStyle} w-full`}
                    placeholder="E.g., https://example.figma.com"
                  />
                </div>
              </div>

              <div>
                <label className="font-myanmar">Description</label>
                <textarea
                  value={form.Description}
                  onChange={(e) =>
                    setForm((prevForm) => ({
                      ...prevForm,
                      Description: e.target.value,
                    }))
                  }
                  className={`${inputStyle} w-full`}
                  rows={3}
                  placeholder="E.g., A brief description of what the contract entails"
                />
              </div>
            </Stack>

            <Stack mt={5} alignItems="center">
              <Button
                onClick={handleSubmit}
                variant="contained"
                type="submit"
                disabled={isDisabled()}
                className="!text-sm sm:!text-base !font-semibold !capitalize !bg-main !text-second !w-fit disabled:!bg-main/50 disabled:!text-second/50"
              >
                Submit
              </Button>
            </Stack>
          </Card>
        </form>

        <Card>
          <div className="text-sm sm:text-base text-textColor font-myanmar">
            Open Public Contracts
          </div>

          <Stack
            mt={3}
            spacing={2.6}
            className="h-[472px] overflow-y-scroll overflow-x-hidden escrow pr-2"
          >
            {escrows &&
              escrows.map((el, i) => (
                (!el.private && el.status !== 6) &&
                (el.reciever !== null ? el.reciever.toBase58() == anchorWallet?.publicKey.toBase58() : true) &&
                <Suspense fallback={<Loading />} key={i}>
                  <CardContract
                    contractName={el.contractName}
                    amount={Number(el.amount)}
                    deadline={Number(el.deadline)}
                    escrow={el.pubkey.toBase58()}
                    type={2}
                  />
                </Suspense>
              ))}
          </Stack>
        </Card>
      </div>
    </div>
  );
}
