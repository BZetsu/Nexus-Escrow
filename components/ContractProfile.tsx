import Image from 'next/image';
import Profile from "@/public/profile.png";
import { useEffect, useState } from 'react';
import { getUserInfo } from '@/lib/utils/api.util';
import { backendApi } from '@/lib/utils/api.util';

interface ContractProfileProps {
  client: {
    image?: string;
    name: string;
    walletAddress?: string;
  };
}

// Add interface for API response
interface UserResponse {
  data: Array<{
    userId: string;
    address: string;
    name: string;
    image: string;
  }>;
}

export default function ContractProfile({ client }: ContractProfileProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (client?.walletAddress) {
        try {
          const response = await backendApi.get<UserResponse>('/nexus-user');
          if (response?.data) {
            // First try to find by userId
            let userDetail = response.data.find(user => 
              user.userId === client.walletAddress
            );

            // Fallback to address if needed
            if (!userDetail) {
              userDetail = response.data.find(user => 
                user.address === client.walletAddress
              );
            }

            if (userDetail) {
              if (userDetail.image && 
                  userDetail.image !== 'https://www.youtube.com/' &&
                  userDetail.image.startsWith('http')) {
                setProfileImage(userDetail.image);
              } else {
                setProfileImage(Profile.src);
              }
              setUserName(userDetail.name);
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, [client?.walletAddress]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-12 h-12 rounded-full overflow-hidden">
        <Image
          src={profileImage || client?.image || Profile}
          alt={`${userName || client?.name || 'User'}'s profile`}
          width={48}
          height={48}
          className="object-cover rounded-full"
          priority
          onError={() => setProfileImage(Profile.src)}
        />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-sm">
          {userName || client?.name || 'Anonymous User'}
        </span>
      </div>
    </div>
  );
} 