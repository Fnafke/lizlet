import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { StudySetService } from "@/services/StudySetService";
import type { FlashCard, StudySetDetail } from "@/types/studySet";
import { assertOk, getErrorMessage, readJson } from "@/utils/apiUtils";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

interface Row {
    key: string;
    id?: string;
    term: string;
    definition: string;
}

const newRow = (): Row => ({ key: crypto.randomUUID(), term: "", definition: "" });

const StudySetFormPage = () => {
    const { setId } = useParams();
    const isEdit = Boolean(setId);
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [rows, setRows] = useState<Row[]>([newRow(), newRow()]);
    const [original, setOriginal] = useState<FlashCard[]>([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
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

    const updateRow = (key: string, field: "term" | "definition", value: string) =>
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

    const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

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
        try {
            const trimmedDescription = description.trim() || null;

            if (setId) {
                await assertOk(
                    await StudySetService.updateStudySet(setId, {
                        title: title.trim(),
                        description: trimmedDescription,
                    }),
                );
                await StudySetService.syncCards(setId, original, filled);
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

                    <div className="space-y-3">
                        {rows.map((row, i) => (
                            <Card key={row.key} className="transition-shadow focus-within:shadow-md">
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            {i + 1}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => removeRow(row.key)}
                                            disabled={rows.length <= 1}
                                            aria-label={`Remove card ${i + 1}`}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor={`term-${row.key}`}
                                                className="text-xs uppercase tracking-wide text-muted-foreground"
                                            >
                                                Term
                                            </Label>
                                            <Textarea
                                                id={`term-${row.key}`}
                                                value={row.term}
                                                onChange={(e) => updateRow(row.key, "term", e.target.value)}
                                                maxLength={500}
                                                rows={2}
                                                className="resize-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor={`def-${row.key}`}
                                                className="text-xs uppercase tracking-wide text-muted-foreground"
                                            >
                                                Definition
                                            </Label>
                                            <Textarea
                                                id={`def-${row.key}`}
                                                value={row.definition}
                                                onChange={(e) => updateRow(row.key, "definition", e.target.value)}
                                                maxLength={1000}
                                                rows={2}
                                                className="resize-none"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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

                    <div className="sticky bottom-4 flex justify-end gap-3 rounded-2xl border bg-background/80 p-3 shadow-lg backdrop-blur">
                        <Button type="button" variant="ghost" asChild>
                            <Link to={setId ? `/study-sets/${setId}` : "/study-sets"}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="animate-spin" /> : <Save />}
                            {isEdit ? "Save changes" : "Create set"}
                        </Button>
                    </div>
                </form>
            )}
        </PageShell>
    );
};

export default StudySetFormPage;