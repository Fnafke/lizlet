import { AuthContext } from "@/components/context/AuthContext";
import PasswordCard from "@/components/account/PasswordCard";
import ProfileCard from "@/components/account/ProfileCard";
import StatsSection from "@/components/account/StatsSection";
import UsernameCard from "@/components/account/UsernameCard";
import PageShell from "@/components/PageShell";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "@/hooks/useAccount";
import { useUserStats } from "@/hooks/useUserStats";
import type { Account } from "@/types/account";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AccountPage = () => {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const { account, setAccount, loading, error } = useAccount();
    const { stats, loading: statsLoading, error: statsError } = useUserStats();

    const [renamedTo, setRenamedTo] = useState<string | null>(null);

    const handleUsernameChanged = (updated: Account) => {
        setAccount(updated);
        setRenamedTo(updated.username);
    };

    // The old session belongs to the old username, so the user logs in again.
    const handleLoginAgain = async () => {
        await authContext?.logout?.();
        navigate("/login", { replace: true });
    };

    return (
        <PageShell title="Account">
            <div className="mb-8 space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Account</h1>
                <p className="text-muted-foreground">Manage your profile and see how your studying is going.</p>
            </div>

            {error && (
                <p className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </p>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    {loading ? (
                        <Skeleton className="h-96 rounded-xl" />
                    ) : (
                        account && <ProfileCard account={account} />
                    )}
                </div>
                <div className="lg:col-span-2">
                    <StatsSection stats={stats} loading={statsLoading} error={statsError} />
                </div>
            </div>

            {account && (
                <section className="mt-10 space-y-4">
                    <h2 className="text-xl font-semibold">Settings</h2>
                    <div className="grid items-start gap-6 lg:grid-cols-2">
                        <UsernameCard account={account} onChanged={handleUsernameChanged} />
                        <PasswordCard />
                    </div>
                </section>
            )}

            <AlertDialog open={renamedTo !== null}>
                <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Username updated</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your username is now "{renamedTo}". For security you need to log in again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleLoginAgain}>Log in again</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageShell>
    );
};

export default AccountPage;