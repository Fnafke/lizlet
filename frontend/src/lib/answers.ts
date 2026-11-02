// Typographic apostrophes and look-alikes (’ ‘ ʼ ` ´) that PDFs often contain; typed as a plain ' on a keyboard.
const APOSTROPHE_LOOKALIKES = /[\u2019\u2018\u02BC\u0060\u00B4]/g;

export function normalizeAnswer(value: string): string {
    return value.normalize("NFC").replace(APOSTROPHE_LOOKALIKES, "'").trim().replace(/\s+/g, " ")//.toLocaleLowerCase();
}

export function isCorrectAnswer(input: string, expected: string): boolean {
    return normalizeAnswer(input) === normalizeAnswer(expected);
}