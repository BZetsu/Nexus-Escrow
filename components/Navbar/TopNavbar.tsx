"use client";

import { NavigationType } from "@/lib/types/types";
import { get_user_info } from "@/lib/user/utils/user_info";
import { backendApi } from "@/lib/utils/api.util";
import Logo from "@/public/Logo.png";
import Profile from "@/public/profile.png";
import {
  Disclosure,
  Menu,
  Transition
} from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Stack } from "@mui/material";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";
import Link from 'next/link';

let navigation: NavigationType[] = [
  { name: "Nexus Explore", link: "/", current: true },
  // { name: "Documents", link: "/documents" },
  // {
  //   name: "Support",
  //   link: "/support",
  //   icon: <HelpOutlineIcon className="text-[16px]" />,
  // },
];

const nexusExploreMenu = [
  {
    name: "Nexus Escrow",
    description: "Setup Secure Escrowed Freelance Contracts with contractors",
    isComingSoon: false,
    link: "/escrow",
  },
  {
    name: "Nexus Payments",
    description: "Send and Receive Recurring Payments with your Nexus ID",
    isComingSoon: true,
    link: "#",
  },
  {
    name: "Nexus Professionals",
    description:
      "Showcase your skills, connect with opportunities and receive payments in real-time",
    isComingSoon: true,
    link: "#",
  },
  {
    name: "Nexus Businesses",
    description:
      "Streamline your team management, recruitment, compliance, and payrolls.",
    isComingSoon: true,
    link: "#",
  },
];

const nexusExploreMenuSecondary = [
  { name: "Landing Page", link: "https://nexuslandingpage.framer.website" },
  { name: "Developer Docs", link: "#" },
  { name: "Support", link: "#" },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface DisclosureRenderProps {
  open: boolean;
}

interface MenuItemRenderProps {
  active: boolean;
  disabled: boolean;
  focus?: boolean;
}

export default function Example() {
  const router = useRouter();
  const [Info, setInfo] = useState<any>()
  const { connection } = useConnection();

  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();

  async function check_user() {
    try {
      const user_info = await get_user_info(anchorWallet, connection);
      console.log("nav");
      const databaseEscrowInfo = await backendApi.get(`/nexus-user/${anchorWallet?.publicKey.toBase58()}`);

      console.log("databaseEscrowInfo")
      console.log(databaseEscrowInfo)

      if (!user_info) {
        console.log("nav push"); 
        router.push("/");
      }
      
      // Force a re-render by clearing and setting state
      setInfo(null);
      setTimeout(() => {
        setInfo((databaseEscrowInfo as any).data);
      }, 100);
      
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (!anchorWallet) return;
    check_user();
  }, [anchorWallet]);

  // Separate effect for handling updates
  useEffect(() => {
    const handleUserInfoUpdate = () => {
      if (!anchorWallet) return;
      check_user();
    };

    window.addEventListener('userInfoUpdated', handleUserInfoUpdate);
    return () => window.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
  }, [anchorWallet]);

  const path = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const publicKey = useWallet();
  return (
    <Disclosure as="nav" className="bg-second">
      {({ open }: DisclosureRenderProps) => (
        <>
          <div className="mx-auto max-w-screen-2xl px-2 sm:px-6 lg:px-8 ">
            <div className="relative flex h-[58px] items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-center sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Image
                    className="h-11 w-auto cursor-pointer"
                    src={Logo}
                    alt="logo"
                    onClick={() => router.push("/nexusexplore")}
                  />
                </div>
                <div className="hidden sm:block sm:absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-55%] z-30">
                  <div className="flex space-x-4 relative">
                    {path.length > 1 &&
                      publicKey.connected &&
                      navigation.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => setShowMenu(!showMenu)}
                          className="text-lg text-main cursor-pointer tracking-wider font-[500] font-mynamarButton"
                        >
                          <div className="flex items-center gap-1 line-clamp-1">
                            {item.name}
                          </div>
                        </div>
                      ))}

                    {showMenu && (
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{
                          duration: 0.9,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="rounded min-h-32 absolute left-[-13%] top-[150%] bg-second font-myanmar"
                      >
                        <Stack
                          className="sm:!flex-row  border-b border-white"
                          justifyContent="space-between"
                        >
                          <div className="flex-1 border-r border-white sm:w-[600px] p-5">
                            <Stack spacing={4}>
                              {nexusExploreMenu.map((el, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setShowMenu(false);
                                    router.push(el.link);
                                  }}
                                  className="text-white disabled:text-white/30 text-start"
                                  disabled={el.isComingSoon}
                                >
                                  <div className="flex gap-4 items-center">
                                    <div className="text-base">{el.name}</div>
                                    {el.isComingSoon && (
                                      <div className="text-[10px] py-1 px-2 rounded bg-main text-black">
                                        Coming Soon
                                      </div>
                                    )}
                                  </div>

                                  <div className="mt-3 text-xs font-[300]">
                                    {el.description}
                                  </div>
                                </button>
                              ))}
                            </Stack>
                          </div>
                          <div className="flex-1 flex flex-col space-y-6 text-sm items-start text-white p-5">
                            {nexusExploreMenuSecondary.map((el, index) => (
                              <motion.button
                                key={index}
                                className={`hover:underline transition-all text-white/50 hover:text-white`}
                                onClick={() => {
                                  setShowMenu(false);
                                  router.push(el.link);
                                }}
                              >
                                {el.name}
                              </motion.button>
                            ))}
                          </div>
                        </Stack>
                        <div className="text-white p-5">
                          <div className="text-xs">Socials</div>
                          <div className="mt-5 flex items-center gap-3 text-2xl">
                            <FaXTwitter />
                            <FaDiscord />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <div className="hidden sm:block" id="wallet">
                  {publicKey.connected && <WalletMultiButton />}
                </div>

                {/* Profile dropdown */}
                {path.length > 1 && publicKey.connected && (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm ring-2 ring-main">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <Image
                          className="h-8 w-8 rounded-full object-cover object-center"
                          width={300}
                          height={300}
                          src={Info && Info.image && Info.image.length > 0 ? Info.image : Profile}
                          alt=""
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {
                          () => (
                            <div className="flex items-center gap-3 px-3 py-2">
                              <Image
                                className="h-9 w-9 object-cover object-center rounded-full"
                                width={300}
                                height={300}
                                src={Info && Info.image && Info.image.length > 0 ? Info.image : Profile}
                                alt=""
                              />
                              <div className="text-2xl text-second font-semibold pt-[1rem]">
                                {Info && Info.name}
                              </div>
                            </div>
                          )
                          }
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/profile"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700 mt-2"
                              )}
                            >
                              My Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Settings
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Sign out
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 relative">
              {path.length > 1 &&
                navigation.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-base px-3 py-2 text-main tracking-wider font-[500] font-mynamarButton"
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </div>
                ))}

              {showMenu && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.7,
                    type: "spring",
                    stiffness: 120,
                  }}
                  className="rounded min-h-32 absolute left-[0] sm:left-[-6%] top-[95%] sm:top-[130%] bg-second z-50 w-full font-myanmar"
                >
                  <Stack
                    className="sm:!flex-row  border-b border-white"
                    justifyContent="space-between"
                  >
                    <div className="flex-1 border-b sm:border-r border-white sm:w-[700px] p-5">
                      <Stack spacing={4}>
                        {nexusExploreMenu.map((el, index) => (
                          <button
                            key={index}
                            className="text-white disabled:text-white/30 text-start"
                            disabled={el.isComingSoon}
                          >
                            <div className="flex gap-4 items-center">
                              <div className="text-base">{el.name}</div>
                              {el.isComingSoon && (
                                <div className="text-[10px] py-1 px-2 rounded bg-main text-black">
                                  Coming Soon
                                </div>
                              )}
                            </div>

                            <div className="mt-3 text-xs font-[300]">
                              {el.description}
                            </div>
                          </button>
                        ))}
                      </Stack>
                    </div>
                    <div className="flex-1 flex flex-col space-y-6 text-sm items-start text-white p-5">
                      {nexusExploreMenuSecondary.map((el, index) => (
                        <motion.button
                          key={index}
                          className={`hover:border-b-white transition-all`}
                          onClick={() => router.push(el.link)}
                        >
                          {el.name}
                        </motion.button>
                      ))}
                    </div>
                  </Stack>
                  <div className="text-white p-5">
                    <div className="text-xs">Socials</div>
                    <div className="mt-5 flex items-center gap-3 text-2xl">
                      <FaXTwitter />
                      <FaDiscord />
                    </div>
                  </div>
                </motion.div>
              )}
              <div id="wallet">
                {publicKey.connected && <WalletMultiButton />}
              </div>
            </div>
          </Disclosure.Panel>

          {showMenu && (
            <div
              className="fixed z-10 top-0 left-0 w-screen h-screen"
              onClick={() => setShowMenu(false)}
            ></div>
          )}
        </>
      )}
    </Disclosure>
  );
}