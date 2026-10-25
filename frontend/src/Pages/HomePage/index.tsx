import { AuthContext } from "@/components/context/AuthContext";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/studysets/EmptyState";
import StudySetCard from "@/components/studysets/StudySetCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { gradientFor } from "@/lib/gradients";
import { cn } from "@/lib/utils";
import { useProgressOverview } from "@/hooks/useProgressOverview";
import { useStudySets } from "@/hooks/useStudySets";
import { ArrowRight, CalendarClock, CheckCircle2, Layers, Library, Plus, Trophy } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
    const authContext = useContext(AuthContext);
    const { sets, loading: setsLoading } = useStudySets();
    const { overview, loading: overviewLoading } = useProgressOverview();

    const loading = setsLoading || overviewLoading;
    const totalCards = sets.reduce((sum, s) => sum + s.cardCount, 0);
    const masteredTotal = overview?.sets.reduce((sum, s) => sum + s.masteredCount, 0) ?? 0;
    const dueSets = overview?.sets.filter((s) => s.dueCount > 0) ?? [];
    const recent = sets.slice(0, 3);

    const stats = [
        { label: "Study sets", value: sets.length, icon: Library },
        { label: "Total terms", value: totalCards, icon: Layers },
        { label: "Due today", value: overview?.totalDue ?? 0, icon: CalendarClock },
        { label: "Mastered", value: masteredTotal, icon: Trophy },
    ];

    return (
        <PageShell title="Home">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-8 text-white shadow-xl sm:p-12">
                <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-20 left-1/3 size-72 rounded-full bg-white/10 blur-3xl" />
                <div className="relative max-w-xl space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Welcome back{authContext?.user?.username ? `, ${authContext.user.username}` : ""}
                    </h1>
                    <p className="text-base text-white/80 sm:text-lg">
                        Build your own study sets and learn anything with flashcards.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button asChild size="lg" variant="secondary">
                            <Link to="/study-sets/new">
                                <Plus /> Create a set
                            </Link>
                        </Button>
                        <Button asChild size="lg" className="border-0 bg-white/15 text-white hover:bg-white/25">
                            <Link to="/study-sets">My library</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map(({ label, value, icon: Icon }) => (
                    <Card key={label}>
                        <CardContent className="flex items-center gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Icon className="size-5" />
                            </div>
                            <div>
                                {loading ? (
                                    <Skeleton className="mb-1 h-7 w-10" />
                                ) : (
                                    <p className="text-2xl font-bold leading-none">{value}</p>
                                )}
                                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Due for review */}
            {!loading && sets.length > 0 && (
                <section className="mt-10 space-y-4">
                    <h2 className="text-xl font-semibold">Due for review</h2>

                    {dueSets.length === 0 ? (
                        <div className="flex items-center gap-3 rounded-2xl border bg-card p-5 text-muted-foreground">
                            <CheckCircle2 className="size-5 text-emerald-500" />
                            You're all caught up. Nothing is due right now.
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {dueSets.map((s) => (
                                <Link
                                    key={s.setId}
                                    to={`/study-sets/${s.setId}`}
                                    className="group flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    <div className={cn("h-12 w-1.5 shrink-0 rounded-full bg-gradient-to-b", gradientFor(s.setId))} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">{s.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {s.dueCount} due · {s.masteredCount}/{s.total} mastered
                                        </p>
                                    </div>
                                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Recent sets */}
            <section className="mt-10 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Recently updated</h2>
                    {sets.length > 3 && (
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/study-sets">
                                View all <ArrowRight />
                            </Link>
                        </Button>
                    )}
                </div>

                {setsLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
                        ))}
                    </div>
                ) : recent.length === 0 ? (
                    <EmptyState
                        title="No study sets yet"
                        description="Create your first set and start learning with flashcards."
                    />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {recent.map((set) => (
                            <StudySetCard key={set.id} set={set} />
                        ))}
                    </div>
                )}
            </section>
        </PageShell>
    );
};

export default HomePage;