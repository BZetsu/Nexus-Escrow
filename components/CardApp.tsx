"use client";

import DefaultImg from "@/public/Image.jpg";
import { Button, Stack } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { backendApi } from "@/lib/utils/api.util";

interface UserDetails {
  name: string;
  image: string;
  roles: string[];
  role?: string;
  userId: string;
}

// Update the ApiResponse interface to match the actual API response
interface ApiResponse {
  data: Array<{  // Remove the nested 'data' property
    address: string;
    name: string;
    image: string;
    roles: string[];
    role?: string;
    userId: string;
  }>;
}

export default function CardApp({
  data,
  title,
  role,
  type,
  approve,
  escrow,
  apply,
  link,
  type2 = false,
  startProject,
  setSelect
}: any) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (data?.user) {
          const response = await backendApi.get<ApiResponse>('/nexus-user');
          
          if (!response || !response.data) {
            console.error('Invalid API response:', response);
            return;
          }

          // First try to find by userId
          let userDetail = response.data.find(user => 
            user.userId === data.user.toBase58()
          );

          // If not found by userId, try wallet address as fallback
          if (!userDetail) {
            userDetail = response.data.find(user => 
              user.address === data.user.toBase58()
            );
          }
          
          console.log('User Data Debug:', {
            userToFind: data.user.toBase58(),
            searchName: title,
            foundUser: userDetail,
            imageUrl: userDetail?.image
          });
          
          if (userDetail) {
            setUserDetails(userDetail);
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [data?.user, title]);

  // Add event listener for profile updates
  useEffect(() => {
    const handleUserInfoUpdate = async (event: any) => {
      try {
        if (data?.user) {
          const response = await backendApi.get<ApiResponse>('/nexus-user');
          
          if (!response || !response.data) return;

          // First try to find by userId
          let userDetail = response.data.find(user => 
            user.userId === data.user.toBase58()
          );

          // Fallback to address if needed
          if (!userDetail) {
            userDetail = response.data.find(user => 
              user.address === data.user.toBase58()
            );
          }
          
          if (userDetail) {
            setUserDetails(userDetail);
          }
        }
      } catch (error) {
        console.error('Error refreshing user details:', error);
      }
    };

    window.addEventListener('userInfoUpdated', handleUserInfoUpdate);
    return () => {
      window.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
    };
  }, [data?.user]);

  const links = (_link: string) => {
    window.open(_link, "_blank");
  };

  const handleProfileClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isNavigating || !data?.user) return;
    
    try {
      setIsNavigating(true);
      const userAddress = data.user.toBase58();
      const escrowAddress = escrow.toBase58();
      
      if (!userAddress || !escrowAddress) {
        console.error('Invalid addresses:', { userAddress, escrowAddress });
        return;
      }

      const profileUrl = `/escrow/myescrow/${escrowAddress}/${userAddress}`;
      await router.push(profileUrl);
      
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  return (
    <>
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        className="py-3 pr-4"
      >
        <Stack flexDirection="row" alignItems="start" gap={2}>
          <div className="relative w-20 h-20 overflow-hidden rounded-lg">
            <Image
              src={userDetails?.image || DefaultImg.src}
              alt={title || "Applicant"}
              fill
              className="object-cover object-center"
              priority
              sizes="80px"
              onError={(e: any) => {
                console.log('Image load error, falling back to default image');
                e.target.src = DefaultImg.src;
              }}
            />
          </div>
          <Stack spacing={1} alignItems="start" className="min-w-[120px] mt-1">
            <div 
              onClick={handleProfileClick}
              className={`text-base cursor-pointer font-[600] line-clamp-1 text-left hover:text-blue-600 transition-colors ${
                isNavigating ? 'opacity-50' : ''
              }`}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleProfileClick(e as any);
                }
              }}
            >
              {userDetails?.name || title}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-xs text-gray-700 font-[400] line-clamp-1">
                {userDetails?.role || userDetails?.roles?.[0] || "No Role Yet"}
              </div>
              <div className="text-[10px] text-red-500">
                Twitter not verified
              </div>
            </div>
          </Stack>
        </Stack>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => links(link)}
            variant="contained"
            className="!normal-case !text-[11px] !text-white !bg-second !px-4 !pt-2"
          >
            {type}
          </Button>

          {type2 && (
            <Button
              variant="outlined"
              onClick={() => {
                startProject()
                setSelect(apply)
              }}
              className="!normal-case !text-[11px] !border !border-black !text-second !px-4 !pt-2"
            >
              {type2}
            </Button>
          )}
        </div>
      </Stack>
      <div className="border-b border-gray-200" />
    </>
  );
}
