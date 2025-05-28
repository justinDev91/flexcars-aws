"use client";

import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

import { User } from "@/types/user";

export const authContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userJson = window.localStorage.getItem("user");

    if (userJson) {
      setUser(JSON.parse(userJson));
    } else {
      router.push("/login");
    }
  }, []);

  return (
    <authContext.Provider value={{ user, setUser }}>
      {children}
    </authContext.Provider>
  );
}
