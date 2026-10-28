import { UserService } from "@/services/UserService";
import type { Account } from "@/types/account";
import { getErrorMessage, readJson } from "@/utils/apiUtils";
import { useEffect, useState } from "react";

export function useAccount() {
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        UserService.fetchAccount()
            .then((response) => readJson<Account>(response))
            .then((data) => !ignore && setAccount(data))
            .catch((e) => !ignore && setError(getErrorMessage(e)))
            .finally(() => !ignore && setLoading(false));
        return () => {
            ignore = true;
        };
    }, []);

    return { account, setAccount, loading, error };
}