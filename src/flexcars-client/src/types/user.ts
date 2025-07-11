export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CUSTOMER = "CUSTOMER",
  CARSITTER = "CARSITTER",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  birthDate?: string;
  avatar?: string;
  emailConfirmed: boolean;
  role: Role;
  companyId?: string;
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  birthDate?: string;
  avatar?: string;
  companyId?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthDate?: string;
  avatar?: string;
  companyId?: string;
}

export interface UserProfile extends Omit<User, 'role'> {
  company?: {
    id: string;
    name: string;
    type: string;
  };
} 