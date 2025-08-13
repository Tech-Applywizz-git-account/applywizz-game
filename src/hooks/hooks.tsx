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
