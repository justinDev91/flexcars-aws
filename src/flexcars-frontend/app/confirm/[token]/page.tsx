"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as zod from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const schema = zod
  .object({
    password: zod.string(),
  })
  .required();

export default function ConfirmPage() {
  const { token } = useParams();
  const router = useRouter();

  const form = useForm({
    // defaultValues: {}
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get(`tokens/${token}`).then((res) => {
      if (res.status !== 200) {
        router.push("/login");
      }
    });
  }, []);

  const onSubmit = (data) => {
    api
      .put("users/password", {
        ...data,
        token,
      })
      .then((res) => {
        console.log(res);
      });
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center mx-auto">
      <h1>
        Veuillez renseigner un mot de passe pour finaliser la création de votre
        compte
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit">Créer mon compte</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
