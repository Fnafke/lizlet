import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NotFoundPage = () => {
    const { pathname } = useLocation();

    return (
        <PageShell title="Page not found">
            <div className="flex min-h-[calc(100svh-10rem)] flex-col items-center justify-center gap-10 text-center">
                {/* A flashcard that "defines" the error, with two loose cards stacked behind it. */}
                <div className="group relative w-full max-w-sm">
                    <div
                        aria-hidden
                        className="absolute inset-0 -rotate-6 rounded-3xl border bg-card/60 shadow-sm transition-transform duration-300 motion-safe:group-hover:-rotate-3"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 rotate-3 rounded-3xl border bg-card/80 shadow-sm transition-transform duration-300 motion-safe:group-hover:rotate-1"
                    />
                    <div className="relative rounded-3xl border bg-card p-8 text-left shadow-xl">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Term</p>
                        <h1 className="mt-2 text-7xl font-black leading-none tracking-tight tabular-nums text-primary">
                            404
                        </h1>

                        <div className="my-6 border-t border-dashed" />

                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Definition
                        </p>
                        <p className="mt-2 text-lg leading-snug">
                            A page that isn't in this set. It may have moved, been deleted, or never existed.
                        </p>
                    </div>
                </div>

                <div className="flex max-w-sm flex-col items-center gap-5">
                    <p className="text-sm text-muted-foreground">
                        Nothing lives at{" "}
                        <code className="break-all rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                            {pathname}
                        </code>
                    </p>
                    <Button asChild size="lg">
                        <Link to="/">
                            <Home /> Back to home
                        </Link>
                    </Button>
                </div>
            </div>
        </PageShell>
    );
};

export default NotFoundPage;