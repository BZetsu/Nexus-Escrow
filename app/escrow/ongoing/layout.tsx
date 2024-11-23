import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Escrow | Ongoing Escrows",
  description: "this the description for nexus platform",
};

export default function layout({ children }: any) {
  return <div>{children}</div>;
}
