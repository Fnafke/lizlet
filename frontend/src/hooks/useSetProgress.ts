import { ProgressService } from "@/services/ProgressService";
import type { SetProgress } from "@/types/studySet";
import { getErrorMessage, readJson } from "@/utils/apiUtils";
import { useCallback, useEffect, useState } from "react";

export function useSetProgress(setId: string | undefined) {
    const [progress, setProgress] = useState<SetProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        if (!setId) return;
        let ignore = false;
        ProgressService.fetchSetProgress(setId)
            .then((response) => readJson<SetProgress>(response))
            .then((data) => !ignore && setProgress(data))
            .catch((e) => !ignore && setError(getErrorMessage(e)))
            .finally(() => !ignore && setLoading(false));
        return () => {
            ignore = true;
        };
    }, [setId, version]);

    // Refetches in the background; the previous data stays visible meanwhile.
    const reload = useCallback(() => setVersion((v) => v + 1), []);

    return { progress, loading, error, reload };
}