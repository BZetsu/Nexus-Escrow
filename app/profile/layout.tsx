import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "My Profile",
  description: "",
};
export default function layout({ children }: any) {
  return <div className="p-3 sm:p-8">{children}</div>;
}
