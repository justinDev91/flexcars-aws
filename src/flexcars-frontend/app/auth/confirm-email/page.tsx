"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const confirm = async () => {
      if (!token) {
        setError("Token manquant ou invalide.");
        return;
      }

      try {
        const response = await api.get(`/auth/confirm-email?token=${token}`);
        if (response.status === 200) {
          setSuccess(true);
          setTimeout(() => router.push("/auth/login"), 3000);
        }
      } catch (err: any) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Une erreur est survenue. Veuillez réessayer.");
        }
      }
    };

    confirm();
  }, [token, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Confirmation d'email</h2>
        {success ? (
          <p className="text-green-600 font-medium">
            Votre adresse email a été confirmée avec succès ! Redirection vers la connexion...
          </p>
        ) : error ? (
          <p className="text-red-500 font-medium">{error}</p>
        ) : (
          <p className="text-gray-600">Confirmation en cours...</p>
        )}
        <div className="mt-6 text-sm text-gray-600">
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

function ConfirmEmailFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Confirmation d'email</h2>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}

export default function ConfirmEmail() {
  return (
    <Suspense fallback={<ConfirmEmailFallback />}>
      <ConfirmEmailContent />
    </Suspense>
  );
}
