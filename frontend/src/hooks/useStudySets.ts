import { useEffect, useState } from "react";
import { StudySetService } from "@/services/StudySetService";
import type { StudySetSummary } from "@/types/studySet";
import { getErrorMessage, readJson } from "@/utils/apiUtils";

export function useStudySets() {
    const [sets, setSets] = useState<StudySetSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        StudySetService.fetchStudySets()
            .then((response) => readJson<StudySetSummary[]>(response))
            .then((data) => !ignore && setSets(data))
            .catch((e) => !ignore && setError(getErrorMessage(e)))
            .finally(() => !ignore && setLoading(false));
        return () => {
            ignore = true;
        };
    }, []);

    return { sets, loading, error };
}