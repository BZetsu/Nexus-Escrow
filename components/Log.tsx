import { Stack } from "@mui/material";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React from "react";
import Card from "./Card";
import EscrowImg from "@/public/web3-cryptocurrency-token-escrow-payment-contract 1.svg";
import PaymentBackImg from "@/public/coins-payments-back-and-forth-between-two-devices 1.svg";
import ProfessionalImg from "@/public/web3-professional-on-his-laptop 1.svg";
import BusnessesImg from "@/public/web3-businesses-and-payrolls 1.svg";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const notify = () =>
  toast("You need to connect your wallet first.", {
    duration: 2500,
    position: "bottom-left",
    className: "text-sm",

    // Custom Icon
    icon: "🥷",
  });

export default function Log() {
  const NexusTypes = [
    { title: "Nexus Escrow Contracts", image: EscrowImg, disabled: false },
    { title: "Nexus Payments and Swap", image: PaymentBackImg, disabled: true },
    { title: "Nexus Businesses", image: BusnessesImg, disabled: true },
    { title: "Nexus Professinals", image: ProfessionalImg, disabled: true },
  ];

  const router = useRouter();

  return (
    <div className="px-4 sm:px-0 absolute top-[57px] left-0 w-full logBg overflow-y-scroll ">
      <Toaster />
      <Stack spacing={3} alignItems="center" mt={11}>
        <div className="text-3xl sm:text-4xl text-center font-myanmar font-[500] flex flex-col">
          <div>
            <span className="text-[#858585]">Streamlining Daily</span>{" "}
            <span>Managerial</span>
          </div>
          <div>
            <span className="text-[#858585]">and</span>{" "}
            <span>Financial Activities</span>{" "}
            <span className="text-[#858585]">of</span>
          </div>
          <div>
            <span>Web3 businesses</span>{" "}
            <span className="text-[#858585]">and</span>{" "}
            <span>Stakeholders</span>
          </div>
        </div>
      </Stack>

      <div id="wallet" className="mt-20 mx-auto w-fit">
        <WalletMultiButton 
          className="!bg-second !text-white hover:!bg-second/95 transition-all duration-300 !px-8 hover:!scale-105 hover:!shadow-lg hover:!shadow-black/10 !rounded-xl"
        >
          Launch App
        </WalletMultiButton>
      </div>

      <Card width="sm" className="!mt-24 !mb-14 mx-auto max-w-[800px] !pt-12">
        <div className="relative">
          <div className="text-sm absolute -top-9 left-0">Nexus Explore</div>
          <div className="grid gap-1.5 grid-cols-2 sm:grid-cols-4">
            {NexusTypes.map((el, i) => (
              <motion.button
                key={i}
                className="py-1.5 px-1 grid grid-cols-2 items-center md:gap-2 sm:gap-1 border border-black/30 rounded-xl disabled:opacity-25 w-full"
                disabled={el.disabled}
                whileHover={!el.disabled ? { scale: 1.02 } : {}}
                onClick={notify}
              >
                <Image src={el.image} alt="" className="w-[95%]" />
                <div className="text-[9px] sm:text-[11px] text-left">{el.title}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
