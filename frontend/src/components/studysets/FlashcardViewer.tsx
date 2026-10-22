import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FlashCard } from "@/types/studySet";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface FlashcardViewerProps {
    cards: FlashCard[];
    gradient: string;
    reversed?: boolean;
}

// Long text (usually definitions) gets a smaller font so it fits on the card.
const textSize = (text: string) => {
    if (text.length > 120) return "text-lg";
    if (text.length > 50) return "text-xl sm:text-2xl";
    return "text-2xl sm:text-3xl";
};

const FlashcardViewer = ({ cards, gradient, reversed = false }: FlashcardViewerProps) => {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [previousReversed, setPreviousReversed] = useState(reversed);

    // When the sides are swapped, show the front of the current card again.
    if (previousReversed !== reversed) {
        setPreviousReversed(reversed);
        setFlipped(false);
    }

    const safeIndex = Math.min(index, cards.length - 1);
    const card = cards[safeIndex];
    const progress = ((safeIndex + 1) / cards.length) * 100;

    const frontLabel = reversed ? "Definition" : "Term";
    const backLabel = reversed ? "Term" : "Definition";
    const frontText = reversed ? card.definition : card.term;
    const backText = reversed ? card.term : card.definition;

    const go = useCallback(
        (delta: number) => {
            setFlipped(false);
            setIndex((i) => Math.min(cards.length - 1, Math.max(0, i + delta)));
        },
        [cards.length],
    );

    const restart = () => {
        setFlipped(false);
        setIndex(0);
    };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest("input, textarea")) return;

            if (e.key === "ArrowRight") {
                go(1);
            } else if (e.key === "ArrowLeft") {
                go(-1);
            } else if (e.key === " " && !target.closest("button")) {
                e.preventDefault();
                setFlipped((f) => !f);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [go]);

    return (
        <div className="space-y-5">
            <div className="[perspective:1400px]">
                <div
                    onClick={() => setFlipped((f) => !f)}
                    className={cn(
                        "relative h-72 w-full cursor-pointer transition-transform duration-500 ease-out [transform-style:preserve-3d] sm:h-80",
                        flipped && "[transform:rotateY(180deg)]",
                    )}
                >
                    {/* Front */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border bg-card p-8 text-center shadow-lg [backface-visibility:hidden]">
                        <span className="absolute left-6 top-5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            {frontLabel}
                        </span>
                        <p className={cn("max-h-full overflow-y-auto whitespace-pre-wrap font-semibold", textSize(frontText))}>
                            {frontText}
                        </p>
                        <span className="absolute bottom-5 text-xs text-muted-foreground">
                            Click or press space to flip
                        </span>
                    </div>

                    {/* Back */}
                    <div
                        className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br p-8 text-center text-white shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]",
                            gradient,
                        )}
                    >
                        <span className="absolute left-6 top-5 text-xs font-medium uppercase tracking-widest text-white/70">
                            {backLabel}
                        </span>
                        <p className={cn("max-h-full overflow-y-auto whitespace-pre-wrap font-medium", textSize(backText))}>
                            {backText}
                        </p>
                    </div>
                </div>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-300", gradient)}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={() => go(-1)} disabled={safeIndex === 0} aria-label="Previous card">
                    <ChevronLeft />
                </Button>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums text-muted-foreground">
                        {safeIndex + 1} / {cards.length}
                    </span>
                    <Button variant="ghost" size="icon" onClick={restart} aria-label="Restart">
                        <RotateCcw />
                    </Button>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => go(1)}
                    disabled={safeIndex === cards.length - 1}
                    aria-label="Next card"
                >
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

export default FlashcardViewer;