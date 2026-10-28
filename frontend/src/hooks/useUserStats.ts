import { ProgressService } from "@/services/ProgressService";
import type { UserStats } from "@/types/account";
import { getErrorMessage, readJson } from "@/utils/apiUtils";
import { useEffect, useState } from "react";

export function useUserStats() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        ProgressService.fetchStats()
            .then((response) => readJson<UserStats>(response))
            .then((data) => !ignore && setStats(data))
            .catch((e) => !ignore && setError(getErrorMessage(e)))
            .finally(() => !ignore && setLoading(false));
        return () => {
            ignore = true;
        };
    }, []);

    return { stats, loading, error };
}