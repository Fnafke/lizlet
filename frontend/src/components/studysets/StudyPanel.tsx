import FlashcardViewer from "@/components/studysets/FlashcardViewer";
import TypingPractice from "@/components/studysets/TypingPractice";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProgressService } from "@/services/ProgressService";
import type { FlashCard, SetProgress } from "@/types/studySet";
import { assertOk, getErrorMessage } from "@/utils/apiUtils";
import { ArrowLeftRight, CalendarClock, Keyboard, Layers } from "lucide-react";
import { useMemo, useState } from "react";

type Mode = "flashcards" | "typing";

interface StudyPanelProps {
    setId: string;
    cards: FlashCard[];
    gradient: string;
    progress: SetProgress | null;
    onProgressChange: () => void;
}

const MODES: Array<{ value: Mode; label: string; icon: typeof Layers }> = [
    { value: "flashcards", label: "Flashcards", icon: Layers },
    { value: "typing", label: "Type answer", icon: Keyboard },
];

const StudyPanel = ({ setId, cards, gradient, progress, onProgressChange }: StudyPanelProps) => {
    const [mode, setMode] = useState<Mode>("flashcards");
    const [reversed, setReversed] = useState(false);
    const [shuffleTyping, setShuffleTyping] = useState(true);
    const [dueIds, setDueIds] = useState<Set<string> | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    // True while a typing round is in progress; reported by TypingPractice.
    const [typingActive, setTypingActive] = useState(false);
    // A change waiting for the user's confirmation in the dialog.
    const [pendingChange, setPendingChange] = useState<(() => void) | null>(null);

    // Cards without progress are new, which counts as due.
    const dueCards = useMemo(() => {
        const byCard = new Map(progress?.cards.map((p) => [p.cardId, p] as const) ?? []);
        return cards.filter((card) => {
            const p = byCard.get(card.id);
            return !p || p.due;
        });
    }, [cards, progress]);

    const studyCards = dueIds ? cards.filter((c) => dueIds.has(c.id)) : cards;

    // Anything that would throw away a typing round in progress goes through here.
    const requestChange = (change: () => void) => {
        if (mode === "typing" && typingActive) {
            setPendingChange(() => change);
        } else {
            change();
        }
    };

    const handleModeChange = (value: Mode) => {
        if (value !== mode) {
            requestChange(() => setMode(value));
        }
    };

    const toggleDueOnly = () => setDueIds((prev) => (prev ? null : new Set(dueCards.map((c) => c.id))));

    const handleReview = async (card: FlashCard, correct: boolean) => {
        try {
            await assertOk(await ProgressService.reviewCard(setId, card.id, correct));
            setSaveError(null);
            onProgressChange();
        } catch (e) {
            setSaveError(getErrorMessage(e));
        }
    };

    const scope = dueIds ? "due" : "all";

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
                            onClick={() => handleModeChange(value)}
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

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant={dueIds ? "default" : "outline"}
                        onClick={() => requestChange(toggleDueOnly)}
                        disabled={!progress || (!dueIds && dueCards.length === 0)}
                        aria-pressed={Boolean(dueIds)}
                    >
                        <CalendarClock />
                        {dueIds ? `Due cards (${studyCards.length})` : `Study due (${dueCards.length})`}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => requestChange(() => setReversed((r) => !r))}
                        aria-pressed={reversed}
                    >
                        <ArrowLeftRight /> Swap sides
                    </Button>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Showing {reversed ? "definitions" : "terms"} first
                {dueIds ? " · only cards that are due" : ""}
            </p>

            {saveError && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Couldn't save your progress: {saveError}
                </p>
            )}

            {studyCards.length === 0 ? (
                <div className="rounded-3xl border border-dashed p-12 text-center text-muted-foreground">
                    Nothing to study here.
                </div>
            ) : mode === "flashcards" ? (
                <FlashcardViewer
                    key={scope}
                    cards={studyCards}
                    gradient={gradient}
                    reversed={reversed}
                    onReview={handleReview}
                />
            ) : (
                // key restarts the round when the direction or the card selection changes
                <TypingPractice
                    key={`${reversed}-${scope}`}
                    cards={studyCards}
                    gradient={gradient}
                    reversed={reversed}
                    shuffle={shuffleTyping}
                    onShuffleChange={setShuffleTyping}
                    onReview={handleReview}
                    onActiveChange={setTypingActive}
                />
            )}

            <AlertDialog
                open={pendingChange !== null}
                onOpenChange={(open) => {
                    if (!open) setPendingChange(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leave this typing session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You're in the middle of a round. If you continue, you'll lose your place in it and will have to start over. Cards
                            you've already answered are saved to your progress.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep practicing</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                pendingChange?.();
                                setPendingChange(null);
                            }}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Leave session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
};

export default StudyPanel;