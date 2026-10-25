export function normalizeAnswer(value: string): string {
    return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function isCorrectAnswer(input: string, expected: string): boolean {
    return normalizeAnswer(input) === normalizeAnswer(expected);
}