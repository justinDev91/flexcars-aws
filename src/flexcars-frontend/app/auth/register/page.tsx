"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PasswordInput,
  TextInput,
  Modal,
  Text,
  Button as MantineButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import api from "@/lib/api";
import {
  RegisterFormValues,
  registerInitialValues,
  registerSchema,
} from "@/app/validations/registerSchema";

export default function RegisterForm() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const form = useForm<RegisterFormValues>({
    initialValues: registerInitialValues,
    validate: zodResolver(registerSchema),
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      await api.post("auth/register", values);
      setShowModal(true);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push("/auth/login");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Inscription</h2>
          <p className="text-sm text-gray-500">Créez votre compte pour commencer</p>
        </div>
        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <TextInput
              id="email"
              placeholder="john.doe@example.com"
              required
              {...form.getInputProps("email")}
              classNames={{ input: "mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" }}
            />
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <TextInput
              id="firstName"
              placeholder="John"
              required
              {...form.getInputProps("firstName")}
              classNames={{ input: "mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" }}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <TextInput
              id="lastName"
              placeholder="Doe"
              required
              {...form.getInputProps("lastName")}
              classNames={{ input: "mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" }}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <PasswordInput
              id="password"
              placeholder="Mot de passe sécurisé"
              required
              {...form.getInputProps("password")}
              classNames={{ input: "mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" }}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Créer un compte
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
            Connectez-vous
          </Link>
        </div>
      </div>

      <Modal opened={showModal} onClose={handleCloseModal} centered title="Confirmation envoyée 📧">
        <Text>
          Un email de confirmation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception pour activer votre compte.
        </Text>
        <div className="mt-4 text-right">
          <MantineButton onClick={handleCloseModal} color="blue">
            OK
          </MantineButton>
        </div>
      </Modal>
    </div>
  );
}
