import { useSession } from "next-auth/react";

export const useAuthSession = () => {
  const { data: session, status } = useSession();

  const access_token = (session as any)?.access_token;
  const user = session?.user;
  const isAuthenticated = status === "authenticated";

  return {
    access_token, 
    user,
    status,
    isAuthenticated,
  };
};
