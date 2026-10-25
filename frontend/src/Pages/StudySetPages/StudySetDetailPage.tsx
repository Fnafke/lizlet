import PageShell from "@/components/PageShell";
import ProgressSummary from "@/components/studysets/ProgressSummary";
import StudyPanel from "@/components/studysets/StudyPanel";
import TermsList from "@/components/studysets/TermsList";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { gradientFor } from "@/lib/gradients";
import { cn } from "@/lib/utils";
import { useSetProgress } from "@/hooks/useSetProgress";
import { StudySetService } from "@/services/StudySetService";
import type { CardProgress, StudySetDetail } from "@/types/studySet";
import { assertOk, getErrorMessage, readJson } from "@/utils/apiUtils";
import { ArrowLeft, Layers, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const StudySetDetailPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();

    const [set, setSet] = useState<StudySetDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { progress, loading: progressLoading, reload: reloadProgress } = useSetProgress(setId);

    const progressByCard = useMemo(() => {
        const map: Record<string, CardProgress> = {};
        progress?.cards.forEach((p) => {
            map[p.cardId] = p;
        });
        return map;
    }, [progress]);

    useEffect(() => {
        if (!setId) return;
        let ignore = false;
        StudySetService.fetchStudySet(setId)
            .then((response) => readJson<StudySetDetail>(response))
            .then((data) => !ignore && setSet(data))
            .catch((e) => !ignore && setError(getErrorMessage(e)))
            .finally(() => !ignore && setLoading(false));
        return () => {
            ignore = true;
        };
    }, [setId]);

    const handleDelete = async () => {
        if (!setId) return;
        try {
            await assertOk(await StudySetService.deleteStudySet(setId));
            navigate("/study-sets", { replace: true });
        } catch (e) {
            setError(getErrorMessage(e));
        }
    };

    const gradient = set ? gradientFor(set.id) : "";

    return (
        <PageShell title={set?.title ?? "Study set"}>
            <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
                <Link to="/study-sets">
                    <ArrowLeft /> My sets
                </Link>
            </Button>

            {loading && (
                <div className="space-y-6">
                    <Skeleton className="h-40 rounded-3xl" />
                    <Skeleton className="h-80 rounded-3xl" />
                </div>
            )}

            {error && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </p>
            )}

            {set && (
                <div className="space-y-10">
                    {/* Header */}
                    <section
                        className={cn(
                            "relative overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-white shadow-lg",
                            gradient,
                        )}
                    >
                        <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-2xl" />
                        <div className="relative flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0 space-y-2">
                                <h1 className="break-words text-3xl font-bold tracking-tight">{set.title}</h1>
                                {set.description && <p className="max-w-xl text-white/85">{set.description}</p>}
                                <Badge className="mt-2 gap-1 border-0 bg-white/20 text-white">
                                    <Layers className="size-3" />
                                    {set.cards.length} {set.cards.length === 1 ? "term" : "terms"}
                                </Badge>
                            </div>

                            <div className="flex gap-2">
                                <Button asChild variant="secondary">
                                    <Link to={`/study-sets/${set.id}/edit`}>
                                        <Pencil /> Edit
                                    </Link>
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="border-0 bg-white/15 text-white hover:bg-white/25">
                                            <Trash2 /> Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete this study set?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                "{set.title}", all of its cards and your progress on them will be
                                                permanently deleted. This can't be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-white hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </section>

                    {set.cards.length === 0 ? (
                        <div className="rounded-3xl border border-dashed p-12 text-center">
                            <p className="mb-4 text-muted-foreground">This set doesn't have any cards yet.</p>
                            <Button asChild>
                                <Link to={`/study-sets/${set.id}/edit`}>
                                    <Pencil /> Add cards
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <ProgressSummary progress={progress} loading={progressLoading} />

                            <StudyPanel
                                setId={set.id}
                                cards={set.cards}
                                gradient={gradient}
                                progress={progress}
                                onProgressChange={reloadProgress}
                            />

                            <TermsList cards={set.cards} progressByCard={progressByCard} />
                        </>
                    )}
                </div>
            )}
        </PageShell>
    );
};

export default StudySetDetailPage;