"use client";

import {
  notify_delete,
  notify_error,
  notify_laoding,
  notify_success,
} from "@/app/loading";
import { FormContext } from "@/contexts/FormContext";
import { OnboardingScreenForm } from "@/lib/types/types";
import { init_user } from "@/lib/user/init_user";
import { get_user_info } from "@/lib/user/utils/user_info";
import { backendApi } from "@/lib/utils/api.util";
import { zodResolver } from "@hookform/resolvers/zod";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { Button, Stack } from "@mui/material";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

// Update the interface for better type safety
interface NexusUserResponse {
  data: Array<{
    name: string;
    userId: string;
  }>;
}

// Add this custom hook at the top of your component
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function FirstForm({ handleGoToStep }: any) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

  // console.log("image input:", imageInput);
  // console.log("selected:", selectedImage || null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<OnboardingScreenForm>({
    resolver: zodResolver(OnboardingScreenForm),
    mode: "onChange",
  });

  // Upload image function using axios
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image as soon as it's selected
      try {
        const formData = new FormData();
        formData.append("uploadedFile", file);

        const response: Record<string, any> = await backendApi.post(
          "/bucket/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        // Assume the response contains the uploaded image URL
        console.log({ response }, ".....");
        setUploadedImageUrl(response.data.metaData.url);
      } catch (error) {
        console.error("Image upload failed:", error);
        notify_error("Image upload failed");
      }
    }
  };
  // Watching form fields
  const watchedUsername = watch("username");
  const watchedTwitterProfile = watch("twitterProfile");
  const watchedEmail = watch("email");

  // Add state for username availability
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  
  // Debounce the username check
  const debouncedUsername = useDebounce(watchedUsername || '', 500);

  // Add this effect to check username availability while typing
  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedUsername) {
        setIsUsernameAvailable(true);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const response = await backendApi.get<NexusUserResponse>('/nexus-user');
        const exists = response.data.some(user => 
          user.name?.toLowerCase() === debouncedUsername.toLowerCase()
        );
        
        setIsUsernameAvailable(!exists);
      } catch (error) {
        console.error('Error checking username:', error);
        setIsUsernameAvailable(true);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsername();
  }, [debouncedUsername]);

  // Update the onSubmit handler
  const onSubmit: SubmitHandler<OnboardingScreenForm> = async (data) => {
    if (!isValid) return;

    const loadingToastId = notify_laoding("Creating Profile...!");
    
    try {
      if (!isUsernameAvailable) {
        notify_delete(loadingToastId);
        notify_error("Username already exists. Please choose another.");
        return;
      }

      await init_user(
        anchorWallet,
        connection,
        watchedUsername,
        uploadedImageUrl,
        "",
        "",
        "",
        "",
        watchedEmail,
        0,
        true,
        "",
        "",
        "",
        "",
        "",
        watchedTwitterProfile,
        wallet
      );

      handleGoToStep("second");
      notify_success("Welcome to Nexus!!");
      notify_delete(loadingToastId);
    } catch (e) {
      notify_delete(loadingToastId);
      notify_error("Transaction Failed!");
      console.error(e);
    }
  };

  useEffect(() => {
    // Log or use the watched values
    console.log("Watched Username:", watchedUsername);
    console.log("Watched Twitter Profile:", watchedTwitterProfile);
    console.log("Watched Email:", watchedEmail);
  }, [watchedUsername, watchedTwitterProfile, watchedEmail]);

  const router = useRouter();

  async function check_user() {
    try {
      const user_info = await get_user_info(anchorWallet, connection);
      console.log("nav");
      if (user_info) {
        console.log("nav push");
        router.push("/escrow");
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (!anchorWallet) return;
    check_user();
  }, [anchorWallet, anchorWallet?.publicKey]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack alignItems="center" gap={5}>
        <Stack
          gap={3}
          className="flex-col md:!flex-row items-center sm:items-end pt-5 space-y-8 sm:space-y-0"
        >
          <div className="rounded-2xl bg-white relative w-[14rem] h-[14rem] group">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Selected"
                className="w-[230px] h-[230px] object-cover object-center rounded-2xl border border-white"
              />
            ) : (
              <div className="border-2 h-[85%] mx-[1rem] mt-[1rem] border-dashed rounded m-auto flex flex-col items-center justify-center border-gray-300 transition-all duration-200 group-hover:border-gray-400 group-hover:bg-gray-50">
                <CameraAltIcon className="text-[#F3F3F3] !text-[83px] w-[5rem] transition-transform duration-200 group-hover:scale-110" />
                <p className="text-[#BABABA] text-sm group-hover:text-gray-600 transition-colors duration-200">Upload Image</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              {...register("image")}
              onChange={handleImageChange}
              className="absolute top-0 left-0 w-full h-full opacity-0 z-10 cursor-pointer"
            />
          </div>
          <div className="grid gap-6 sm:gap-4">
            <div className="sm:col-span-1">
              <label
                htmlFor="username"
                className="block text-sm !font-semibold leading-5 text-gray-900 mb-0.5 text-center sm:text-left"
              >
                Username
              </label>
              <div className="mt-2 flex flex-col gap-1">
                <div className="flex rounded-md shadow-sm sm:max-w-md relative">
                  <input
                    {...register("username")}
                    type="text"
                    autoComplete="username"
                    className={`block bg-white rounded-md flex-1 border border-gray-200 py-1.5 px-4 
                      text-gray-900 placeholder:text-gray-400 focus:ring-0 outline-none sm:text-sm 
                      sm:leading-6 min-w-[300px] transition-all duration-200
                      hover:border-gray-300 focus:border-gray-400 
                      ${!isUsernameAvailable ? 'border-red-500' : ''}`}
                    placeholder=""
                  />
                  {watchedUsername && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCheckingUsername ? (
                        <span className="mt-2 text-gray-400 text-[9.3px]">Checking...</span>
                      ) : !isUsernameAvailable ? (
                        <span className="mt-2 text-red-500 text-[9.3px]">Username taken, try another</span>
                      ) : (
                        <span className="mt-2text-green-500 text-[9.3px]">Available</span>
                      )}
                    </div>
                  )}
                </div>
                {errors.username?.message && (
                  <p className="text-red-700 text-xs">
                    {errors.username?.message}
                  </p>
                )}
              </div>
            </div>
            <div className="sm:col-span-1">
              <label
                htmlFor="twitterProfile"
                className="block text-sm !font-semibold leading-5 text-gray-900 mb-0.5 text-center sm:text-left"
              >
                Twitter Profile
              </label>
              <div className="mt-2 flex flex-col gap-1">
                <div className="flex rounded-md shadow-sm sm:max-w-md">
                  <input
                    {...register("twitterProfile")}
                    type="text"
                    className="block bg-white rounded-md flex-1 border border-gray-200 py-1.5 px-4 
                      text-gray-900 placeholder:text-gray-400 focus:ring-0 outline-none sm:text-sm 
                      sm:leading-6 transition-all duration-200
                      hover:border-gray-300 focus:border-gray-400"
                    placeholder=""
                  />
                </div>
                {errors.twitterProfile?.message && (
                  <p className="text-red-700 text-xs">
                    {errors.twitterProfile?.message}
                  </p>
                )}
              </div>
            </div>
            <div className="sm:col-span-1">
              <label
                htmlFor="email"
                className="block text-sm !font-semibold leading-5 text-gray-900 mb-0.5 text-center sm:text-left"
              >
                Email Address
              </label>
              <div className="mt-2 flex flex-col gap-1">
                <div className="flex rounded-md shadow-sm sm:max-w-md">
                  <input
                    {...register("email")}
                    type="email"
                    className="block bg-white rounded-md flex-1 border border-gray-200 py-1.5 px-4 
                      text-gray-900 placeholder:text-gray-400 focus:ring-0 outline-none sm:text-sm 
                      sm:leading-6 transition-all duration-200
                      hover:border-gray-300 focus:border-gray-400"
                    placeholder=""
                  />
                </div>
                {errors.email?.message && (
                  <p className="text-red-700 text-xs">
                    {errors.email?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Stack>

        <div className="md:!ml-[15rem]">
          <Button
            className="!bg-main !text-second !font-semibold !text-sm !capitalize !px-12 !py-2 
              disabled:!bg-main/30 disabled:!text-black/40 font-mulish"
            variant="contained"
            disabled={!isValid || !isUsernameAvailable || isCheckingUsername}
            type="submit"
          >
            Next
          </Button>
        </div>
      </Stack>
    </form>
  );
}
