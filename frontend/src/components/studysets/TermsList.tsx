import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CardProgress, FlashCard } from "@/types/studySet";
import { Eye, EyeOff, Search, X } from "lucide-react";
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

// Case- and accent-insensitive, so "ecole" finds "école".
const fold = (text: string) =>
    text
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .replace(/[\u2018\u2019\u02BC]/g, "'")
        .toLowerCase();

const TermsList = ({ cards, progressByCard }: TermsListProps) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const needle = fold(query.trim());
    const searching = needle !== "";
    // Keep each card's original number so it still matches its position in the set.
    const visible = cards
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => !searching || fold(card.term).includes(needle) || fold(card.definition).includes(needle));
    // Searching always shows the results, even when the list is collapsed.
    const showList = open || searching;

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => setOpen((o) => !o)} aria-expanded={showList}>
                    {showList ? <EyeOff /> : <Eye />}
                    {showList ? "Hide terms" : `Show terms (${cards.length})`}
                </Button>

                <div className="relative min-w-48 flex-1 sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") setQuery("");
                        }}
                        placeholder="Search terms or definitions..."
                        aria-label="Search terms and definitions"
                        autoComplete="off"
                        spellCheck={false}
                        className="pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>
            </div>

            {showList && visible.length === 0 && (
                <p className="text-sm text-muted-foreground">No terms or definitions match "{query.trim()}".</p>
            )}

            {showList && visible.length > 0 && (
                <ul className="grid gap-3">
                    {visible.map(({ card, index: i }) => {
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