export interface SignInDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailConfirmed: boolean;
    companyId?: string;
    avatar?: string;
    createdAt: string;
  };
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  password: string;
}

export interface ConfirmEmailDto {
  token: string;
}

export interface AuthError {
  message: string;
  statusCode: number;
}

export interface AuthState {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
} 