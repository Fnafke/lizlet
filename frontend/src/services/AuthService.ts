import type { AuthenticationRequest, SignupRequest } from "@/types/types"

const signup = async (userData: SignupRequest) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(userData)
        });
        return response;
    } catch (error) {
        console.error("Error during signup:", error);
        throw error;
    }
}

const login = async (userData: AuthenticationRequest) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(userData)
        });

        return response;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
}

const logout = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
            method: "POST",
            credentials: "include"
        });
        return response;
    } catch (error) {
        console.error("Error during logout:", error);
        throw error;
    }
}

export const AuthService = {
    signup,
    login,
    logout
}