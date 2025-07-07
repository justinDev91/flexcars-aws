"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { authContext } from "@/context/authContext";
import { signIn } from "next-auth/react";
import { Anchor, Button, Checkbox, Paper, PasswordInput, Text, TextInput, Title } from "@mantine/core";
import classes from "../../(authed)/home/styles/AuthenticationImage.module.css"

export default function Login() {
  const router = useRouter();
  const { setUser } = useContext(authContext);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Retrieve form data
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim() || "";
    const password = formData.get("password")?.toString().trim() || "";

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Échec de la connexion. Vérifiez vos identifiants.");
        return;
      }

      setError(null);
      router.push("/home");
    } catch (error) {
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Bienvenue sur Flexcars !
        </Title>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <TextInput 
            name="email"
            label="Adresse e-mail" 
            placeholder="hello@gmail.com" 
            size="md" 
            radius="md" 
            required 
          />
          <PasswordInput 
            name="password"
            label="Mot de passe" 
            placeholder="Votre mot de passe" 
            mt="md" 
            size="md" 
            radius="md" 
            required 
          />
          <Checkbox label="Se souvenir de moi" mt="xl" size="md" />
          {error && <Text color="red" size="sm">{error}</Text>}
          <Button
            type="submit"
            fullWidth
            mt="xl"
            size="md"
            radius="md"
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </Button>
        </form>

        <Text mt="md" size="sm">
          Pas encore de compte ?{" "}
          <Anchor href="/auth/register" fw={500}>
            Inscrivez-vous
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}
