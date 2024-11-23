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
        <div className="text-4xl sm:text-3xl text-center font-myanmar font-[500]">
          Streamlining daily managerial and <br /> financial activities of{" "}
          <br /> Web3 businesses and stakeholders
        </div>
      </Stack>

      <div id="wallet" className="mt-20 mx-auto w-fit">
        <WalletMultiButton />
      </div>

      <Card width="md" className="!mt-24  !mb-14 ">
        <div className="text-sm">Nexus Explore</div>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mt-3">
          {NexusTypes.map((el, i) => (
            <motion.button
              key={i}
              className="py-4 px-2 grid grid-cols-2 items-center md:gap-4 sm:gap-1 border border-black/30 rounded-xl disabled:opacity-25 w-full"
              disabled={el.disabled}
              whileHover={!el.disabled ? { scale: 1.02 } : {}}
              onClick={notify}
            >
              <Image src={el.image} alt="" className="w-full" />
              <div className="text-[10px] sm:text-xs text-left">{el.title}</div>
            </motion.button>
          ))}
        </div>
      </Card>
    </div>
  );
}
