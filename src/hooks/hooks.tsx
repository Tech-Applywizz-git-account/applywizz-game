import { useContext } from "react";
import { AuthContext } from "../contexts/contexts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { backendRequest, backendPostRequest } from "../lib/backendRequest";

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

// Hook for purchasing items (avatars, etc.)
export const usePurchaseItem = () => {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ item_name, item_type }: { item_name: string; item_type: string }) => {
      return await backendPostRequest('/purchase', token as string, { item_name, item_type });
    },
    onSuccess: () => {
      // Invalidate and refetch coins/XP data after successful purchase
      queryClient.invalidateQueries({ queryKey: ['coinsxp'] });
      queryClient.invalidateQueries({ queryKey: ['owned-items'] });
    },
    onError: (error) => {
      console.error('Purchase failed:', error);
    }
  });
};

// Hook for selecting an avatar
export const useSelectAvatar = () => {
  const { token } = useAuthContext();
  
  return useMutation({
    mutationFn: async ({ item_name }: { item_name: string }) => {
      return await backendPostRequest('/select-avatar', token as string, { item_name });
    },
    onError: (error) => {
      console.error('Avatar selection failed:', error);
    }
  });
};

// Hook for fetching owned items
export const useOwnedItems = () => {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: ['owned-items'],
    queryFn: async () => await backendRequest('/own', token as string),
    enabled: Boolean(token),
    staleTime: 30000, // Cache for 30 seconds
    retry: false,
    onError: (error) => {
      console.log('Owned items endpoint failed', error);
    }
  });
};

// Hook for fetching badge and streak information
export const useBadgeInfo = () => {
  const { token } = useAuthContext();
  return useQuery({
    queryKey: ['badge-info'],
    queryFn: async () => await backendRequest('/badge', token as string),
    enabled: Boolean(token),
    staleTime: 30000, // Cache for 30 seconds
    retry: false,
    onError: (error) => {
      console.log('Badge endpoint failed, using fallback values', error);
    }
  });
};


