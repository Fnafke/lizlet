import { AuthContext } from "@/components/context/AuthContext";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/studysets/EmptyState";
import StudySetCard from "@/components/studysets/StudySetCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudySets } from "@/hooks/useStudySets";
import { ArrowRight, Layers, Library, Plus } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
    const authContext = useContext(AuthContext);
    const { sets, loading } = useStudySets();

    const totalCards = sets.reduce((sum, s) => sum + s.cardCount, 0);
    const recent = sets.slice(0, 3);

    const stats = [
        { label: "Study sets", value: sets.length, icon: Library },
        { label: "Total terms", value: totalCards, icon: Layers },
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
                        <Button
                            asChild
                            size="lg"
                            className="border-0 bg-white/15 text-white hover:bg-white/25"
                        >
                            <Link to="/study-sets">My library</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="mt-8 grid grid-cols-2 gap-4">
                {stats.map(({ label, value, icon: Icon }) => (
                    <Card key={label}>
                        <CardContent className="flex items-center gap-4">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
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

                {loading ? (
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