import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CardProgress, FlashCard } from "@/types/studySet";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface TermsListProps {
    cards: FlashCard[];
    progressByCard: Record<string, CardProgress>;
}

const boxLabel = (progress: CardProgress | undefined) => {
    if (!progress) return "New";
    if (progress.box >= 5) return "Mastered";
    return `Box ${progress.box}`;
};

const TermsList = ({ cards, progressByCard }: TermsListProps) => {
    const [open, setOpen] = useState(false);

    return (
        <section className="space-y-4">
            <Button variant="outline" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
                {open ? <EyeOff /> : <Eye />}
                {open ? "Hide terms" : `Show terms (${cards.length})`}
            </Button>

            {open && (
                <ul className="grid gap-3">
                    {cards.map((card, i) => {
                        const progress = progressByCard[card.id];
                        return (
                            <li
                                key={card.id}
                                className="grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-[2rem_1fr_1fr_auto] sm:items-start sm:gap-6"
                            >
                                <span className="text-sm font-medium text-muted-foreground">{i + 1}</span>
                                <p className="whitespace-pre-wrap break-words font-medium">{card.term}</p>
                                <p className="whitespace-pre-wrap break-words text-muted-foreground">
                                    {card.definition}
                                </p>
                                <Badge variant={progress ? "secondary" : "outline"}>{boxLabel(progress)}</Badge>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
};

export default TermsList;