import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User } from "./useFindUsers";
import { useAuthSession } from "@/app/auth/hooks/useAuthSession";

const updateUser = async (
  id: string,
  userData: Omit<User, "email" | "birthDate" | "id">,
  access_token?: string
) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to update user");
  }

  return response.json();
};

export const useUpdateUser = () => {
  const { access_token } = useAuthSession();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<User, "email" | "birthDate" | "id"> }) =>
      updateUser(id, data, access_token),
  });
};
