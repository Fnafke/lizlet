import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowBigUp } from "lucide-react";
import { useState } from "react";

interface SpecialCharactersProps {
    onInsert: (character: string) => void;
    disabled?: boolean;
}

// Letters for French and Dutch. "ß" is left out on purpose: its uppercase form is "SS".
const CHARACTERS = [
    "à", "â", "ä", "é", "è", "ê", "ë", "î", "ï",
    "ô", "ö", "ù", "û", "ü", "ç", "œ", "æ", "ÿ",
];

const SpecialCharacters = ({ onInsert, disabled = false }: SpecialCharactersProps) => {
    const [upper, setUpper] = useState(false);

    const insert = (character: string) => {
        onInsert(upper ? character.toLocaleUpperCase() : character);
        setUpper(false); // shift applies to one letter, like on a phone keyboard
    };

    // Keeps the focus (and the cursor position) in the answer field when a button is pressed.
    const keepFocus = (e: React.MouseEvent) => e.preventDefault();

    return (
        <div className="space-y-1.5" role="group" aria-label="Special characters">
            <p className="text-xs text-muted-foreground">Special characters</p>
            <div className="flex flex-wrap gap-1.5">
                <Button
                    type="button"
                    variant={upper ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={disabled}
                    aria-pressed={upper}
                    aria-label="Uppercase for the next letter"
                    title="Uppercase for the next letter"
                    onMouseDown={keepFocus}
                    onClick={() => setUpper((u) => !u)}
                >
                    <ArrowBigUp className="size-4" />
                </Button>

                {CHARACTERS.map((character) => {
                    const shown = upper ? character.toLocaleUpperCase() : character;
                    return (
                        <Button
                            key={character}
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn("h-8 w-8 p-0 text-base font-normal")}
                            disabled={disabled}
                            aria-label={`Insert ${shown}`}
                            onMouseDown={keepFocus}
                            onClick={() => insert(character)}
                        >
                            {shown}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default SpecialCharacters;