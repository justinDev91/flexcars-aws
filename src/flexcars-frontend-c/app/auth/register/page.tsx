"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Modal,
} from "@mantine/core";
import api from "@/lib/api";
import {
  RegisterFormValues,
  registerInitialValues,
  registerSchema,
} from "@/app/validations/registerSchema";
import classes from "../../(authed)/home/styles/AuthenticationImage.module.css";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
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
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push("/auth/login");
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Créez votre compte
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-5">
          <TextInput
            name="email"
            label="Adresse e-mail"
            placeholder="hello@gmail.com"
            size="md"
            radius="md"
            required
            {...form.getInputProps("email")}
          />
          <TextInput
            name="firstName"
            label="Prénom"
            placeholder="John"
            size="md"
            radius="md"
            required
            {...form.getInputProps("firstName")}
          />
          <TextInput
            name="lastName"
            label="Nom"
            placeholder="Doe"
            size="md"
            radius="md"
            required
            {...form.getInputProps("lastName")}
          />
          <PasswordInput
            name="password"
            label="Mot de passe"
            placeholder="Votre mot de passe"
            size="md"
            radius="md"
            required
            {...form.getInputProps("password")}
          />
          {error && (
            <Text color="red" size="sm">
              {error}
            </Text>
          )}
          <Button
            type="submit"
            fullWidth
            mt="xl"
            size="md"
            radius="md"
            className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Créer un compte
          </Button>
        </form>

        <Text mt="md" size="sm">
          Déjà un compte ?{" "}
          <Anchor href="/auth/login" fw={500}>
            Connectez-vous
          </Anchor>
        </Text>
      </Paper>

      <Modal
        opened={showModal}
        onClose={handleCloseModal}
        centered
        title="Confirmation envoyée 📧"
      >
        <Text>
          Un email de confirmation a été envoyé à votre adresse. Veuillez vérifier
          votre boîte de réception pour activer votre compte.
        </Text>
        <div className="mt-4 text-right">
          <Button onClick={handleCloseModal} color="blue">
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
}
