import { ProgressService } from "@/services/ProgressService";
import type { ProgressOverview } from "@/types/studySet";
import { getErrorMessage, readJson } from "@/utils/apiUtils";
import { useEffect, useState } from "react";

export function useProgressOverview() {
    const [overview, setOverview] = useState<ProgressOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        ProgressService.fetchOverview()
            .then((response) => readJson<ProgressOverview>(response))
            .then((data) => !ignore && setOverview(data))
            .catch((e) => !ignore && setError(getErrorMessage(e)))
            .finally(() => !ignore && setLoading(false));
        return () => {
            ignore = true;
        };
    }, []);

    return { overview, loading, error };
}