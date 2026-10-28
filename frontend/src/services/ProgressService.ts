const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const reviewCard = async (setId: string, cardId: string, correct: boolean): Promise<Response> => {
    try {
        const response = await fetch(`${BASE_URL}/study-sets/${setId}/cards/${cardId}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ correct }),
        });
        return response;
    } catch (error) {
        console.error("Error saving review:", error);
        throw error;
    }
};

const fetchSetProgress = async (setId: string): Promise<Response> => {
    try {
        const response = await fetch(`${BASE_URL}/study-sets/${setId}/progress`, {
            method: "GET",
            credentials: "include",
        });
        return response;
    } catch (error) {
        console.error("Error fetching set progress:", error);
        throw error;
    }
};

const fetchOverview = async (): Promise<Response> => {
    try {
        const response = await fetch(`${BASE_URL}/progress/overview`, {
            method: "GET",
            credentials: "include",
        });
        return response;
    } catch (error) {
        console.error("Error fetching progress overview:", error);
        throw error;
    }
};

const fetchStats = async (): Promise<Response> => {
    try {
        const response = await fetch(`${BASE_URL}/progress/stats`, {
            method: "GET",
            credentials: "include",
        });
        return response;
    } catch (error) {
        console.error("Error fetching statistics:", error);
        throw error;
    }
};

export const ProgressService = {
    reviewCard,
    fetchSetProgress,
    fetchOverview,
    fetchStats,
};