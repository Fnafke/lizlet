import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isCorrectAnswer } from "@/lib/answers";
import { cn } from "@/lib/utils";
import type { FlashCard } from "@/types/studySet";
import { ArrowRight, CheckCircle2, ListOrdered, RotateCcw, Shuffle, XCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

interface TypingPracticeProps {
    cards: FlashCard[];
    gradient: string;
    reversed: boolean;
    shuffle: boolean;
    onShuffleChange: (shuffle: boolean) => void;
    onReview?: (card: FlashCard, correct: boolean) => void;
}

type Result = "correct" | "incorrect";

interface Outcome {
    card: FlashCard;
    correct: boolean;
}

function shuffled<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

const ORDER_OPTIONS = [
    { value: true, label: "Shuffle", description: "A random order every round", icon: Shuffle },
    { value: false, label: "Keep order", description: "The same order as in the set", icon: ListOrdered },
];

const TypingPractice = ({ cards, gradient, reversed, shuffle, onShuffleChange, onReview }: TypingPracticeProps) => {
    const [started, setStarted] = useState(false);
    const [queue, setQueue] = useState<FlashCard[]>([]);
    const [position, setPosition] = useState(0);
    const [outcomes, setOutcomes] = useState<Outcome[]>([]);
    const [answer, setAnswer] = useState("");
    const [result, setResult] = useState<Result | null>(null);

    const promptLabel = reversed ? "Definition" : "Term";
    const answerLabel = reversed ? "Term" : "Definition";
    const promptOf = (card: FlashCard) => (reversed ? card.definition : card.term);
    const expectedOf = (card: FlashCard) => (reversed ? card.term : card.definition);

    const startRound = (list: FlashCard[]) => {
        setQueue(shuffle ? shuffled(list) : list);
        setPosition(0);
        setOutcomes([]);
        setAnswer("");
        setResult(null);
        setStarted(true);
    };

    // ---------- Start screen ----------
    if (!started) {
        return (
            <div className="overflow-hidden rounded-3xl border bg-card shadow-lg">
                <div className={cn("h-2 bg-gradient-to-r", gradient)} />
                <div className="space-y-6 p-6 sm:p-8">
                    <div className="space-y-1 text-center">
                        <h3 className="text-xl font-semibold">Type the answers</h3>
                        <p className="text-sm text-muted-foreground">
                            {cards.length} {cards.length === 1 ? "card" : "cards"} · you'll see the{" "}
                            {promptLabel.toLowerCase()} and type the {answerLabel.toLowerCase()}
                        </p>
                    </div>

                    <div role="radiogroup" aria-label="Card order" className="grid gap-3 sm:grid-cols-2">
                        {ORDER_OPTIONS.map(({ value, label, description, icon: Icon }) => {
                            const selected = shuffle === value;
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => onShuffleChange(value)}
                                    className={cn(
                                        "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                                        selected
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "hover:bg-muted/50",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                                            selected
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        <Icon className="size-4" />
                                    </span>
                                    <span>
                                        <span className="block font-medium">{label}</span>
                                        <span className="block text-sm text-muted-foreground">{description}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-center">
                        <Button size="lg" autoFocus onClick={() => startRound(cards)}>
                            Start <ArrowRight />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const finished = position >= queue.length;

    // ---------- Summary ----------
    if (finished) {
        const correctCount = outcomes.filter((o) => o.correct).length;
        const missed = outcomes.filter((o) => !o.correct).map((o) => o.card);
        const percentage = Math.round((correctCount / outcomes.length) * 100);

        return (
            <div className="space-y-6 rounded-3xl border bg-card p-8 shadow-lg">
                <div className="space-y-1 text-center">
                    <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Round complete</p>
                    <p className={cn("bg-gradient-to-r bg-clip-text text-6xl font-bold text-transparent", gradient)}>
                        {percentage}%
                    </p>
                    <p className="text-muted-foreground">
                        {correctCount} of {outcomes.length} correct
                    </p>
                </div>

                {missed.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold">To review</h3>
                        <ul className="space-y-2">
                            {missed.map((card) => (
                                <li
                                    key={card.id}
                                    className="grid gap-1 rounded-xl border bg-background p-3 text-sm sm:grid-cols-2 sm:gap-4"
                                >
                                    <span className="font-medium">{promptOf(card)}</span>
                                    <span className="text-muted-foreground">{expectedOf(card)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex flex-wrap justify-center gap-3">
                    {missed.length > 0 && (
                        <Button onClick={() => startRound(missed)}>
                            <RotateCcw /> Retry missed ({missed.length})
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => startRound(cards)}>
                        Practice all again
                    </Button>
                    <Button variant="ghost" onClick={() => setStarted(false)}>
                        Change options
                    </Button>
                </div>
            </div>
        );
    }

    // ---------- Active round ----------
    const card = queue[position];
    const expected = expectedOf(card);
    const progress = (position / queue.length) * 100;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (result === null) {
            if (!answer.trim()) return;
            setResult(isCorrectAnswer(answer, expected) ? "correct" : "incorrect");
            return;
        }

        const correct = result === "correct";
        onReview?.(card, correct);
        setOutcomes((prev) => [...prev, { card, correct }]);
        setPosition((p) => p + 1);
        setAnswer("");
        setResult(null);
    };

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="tabular-nums">
                        {position + 1} / {queue.length}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                        {shuffle ? <Shuffle className="size-3.5" /> : <ListOrdered className="size-3.5" />}
                        {shuffle ? "Shuffled" : "In order"}
                    </span>
                    <span className="tabular-nums">{outcomes.filter((o) => o.correct).length} correct</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-300", gradient)}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border bg-card shadow-lg">
                <div className={cn("h-2 bg-gradient-to-r", gradient)} />
                <div className="space-y-6 p-6 sm:p-8">
                    <div className="space-y-2 text-center">
                        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            {promptLabel}
                        </span>
                        <p className="whitespace-pre-wrap break-words text-2xl font-semibold sm:text-3xl">
                            {promptOf(card)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="typing-answer"
                            className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
                        >
                            Type the {answerLabel.toLowerCase()}
                        </label>
                        <Input
                            key={position}
                            id="typing-answer"
                            autoFocus
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            value={answer}
                            readOnly={result !== null}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={`Your ${answerLabel.toLowerCase()}...`}
                            className="h-12 text-base"
                        />
                    </div>

                    {result && (
                        <div
                            className={cn(
                                "space-y-2 rounded-2xl border p-4 text-sm",
                                result === "correct"
                                    ? "border-emerald-500/40 bg-emerald-500/10"
                                    : "border-red-500/40 bg-red-500/10",
                            )}
                        >
                            {result === "correct" ? (
                                <p className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="size-5" /> Correct!
                                </p>
                            ) : (
                                <>
                                    <p className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
                                        <XCircle className="size-5" /> Not quite
                                    </p>
                                    <dl className="grid gap-1">
                                        {answer.trim() && (
                                            <div className="flex gap-2">
                                                <dt className="w-28 shrink-0 text-muted-foreground">Your answer</dt>
                                                <dd className="whitespace-pre-wrap break-words">{answer}</dd>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <dt className="w-28 shrink-0 text-muted-foreground">Correct answer</dt>
                                            <dd className="whitespace-pre-wrap break-words font-medium">{expected}</dd>
                                        </div>
                                    </dl>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex gap-2">
                            {result === null && (
                                <Button type="button" variant="ghost" onClick={() => setResult("incorrect")}>
                                    Don't know
                                </Button>
                            )}
                            {result === "incorrect" && answer.trim() && (
                                <Button type="button" variant="ghost" onClick={() => setResult("correct")}>
                                    I was right
                                </Button>
                            )}
                        </div>
                        <Button type="submit" disabled={result === null && !answer.trim()}>
                            {result === null ? (
                                "Check"
                            ) : (
                                <>
                                    {position + 1 === queue.length ? "Finish" : "Next"} <ArrowRight />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TypingPractice;