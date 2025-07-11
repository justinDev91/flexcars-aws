"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    if (!token) {
      setError("Token manquant ou invalide.");
      return;
    }
  
    try {
      await api.post(`/auth/reset-password?token=${token}`, {
        password,
      });

      setSuccess(true);
      setError("");
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };
  
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Nouveau mot de passe</h2>
          <p className="text-sm text-gray-500">Définissez un nouveau mot de passe sécurisé</p>
        </div>

        {success ? (
          <div className="text-green-600 text-center font-medium">
            Mot de passe mis à jour ! Redirection vers la connexion...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Réinitialiser
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Nouveau mot de passe</h2>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
