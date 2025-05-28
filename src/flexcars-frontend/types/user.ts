export enum Role {
  USER = "USER",
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  PROMOTION_MANAGER = "PROMOTION_MANAGER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}
