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
import React, { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { notify_delete, notify_error, notify_laoding, notify_success } from "../layout";
import { backendApi } from "@/lib/utils/api.util";
import { useRouter } from "next/navigation";
import { EscrowResponse } from "@/lib/utils/api.util";
import debounce from "lodash/debounce";
import { motion } from "framer-motion";

// Add this interface near the top of the file
interface FormState {
  ContractName: string;
  TelegramLink: string;
  DeadLine: number;
  Amount: number;
  Link: string;
  Description: string;
  private: boolean;
}

export default function Page() {
  const FORM_STORAGE_KEY = 'escrow_form_draft';

  const [timeValue, setTimeValue] = useState("");
  const [escrows, setEscrows] = useState<any[]>([]);
  const [form, setForm] = useState<FormState>(() => {
    if (typeof window !== 'undefined') {
      const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedForm) {
        try {
          const parsedForm = JSON.parse(savedForm);
          // Ensure number fields are properly parsed
          return {
            ...parsedForm,
            Amount: parsedForm.Amount ? Number(parsedForm.Amount) : 0,
            DeadLine: parsedForm.DeadLine ? Number(parsedForm.DeadLine) : 0,
          };
        } catch (error) {
          console.error('Error parsing saved form:', error);
        }
      }
    }
    return {
      ContractName: "",
      TelegramLink: "",
      DeadLine: 0,
      Amount: 0,
      Link: "",
      Description: "",
      private: false,
    };
  });

  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

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

  const [isLoading, setIsLoading] = useState(true);

  const [databaseEscrowInfo, setDatabaseEscrowInfo] = useState<EscrowResponse | null>(null);

  const fetchEscrows = async () => {
    try {
      setIsLoading(true);
      const escrow = await getAllEscrow(connection, "confirmed");
      
      console.log("Raw escrow data before processing:", escrow.map(es => ({
        name: es.contractName,
        receiver: es.reciever?.toBase58() || 'No receiver',
        status: es.status,
        hasReceiver: !!es.reciever,
        rawStatus: es.status
      })));
      
      const databaseEscrowInfo = await backendApi.get<EscrowResponse>(`/escrow`);
      setDatabaseEscrowInfo(databaseEscrowInfo);
      
      if (!databaseEscrowInfo || !databaseEscrowInfo.data) {
        console.error('No escrow data received from backend');
        return;
      }
      
      // Create a timestamp map for faster lookup
      const timestampMap = new Map();
      
      databaseEscrowInfo.data.forEach(data => {
        try {
          // Convert ISO date string to timestamp
          const timestamp = new Date(data.createdAt).getTime();
          if (!isNaN(timestamp)) {
            timestampMap.set(data.escrowAddress, timestamp);
          }
        } catch (err) {
          console.error('Error processing timestamp for escrow:', data.escrowAddress, err);
        }
      });
      
      // Add timestamps to all escrows
      const escrowsWithTimestamps = escrow.map(es => {
        const pubkey = es.pubkey.toBase58();
        const timestamp = timestampMap.get(pubkey);
        
        // Determine real status based on contract state
        let status = 0; // Default to Not Started
        
        // Only set status = 1 (Contract Started) after approveFreelancer is called
        if (!es.reciever || es.reciever.toBase58() === '11111111111111111111111111111111') {
          status = 0; // Not Started - no receiver
        } else if (es.status === 0 && es.reciever) {
          status = 1; // Contract Started - has receiver
        } else {
          status = es.status; // Use contract status for all other states
        }

        return {
          ...es,
          createdAt: timestamp || 0,
          status: status
        };
      });
      
      // Sort by timestamp (newest first)
      const sortedEscrows = [...escrowsWithTimestamps].sort((a, b) => {
        // Put entries with no timestamp at the end
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt - a.createdAt;
      });
      
      console.log('First 5 sorted escrows:', sortedEscrows.slice(0, 5).map(e => ({
        name: e.contractName,
        created: new Date(e.createdAt).toLocaleString(),
        timestamp: e.createdAt
      })));
      
      setEscrows(sortedEscrows);
    } catch (error) {
      console.error('Error in fetchEscrows:', error);
    } finally {
      setIsLoading(false);
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
    setTimeValue(e.target.value);
    setForm((prevForm: FormState) => ({ 
      ...prevForm, 
      DeadLine: milliseconds / 1000 
    }));
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async () => {
    if (isCreating) return;
    
    try {
      setIsCreating(true);
      console.log("Creating contract with private flag:", form.private);
      notify_laoding("Creating Escrow Contract...");

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
      notify_success("Escrow Contract Created!");
      clearForm();
      router.push('/escrow/myescrow');

    } catch (e) {
      notify_delete();
      notify_error("Transaction Failed!");
    } finally {
      setIsCreating(false);
    }
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Add this helper function to check if contract is expired
  const isContractExpired = (deadline: number) => {
    const now = Math.floor(Date.now() / 1000);
    return deadline < now;
  };

  // Add debounced search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  // Optimize filtered escrows
  const filteredEscrows = useMemo(() => 
    escrows.filter(escrow => {
      // First check if we have database info for this escrow
      const databaseEscrow = databaseEscrowInfo?.data?.find(
        (dbEscrow) => dbEscrow.escrowAddress === escrow.pubkey.toBase58()
      );
      
      const nameMatches = escrow.contractName.toLowerCase().includes(searchTerm.toLowerCase());
      const notExpired = !isContractExpired(escrow.deadline);
      // Use database privacy status if available, otherwise use contract privacy
      const isPublic = databaseEscrow ? !databaseEscrow.private : !escrow.private;
      
      return nameMatches && notExpired && isPublic;
    }),
    [escrows, searchTerm, databaseEscrowInfo]
  );

  // Add this helper function after the component's state declarations
  const formatTelegramLink = (input: string): string => {
    // Remove any leading/trailing whitespace
    let cleanInput = input.trim();
    
    // If it's already a full URL, return it
    if (cleanInput.startsWith('https://t.me/')) {
      return cleanInput;
    }
    
    // Remove @ if present
    if (cleanInput.startsWith('@')) {
      cleanInput = cleanInput.substring(1);
    }
    
    // Return formatted link
    return `https://t.me/${cleanInput}`;
  };

  // Add effect to save form changes
  useEffect(() => {
    if (form.ContractName || form.Description || form.Amount || form.Link || form.TelegramLink || form.DeadLine) {
      try {
        const formToSave = {
          ...form,
          Amount: Number(form.Amount) || 0, // Ensure it's a number
          DeadLine: Number(form.DeadLine) || 0,
        };
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formToSave));
      } catch (error) {
        console.error('Error saving form:', error);
      }
    }
  }, [form]);

  // Add function to clear form after successful submission
  const clearForm = useCallback(() => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    setForm({
      ContractName: "",
      TelegramLink: "",
      DeadLine: 0,
      Amount: 0,
      Link: "",
      Description: "",
      private: false,
    });
    setTimeValue("");
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 place-content-center w-full py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={(e) => e.preventDefault()}>
          <Card className="pb-6">
            <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
              <div className="text-sm sm:text-base text-textColor font-myanmar">
                Create new escrow contract
              </div>
              {(form.ContractName || form.Description || form.Amount || form.Link || form.TelegramLink) && (
                <Button
                  onClick={clearForm}
                  className="!text-xs !font-medium !capitalize !bg-gray-100 hover:!bg-gray-200 !text-gray-700 !w-fit !min-w-0 !px-3 !py-1"
                >
                  Clear Form
                </Button>
              )}
            </Stack>

            <Stack
              spacing={3}
              width="100%"
              mt={4}
              className="text-xs sm:text-sm"
            >
              <div className="mb-4">
                <label className="font-myanmar mb-1 block">Contract Name</label>
                <div className="relative w-[102%]">
                  <input
                    value={form.ContractName}
                    onChange={(e) => {
                      if (e.target.value.length <= 32) {
                        setForm((prevForm: FormState) => ({
                          ...prevForm,
                          ContractName: e.target.value,
                        }))
                      }
                    }}
                    className={`${inputStyle} w-[98%] h-[50px] pt-6 pb-5`}
                    placeholder="E.g., Build a landing page"
                    maxLength={32}
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                    form.ContractName.length >= 28 ? 'text-red-500' : 'text-gray-400'
                  } pr-3`}>
                    {form.ContractName.length}/32
                  </span>
                </div>
              </div>

              <div className="grid gap-6 grid-cols-4">
                <div className="col-span-3 w-[102%]">
                  <label className="font-myanmar mb-1 block">Telegram Username</label>
                  <input
                    type="text"
                    value={form.TelegramLink}
                    onChange={(e) => {
                      const formattedLink = formatTelegramLink(e.target.value);
                      setForm((prevForm: FormState) => ({
                        ...prevForm,
                        TelegramLink: formattedLink,
                      }));
                    }}
                    className={`${inputStyle} w-full h-[50px] pt-6 pb-5`}
                    placeholder="E.g., @username or username"
                  />
                </div>

                <div className="col-span-1 w-[98%]">
                  <label className="font-myanmar mb-1 block">Deadline</label>
                  <input
                    type="date"
                    value={timeValue}
                    onChange={handleTimeChange}
                    className={`${inputStyle} w-full h-[50px] pt-6 pb-5`}
                    placeholder="E.g., 2024-08-15"
                  />
                </div>
              </div>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                <div className="col-span-1 w-[102%]">
                  <label className="font-myanmar mb-1 block">Input USDC amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={form.Amount || ''}
                      onChange={(e) =>
                        setForm((prevForm: FormState) => ({
                          ...prevForm,
                          Amount: Number(e.target.value),
                        }))
                      }
                      className={`${inputStyle} w-[98%] h-[50px] pt-6 pb-5`}
                      placeholder="Input USDC amount"
                    />
                    <div className="absolute right-4 top-[50%] translate-y-[-50%]">
                      <Image src={coin} alt="coin" className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="col-span-1 w-[100%]">
                  <label className="font-myanmar mb-1 block">Link to resources</label>
                  <input
                    type="text"
                    value={form.Link}
                    onChange={(e) =>
                      setForm((prevForm: FormState) => ({
                        ...prevForm,
                        Link: e.target.value,
                      }))
                    }
                    className={`${inputStyle} w-[100%] h-[50px] pt-6 pb-5`}
                    placeholder="E.g., https://example.figma.com"
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="font-myanmar mb-2 block">Description</label>
                <textarea
                  value={form.Description}
                  onChange={(e) =>
                    setForm((prevForm: FormState) => ({
                      ...prevForm,
                      Description: e.target.value,
                    }))
                  }
                  className={`${inputStyle} w-full min-h-[150px] pt-[14px] pb-4`}
                  rows={5}
                  placeholder="E.g., A brief description of what the contract entails"
                />
              </div>
            </Stack>

            <Stack mt={3} alignItems="center">
              <Button
                onClick={handleSubmit}
                disabled={isDisabled() || isCreating}
                className="!text-sm !font-semibold !capitalize !bg-main !text-second !w-fit disabled:!bg-main/50"
              >
                {isCreating ? "Creating..." : "Submit"}
              </Button>
            </Stack>
          </Card>
        </form>

        <Card className="!pb-6">
          <div className="flex justify-between items-center">
            <div className="text-sm sm:text-base text-textColor font-myanmar">
              Open Public Contracts
            </div>
            <div className="flex items-center gap-2">
              {searchOpen ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="w-48 px-3 py-1 border rounded-l-md focus:outline-none"
                    placeholder="Search contracts..."
                    autoFocus
                  />
                  <button 
                    onClick={() => setSearchOpen(false)}
                    className="px-2 py-1 border border-l-0 rounded-r-md hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setSearchOpen(true)}
                  className="p-1 hover:bg-gray-100 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <Stack mt={3} spacing={2.6} className="h-[450px] overflow-y-scroll overflow-x-hidden escrow pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px] sm:h-[300px] w-full">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center text-textColor px-4"
                >
                  <div className="text-base sm:text-lg font-medium">
                    Loading Open Contracts...
                  </div>
                </motion.div>
              </div>
            ) : (
              filteredEscrows.map((el, i) => (
                (el.status !== 6) &&
                (el.reciever !== null ? el.reciever.toBase58() == anchorWallet?.publicKey.toBase58() : true) &&
                !isContractExpired(el.deadline) &&
                <Suspense fallback={<Loading />} key={i}>
                  <CardContract
                    contractName={el.contractName}
                    amount={Number(el.amount)}
                    deadline={Number(el.deadline)}
                    escrow={el.pubkey.toBase58()}
                    createdAt={el.createdAt}
                    status={el.status || 0}
                    type={2}
                    isPrivate={el.private}
                  />
                </Suspense>
              ))
            )}
          </Stack>
        </Card>
      </div>
    </div>
  );
}
