import { web3 } from "@project-serum/anchor";
import { getEscrowInfo } from "@/lib/NexusProgram/escrow/utils.ts/getEscrowInfo";
import { useEffect, useState } from "react";

const cache = new Map();

export const useEscrowCache = (
  address: string,
  anchorWallet: any,
  connection: any
) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cacheKey = `escrow-${address}`;
        
        if (cache.has(cacheKey)) {
          setData(cache.get(cacheKey));
          setLoading(false);
          return;
        }

        const escrow = new web3.PublicKey(address);
        const info = await getEscrowInfo(anchorWallet, connection, escrow);
        
        cache.set(cacheKey, info);
        setData(info);
        
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    if (anchorWallet && connection && address) {
      fetchData();
    }
  }, [address, anchorWallet, connection]);

  useEffect(() => {
    console.log('Cache status:', {
      size: cache.size,
      keys: Array.from(cache.keys()),
      hasCurrentKey: cache.has(`escrow-${address}`)
    });
  }, [address]);

  return { data, loading, error };
}; 