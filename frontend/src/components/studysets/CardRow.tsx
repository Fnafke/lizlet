import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertTriangle, Trash2 } from "lucide-react";
import { memo } from "react";

export interface FormRow {
    key: string;
    id?: string;
    term: string;
    definition: string;
    needsReview?: boolean;
}

interface CardRowProps {
    row: FormRow;
    index: number;
    canRemove: boolean;
    onChange: (key: string, field: "term" | "definition", value: string) => void;
    onRemove: (key: string) => void;
}

function CardRowComponent({ row, index, canRemove, onChange, onRemove }: CardRowProps) {
    return (
        <Card
            className={cn(
                "transition-shadow focus-within:shadow-md",
                row.needsReview && "border-amber-500/60 ring-1 ring-amber-500/30",
            )}
        >
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                        </span>
                        {row.needsReview && (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="size-3.5" /> Check this card
                            </span>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(row.key)}
                        disabled={!canRemove}
                        aria-label={`Remove card ${index + 1}`}
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
                            onChange={(e) => onChange(row.key, "term", e.target.value)}
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
                            onChange={(e) => onChange(row.key, "definition", e.target.value)}
                            maxLength={1000}
                            rows={2}
                            className="resize-none"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default memo(CardRowComponent);