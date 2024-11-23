import React from "react";
import Menu from "@/components/Navbar/Menu";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escrow | Home",
  description: "this the description for nexus platform",
};

export default function layout({ children }: any) {
  return (
    <div>
      <Menu />
      <div className="p-2 sm:p-4">{children}</div>
    </div>
  );
}
