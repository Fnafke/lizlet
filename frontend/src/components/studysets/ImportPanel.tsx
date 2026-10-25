import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { StudySetService } from "@/services/StudySetService";
import type { ImportPreview, ParsedCard } from "@/types/studySet";
import { getErrorMessage, readJson } from "@/utils/apiUtils";
import { AlertTriangle, CheckCircle2, FileUp } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

interface ImportPanelProps {
    disabled?: boolean;
    onImported: (cards: ParsedCard[]) => void;
}

type ImportProgress = { phase: "uploading"; percent: number } | { phase: "reading" };

interface ImportSummary {
    count: number;
    flagged: number;
    warnings: string[];
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

const ImportPanel = ({ disabled = false, onImported }: ImportPanelProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<ImportProgress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<ImportSummary | null>(null);
    const [dragging, setDragging] = useState(false);

    const busy = progress !== null;

    const importFile = async (file: File) => {
        setError(null);
        setSummary(null);

        const dot = file.name.lastIndexOf(".");
        const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
        if (!ACCEPTED_EXTENSIONS.includes(extension)) {
            setError("Choose a .pdf or .docx file.");
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            setError("This file is larger than 10 MB.");
            return;
        }

        setProgress({ phase: "uploading", percent: 0 });
        try {
            const response = await StudySetService.parseImportFile(file, (percent) =>
                setProgress(percent >= 100 ? { phase: "reading" } : { phase: "uploading", percent }),
            );
            const preview = await readJson<ImportPreview>(response);

            if (preview.cards.length === 0) {
                setError(preview.warnings[0] ?? "No terms and definitions were found in this file.");
                return;
            }

            onImported(preview.cards);
            setSummary({
                count: preview.cards.length,
                flagged: preview.cards.filter((c) => c.needsReview).length,
                warnings: preview.warnings,
            });
        } catch (e) {
            setError(getErrorMessage(e));
        } finally {
            setProgress(null);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allows choosing the same file again
        if (file) void importFile(file);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (busy || disabled) return;
        const file = e.dataTransfer.files?.[0];
        if (file) void importFile(file);
    };

    return (
        <Card
            className={cn("border-dashed transition-colors", dragging && "border-primary bg-primary/5")}
            onDragOver={(e) => {
                e.preventDefault();
                if (!busy && !disabled) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
        >
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileUp className="size-5" />
                        </div>
                        <div>
                            <p className="font-semibold">Import from a file</p>
                            <p className="text-sm text-muted-foreground">
                                Drop a PDF or Word (.docx) table here: terms on the left, definitions on the right. The
                                cards are added below, and nothing is saved until you press Save.
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={busy || disabled}
                        onClick={() => inputRef.current?.click()}
                    >
                        Choose file
                    </Button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {progress && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{progress.phase === "uploading" ? "Uploading..." : "Reading the document..."}</span>
                            {progress.phase === "uploading" && (
                                <span className="tabular-nums">{progress.percent}%</span>
                            )}
                        </div>
                        <Progress
                            value={progress.phase === "uploading" ? progress.percent : 100}
                            className={cn(progress.phase === "reading" && "animate-pulse")}
                        />
                    </div>
                )}

                {error && (
                    <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </p>
                )}

                {summary && (
                    <div className="space-y-3">
                        <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-4" />
                            Added {summary.count} {summary.count === 1 ? "card" : "cards"}
                            {summary.flagged > 0 && ` (${summary.flagged} flagged to check)`}
                        </p>

                        {summary.warnings.length > 0 && (
                            <details className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                                <summary className="flex cursor-pointer items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                                    <AlertTriangle className="size-4" />
                                    {summary.warnings.length} {summary.warnings.length === 1 ? "note" : "notes"} about
                                    this file
                                </summary>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                                    {summary.warnings.map((warning, i) => (
                                        <li key={i}>{warning}</li>
                                    ))}
                                </ul>
                            </details>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ImportPanel;