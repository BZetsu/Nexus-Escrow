import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Escrow | My Escrow",
  description: "this the description for nexus platform",
};

export default function layout({ children }: any) {
  return <div className="p-4">{children}</div>;
}
