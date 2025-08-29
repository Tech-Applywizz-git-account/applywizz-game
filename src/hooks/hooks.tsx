import { useContext } from "react";
import { AuthContext } from "../contexts/contexts";
import { useQuery } from "@tanstack/react-query";
import { backendRequest } from "../lib/backendRequest";

export const useAuthContext = () => {
  const auth = useContext(AuthContext);
  if (auth == null) {
    throw new Error("Null AuthContext");
  }
  return auth;
};

export const useBackendQuery = (key: any, endpoint: string) => {
  const { token } = useAuthContext();
  console.log(`${endpoint} endpoint hit`);
  return useQuery({
    queryKey: [key],
    queryFn: async () => await backendRequest(endpoint, token as string),
    enabled: Boolean(token),
    staleTime: 10000, // optional: how long data is "fresh"
    refetchInterval: 10000,
  });
};

// Hook for fetching coins and XP data
export const useCoinsXP = () => {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: ['coinsxp'],
    queryFn: async () => await backendRequest('/coinsxp', token as string),
    enabled: Boolean(token),
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000, // Refetch every minute
    // Fallback data when query fails
    retry: false,
    onError: (error) => {
      console.log('Coins/XP endpoint failed, using fallback values', error);
    }
  });
};
