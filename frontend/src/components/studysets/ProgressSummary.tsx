import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { SetProgress } from "@/types/studySet";
import { CalendarClock, CheckCircle2 } from "lucide-react";

interface ProgressSummaryProps {
    progress: SetProgress | null;
    loading: boolean;
}

const ProgressSummary = ({ progress, loading }: ProgressSummaryProps) => {
    if (loading) return <Skeleton className="h-36 rounded-2xl" />;
    if (!progress) return null;

    const { total, newCount, learningCount, masteredCount, dueCount } = progress;

    const segments = [
        { label: "Mastered", count: masteredCount, color: "bg-emerald-500" },
        { label: "Learning", count: learningCount, color: "bg-amber-500" },
        { label: "New", count: newCount, color: "bg-muted-foreground/30" },
    ];

    return (
        <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-semibold">Your progress</h2>
                    <p className="text-sm text-muted-foreground">
                        {masteredCount} of {total} mastered
                    </p>
                </div>
                {dueCount > 0 ? (
                    <Badge className="gap-1">
                        <CalendarClock className="size-3" /> {dueCount} due today
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="size-3" /> All caught up
                    </Badge>
                )}
            </div>

            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {segments.map(({ label, count, color }) => (
                    <div
                        key={label}
                        className={`${color} transition-all duration-500`}
                        style={{ width: `${total === 0 ? 0 : (count / total) * 100}%` }}
                    />
                ))}
            </div>

            <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {segments.map(({ label, count, color }) => (
                    <li key={label} className="flex items-center gap-2">
                        <span className={`size-2.5 rounded-full ${color}`} />
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium tabular-nums">{count}</span>
                    </li>
                ))}
            </ul>

            <p className="text-xs text-muted-foreground">
                A correct answer moves a card up a box (reviewed again after 1, 2, 4, 8, then 16 days). A wrong
                answer sends it back to box 1.
            </p>
        </section>
    );
};

export default ProgressSummary;