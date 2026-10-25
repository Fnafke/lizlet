import PageShell from "@/components/PageShell";
import CardRow, { type FormRow } from "@/components/studysets/CardRow";
import ImportPanel from "@/components/studysets/ImportPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { StudySetService } from "@/services/StudySetService";
import type { FlashCard, ParsedCard, StudySetDetail } from "@/types/studySet";
import { assertOk, getErrorMessage, readJson } from "@/utils/apiUtils";
import { ArrowLeft, Loader2, Plus, Save } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const newRow = (): FormRow => ({ key: crypto.randomUUID(), term: "", definition: "" });

const StudySetFormPage = () => {
    const { setId } = useParams();
    const isEdit = Boolean(setId);
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [rows, setRows] = useState<FormRow[]>([newRow(), newRow()]);
    const [original, setOriginal] = useState<FlashCard[]>([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [saveProgress, setSaveProgress] = useState<{ done: number; total: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!setId) return;
        let ignore = false;
        StudySetService.fetchStudySet(setId)
            .then((response) => readJson<StudySetDetail>(response))
            .then((set) => {
                if (ignore) return;
                setTitle(set.title);
                setDescription(set.description ?? "");
                setOriginal(set.cards);
                setRows(
                    set.cards.length > 0
                        ? set.cards.map((c) => ({
                              key: c.id,
                              id: c.id,
                              term: c.term,
                              definition: c.definition,
                          }))
                        : [newRow(), newRow()],
                );
            })
            .catch((e) => !ignore && setError(getErrorMessage(e)))
            .finally(() => !ignore && setLoading(false));
        return () => {
            ignore = true;
        };
    }, [setId]);

    // Stable callbacks so memoized rows don't re-render on every keystroke.
    const updateRow = useCallback(
        (key: string, field: "term" | "definition", value: string) =>
            setRows((prev) =>
                prev.map((r) => (r.key === key ? { ...r, [field]: value, needsReview: false } : r)),
            ),
        [],
    );

    const removeRow = useCallback((key: string) => setRows((prev) => prev.filter((r) => r.key !== key)), []);

    // Imported cards are appended; the untouched blank starter rows are dropped first.
    const handleImported = useCallback((cards: ParsedCard[]) => {
        setRows((prev) => [
            ...prev.filter((r) => r.term.trim() || r.definition.trim()),
            ...cards.map((c) => ({
                key: crypto.randomUUID(),
                term: c.term,
                definition: c.definition,
                needsReview: c.needsReview,
            })),
        ]);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const filled = rows.filter((r) => r.term.trim() || r.definition.trim());

        if (!title.trim()) {
            setError("Give your set a title.");
            return;
        }
        if (filled.some((r) => !r.term.trim() || !r.definition.trim())) {
            setError("Every card needs both a term and a definition.");
            return;
        }

        setSaving(true);
        setSaveProgress(null);
        try {
            const trimmedDescription = description.trim() || null;

            if (setId) {
                await assertOk(
                    await StudySetService.updateStudySet(setId, {
                        title: title.trim(),
                        description: trimmedDescription,
                    }),
                );
                try {
                    await StudySetService.syncCards(setId, original, filled, (done, total) =>
                        setSaveProgress({ done, total }),
                    );
                } catch (syncError) {
                    throw new Error(
                        `${getErrorMessage(syncError)} Some changes may already be saved, so reload the page ` +
                            "before trying again.",
                    );
                }
                navigate(`/study-sets/${setId}`);
            } else {
                const created = await readJson<StudySetDetail>(
                    await StudySetService.createStudySet({
                        title: title.trim(),
                        description: trimmedDescription,
                        cards: filled.map((r) => ({ term: r.term.trim(), definition: r.definition.trim() })),
                    }),
                );
                navigate(`/study-sets/${created.id}`);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const heading = isEdit ? "Edit study set" : "Create a new study set";
    const filledCount = rows.filter((r) => r.term.trim() || r.definition.trim()).length;
    const flaggedCount = rows.filter((r) => r.needsReview).length;
    const savePercent =
        saveProgress && saveProgress.total > 0 ? Math.round((saveProgress.done / saveProgress.total) * 100) : null;

    return (
        <PageShell title={heading}>
            <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
                <Link to={setId ? `/study-sets/${setId}` : "/study-sets"}>
                    <ArrowLeft /> Back
                </Link>
            </Button>

            <h1 className="mb-8 text-3xl font-bold tracking-tight">{heading}</h1>

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-40 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Spanish vocabulary, chapter 3"
                                    maxLength={100}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What is this set about?"
                                    maxLength={500}
                                    rows={2}
                                    className="resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <ImportPanel disabled={saving} onImported={handleImported} />

                    <div className="space-y-3">
                        {rows.map((row, i) => (
                            <CardRow
                                key={row.key}
                                row={row}
                                index={i}
                                canRemove={rows.length > 1}
                                onChange={updateRow}
                                onRemove={removeRow}
                            />
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={() => setRows((prev) => [...prev, newRow()])}
                        >
                            <Plus /> Add card
                        </Button>
                    </div>

                    {error && (
                        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <div className="sticky bottom-4 space-y-3 rounded-2xl border bg-background/80 p-3 shadow-lg backdrop-blur">
                        {saving && (
                            <div className="space-y-1.5 px-1">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {saveProgress
                                            ? `Saving cards... ${saveProgress.done} / ${saveProgress.total}`
                                            : "Saving..."}
                                    </span>
                                    {savePercent !== null && <span className="tabular-nums">{savePercent}%</span>}
                                </div>
                                <Progress
                                    value={savePercent ?? 100}
                                    className={cn(savePercent === null && "animate-pulse")}
                                />
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-sm text-muted-foreground">
                                {filledCount} {filledCount === 1 ? "card" : "cards"}
                                {flaggedCount > 0 && (
                                    <span className="text-amber-600 dark:text-amber-400">
                                        {" "}
                                        · {flaggedCount} to check
                                    </span>
                                )}
                            </span>
                            <div className="flex gap-3">
                                <Button type="button" variant="ghost" asChild>
                                    <Link to={setId ? `/study-sets/${setId}` : "/study-sets"}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? <Loader2 className="animate-spin" /> : <Save />}
                                    {isEdit ? "Save changes" : "Create set"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </PageShell>
    );
};

export default StudySetFormPage;