import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, weekdayShort } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { UserStats } from "@/types/account";
import { CalendarClock, Layers, Library, Trophy } from "lucide-react";

interface StatsSectionProps {
    stats: UserStats | null;
    loading: boolean;
    error: string | null;
}

const BOXES = [
    { label: "New", color: "bg-muted-foreground/40" },
    { label: "Box 1", color: "bg-rose-400" },
    { label: "Box 2", color: "bg-orange-400" },
    { label: "Box 3", color: "bg-amber-400" },
    { label: "Box 4", color: "bg-lime-500" },
    { label: "Box 5 · mastered", color: "bg-emerald-500" },
];

const AccuracyRing = ({ percent }: { percent: number | null }) => {
    const size = 112;
    const stroke = 10;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - (percent ?? 0) / 100);

    return (
        <div className="relative size-28 shrink-0">
            <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90" aria-hidden>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    className="stroke-muted"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="stroke-primary transition-all duration-700"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums">
                {percent === null ? "–" : `${percent}%`}
            </div>
        </div>
    );
};

const StatsSection = ({ stats, loading, error }: StatsSectionProps) => {
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-56 rounded-xl" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error ?? "Your statistics are not available right now."}
            </p>
        );
    }

    if (stats.totalCards === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    Create a study set and start practising. Your statistics will show up here.
                </CardContent>
            </Card>
        );
    }

    const accuracy =
        stats.totalReviews > 0 ? Math.round((stats.correctReviews / stats.totalReviews) * 100) : null;
    const incorrectReviews = stats.totalReviews - stats.correctReviews;
    const maxUpcoming = Math.max(1, ...stats.upcoming.map((d) => d.count));

    const tiles = [
        { label: "Study sets", value: stats.totalSets, icon: Library },
        { label: "Cards", value: stats.totalCards, icon: Layers },
        { label: "Due today", value: stats.dueToday, icon: CalendarClock },
        { label: "Mastered", value: stats.masteredCards, icon: Trophy },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {tiles.map(({ label, value, icon: Icon }) => (
                    <Card key={label}>
                        <CardContent className="flex items-center gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold leading-none tabular-nums">{value}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardContent className="flex flex-wrap items-center gap-6">
                    <AccuracyRing percent={accuracy} />
                    <div className="space-y-1">
                        <p className="font-semibold">Accuracy</p>
                        {stats.totalReviews > 0 ? (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    {stats.correctReviews} correct · {incorrectReviews} incorrect
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {stats.totalReviews} {stats.totalReviews === 1 ? "answer" : "answers"} in total
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No answers yet. Start a study session.</p>
                        )}
                        {stats.lastStudied && (
                            <p className="text-sm text-muted-foreground">
                                Last studied {formatDate(stats.lastStudied)}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Cards per box</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {BOXES.map(({ label, color }, i) => {
                        const count = stats.cardsPerBox[i] ?? 0;
                        const percent = (count / stats.totalCards) * 100;
                        return (
                            <div key={label} className="flex items-center gap-3">
                                <span className="w-32 shrink-0 text-sm text-muted-foreground">{label}</span>
                                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-500", color)}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right text-sm font-medium tabular-nums">{count}</span>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Upcoming reviews</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Cards scheduled for the next 7 days. Today includes new cards.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        {stats.upcoming.map((day, i) => (
                            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                                <span className="text-xs tabular-nums text-muted-foreground">{day.count}</span>
                                <div className="flex h-24 w-full items-end">
                                    <div
                                        className={cn(
                                            "w-full rounded-t-lg transition-all duration-500",
                                            i === 0 ? "bg-primary" : "bg-primary/40",
                                        )}
                                        style={{ height: `${Math.max((day.count / maxUpcoming) * 100, 4)}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium">{i === 0 ? "Today" : weekdayShort(day.date)}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StatsSection;