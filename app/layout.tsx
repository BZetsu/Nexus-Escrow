import type { Metadata } from "next";
import "./globals.css";
import "../styles/fonts.css";
import dynamic from 'next/dynamic';
import TopNavbar from "@/components/Navbar/TopNavbar";
import MuiTheme from "@/components/MuiTheme";
import Form from "@/contexts/FormContext";
import AppWalletProvider from "@/components/AppWalletProvider";
import Redirection from "@/components/Redirection";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { web3 } from "@project-serum/anchor";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"

export  const links = (link: string) => {
  if (link.length > 0) {
    window.open(link, "_blank");
  }    
};

export  const PROGRAM_ID = new web3.PublicKey(
  "3GKGywaDKPQ6LKXgrEvBxLAdw6Tt8PvGibbBREKhYDfD"
);

export const notify_success = (msg: string) => {
  return toast.success(msg, {
    position: toast.POSITION.TOP_RIGHT,
  });
};

export const notify_worning = (msg: string) => {
  return toast.warning(msg, {
    position: toast.POSITION.TOP_RIGHT,
  });
};
export const notify_error = (msg: string) => {
  return toast.error(msg, {
    position: toast.POSITION.TOP_RIGHT,
  });
};
export const notify_laoding = (msg: string) => {
  return toast.loading(msg, {
    position: toast.POSITION.TOP_CENTER,
  });
};
export const notify_delete = () => {
  toast.dismiss();
};

export const notify_delete_id = (id: any) => {
  return toast.dismiss(id);
};

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className={inter.className}>
        <AppWalletProvider>
          <MuiTheme>
            <TopNavbar />
            <Redirection>
              <ToastContainer theme="dark" />
              <Form>{children}</Form>
            </Redirection>
          </MuiTheme>
        </AppWalletProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
