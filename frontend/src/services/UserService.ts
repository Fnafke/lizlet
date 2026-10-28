const USERS_URL = `${import.meta.env.VITE_API_BASE_URL}/users`;
const JSON_HEADERS = { "Content-Type": "application/json" };

const fetchCurrentUser = async (): Promise<Response | null> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
            method: "GET",
            credentials: "include"
        });
        return response;
    } catch (error) {
        console.error("Error fetching current user:", error);
        throw error;
    }
};

const fetchAccount = async (): Promise<Response> => {
    try {
        const response = await fetch(`${USERS_URL}/me/account`, {
            method: "GET",
            credentials: "include",
        });
        return response;
    } catch (error) {
        console.error("Error fetching account:", error);
        throw error;
    }
};

const changeUsername = async (username: string): Promise<Response> => {
    try {
        const response = await fetch(`${USERS_URL}/me/username`, {
            method: "PUT",
            headers: JSON_HEADERS,
            credentials: "include",
            body: JSON.stringify({ username }),
        });
        return response;
    } catch (error) {
        console.error("Error changing username:", error);
        throw error;
    }
};

const changePassword = async (currentPassword: string, newPassword: string): Promise<Response> => {
    try {
        const response = await fetch(`${USERS_URL}/me/password`, {
            method: "PUT",
            headers: JSON_HEADERS,
            credentials: "include",
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        return response;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
};

export const UserService = {
    fetchCurrentUser,
    fetchAccount,
    changeUsername,
    changePassword,
}