import NextAuth from "next-auth";
import { User } from "./user";

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    access_token: string;
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    access_token: string;
  }
}
