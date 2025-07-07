"use client";

import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");

    try {
      const response = await api.post("/auth/forgot-password", { email });

      if (response.status === 201 || response.status === 200) {
        setEmailSent(true);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Adresse email introuvable ou erreur serveur.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Mot de passe oublié</h2>
          <p className="text-sm text-gray-500">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
        </div>

        {emailSent ? (
          <div className="text-green-600 text-center font-medium">
            Un email de réinitialisation a été envoyé si l'adresse est valide.
          </div>
        ) : (
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Envoyer le lien
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
