import { createContext } from "react";
import type { User } from "@/types/types";

export type AuthContextType = {
    user: User | null;
    login?: (userData: User) => void;
    logout?: () => void;
    isLoading: boolean;
    updateUser?: (updates: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);