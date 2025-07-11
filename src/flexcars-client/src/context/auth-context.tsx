"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { authApi } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("access_token");
        const userJson = localStorage.getItem("user");

        if (token && userJson) {
          const user = JSON.parse(userJson);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'authentification:", error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Erreur lors de l'initialisation",
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login(email, password);
      const { access_token, user } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      setState({
        user: user as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      router.push("/dashboard");
    } catch (error: unknown) {
      let errorMessage = "Échec de la connexion";
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message as string;
      }
      
      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await authApi.register(data.email, data.password, data.firstName, data.lastName);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: unknown) {
      let errorMessage = "Échec de l'inscription";
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message as string;
      }
      
      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    router.push("/auth/login");
  };

  const setUser = (user: User | null) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setState(prev => ({ 
        ...prev, 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      }));
    } else {
      localStorage.removeItem("user");
      setState(prev => ({ 
        ...prev, 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
        error: null
      }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login,
        register,
        logout,
        setUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
} 