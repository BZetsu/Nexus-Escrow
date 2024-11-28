import Image from 'next/image';
import Profile from "@/public/profile.png";
import { useEffect, useState } from 'react';
import { getUserInfo } from '@/lib/utils/api.util';

interface ContractProfileProps {
  client: {
    image?: string;
    name: string;
    walletAddress?: string;
  };
}

export default function ContractProfile({ client }: ContractProfileProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (client?.walletAddress) {
        const userInfo = await getUserInfo(client.walletAddress);
        if (userInfo?.data) {
          setProfileImage(userInfo.data.image);
          setUserName(userInfo.data.name);
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