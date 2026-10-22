import FlashcardViewer from "@/components/studysets/FlashcardViewer";
import TypingPractice from "@/components/studysets/TypingPractice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FlashCard } from "@/types/studySet";
import { ArrowLeftRight, Keyboard, Layers } from "lucide-react";
import { useState } from "react";

type Mode = "flashcards" | "typing";

interface StudyPanelProps {
    cards: FlashCard[];
    gradient: string;
}

const MODES: Array<{ value: Mode; label: string; icon: typeof Layers }> = [
    { value: "flashcards", label: "Flashcards", icon: Layers },
    { value: "typing", label: "Type answer", icon: Keyboard },
];

const StudyPanel = ({ cards, gradient }: StudyPanelProps) => {
    const [mode, setMode] = useState<Mode>("flashcards");
    const [reversed, setReversed] = useState(false);

    return (
        <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-xl bg-muted p-1" role="tablist" aria-label="Study mode">
                    {MODES.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            type="button"
                            role="tab"
                            aria-selected={mode === value}
                            onClick={() => setMode(value)}
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                                mode === value
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            <Icon className="size-4" />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <span className="hidden text-sm text-muted-foreground sm:inline">
                        Showing {reversed ? "definitions" : "terms"} first
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setReversed((r) => !r)}
                        aria-pressed={reversed}
                    >
                        <ArrowLeftRight /> Swap sides
                    </Button>
                </div>
            </div>

            {mode === "flashcards" ? (
                <FlashcardViewer cards={cards} gradient={gradient} reversed={reversed} />
            ) : (
                // key restarts the round when the direction changes
                <TypingPractice key={String(reversed)} cards={cards} gradient={gradient} reversed={reversed} />
            )}
        </section>
    );
};

export default StudyPanel;