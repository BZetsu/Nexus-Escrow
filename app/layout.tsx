import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNavbar from "@/components/Navbar/TopNavbar";
import MuiTheme from "@/components/MuiTheme";
import Form from "@/contexts/FormContext";
import AppWalletProvider from "@/components/AppWalletProvider";
import Redirection from "@/components/Redirection";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { web3 } from "@project-serum/anchor";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Nexus Platform",
//   description: "this the description for nexus platform",
// };
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
      </body>
    </html>
  );
}
