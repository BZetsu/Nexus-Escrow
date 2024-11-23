"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import React, { Suspense, useEffect, useState } from "react";
import Log from "./Log";
import Loading from "./Loading";

export default function Redirection({ children }: any) {
  const publicKey = useWallet();
  const [load, setLoad] = useState(true);
  useEffect(() => {
    if (!publicKey.connected) {
      setTimeout(() => {
        setLoad(false);
      }, 1000);
      console.log("first");
    }
  }, [publicKey]);
  return (
    <div>
      {publicKey.connected ? children : <>{load ? <Loading /> : <Log />}</>}
    </div>
  );
}
