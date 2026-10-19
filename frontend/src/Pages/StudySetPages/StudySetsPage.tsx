import PageShell from "@/components/PageShell";
import EmptyState from "@/components/studysets/EmptyState";
import StudySetCard from "@/components/studysets/StudySetCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudySets } from "@/hooks/useStudySets";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const StudySetsPage = () => {
    const { sets, loading, error } = useStudySets();

    return (
        <PageShell title="My sets">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">My study sets</h1>
                    <p className="text-muted-foreground">Everything you've created, newest first.</p>
                </div>
                <Button asChild>
                    <Link to="/study-sets/new">
                        <Plus /> New set
                    </Link>
                </Button>
            </div>

            {error && (
                <p className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </p>
            )}

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                </div>
            ) : sets.length === 0 && !error ? (
                <EmptyState
                    title="Your library is empty"
                    description="Create a set of terms and definitions, then flip through them as flashcards."
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sets.map((set) => (
                        <StudySetCard key={set.id} set={set} />
                    ))}
                </div>
            )}
        </PageShell>
    );
};

export default StudySetsPage;