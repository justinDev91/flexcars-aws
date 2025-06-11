"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { authContext } from "@/context/authContext";
import api from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const { setUser } = useContext(authContext);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const result = await api.post("/auth/login", {
      email,
      password,
    });

    if (result.status !== 200) {
      console.error("Login failed");
      return;
    }

    window.localStorage.setItem("token", result.data.access_token);
    window.localStorage.setItem("user", JSON.stringify(result.data.user));
    setUser(result.data.user);

    router.push("/dashboard");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Connexion</h2>
          <p className="text-sm text-gray-500">Connectez-vous à votre compte</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
          <div className="text-right text-sm">
            <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">
            Inscrivez-vous
          </Link>
        </div>
      </div>
    </div>
  );
}
