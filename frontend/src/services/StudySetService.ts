import type { CardInput, CreateStudySetInput, FlashCard, UpdateStudySetInput } from "@/types/studySet";
import { assertOk } from "@/utils/apiUtils";

const STUDY_SETS_URL = `${import.meta.env.VITE_API_BASE_URL}/study-sets`;
const JSON_HEADERS = { "Content-Type": "application/json" };
const BULK_CHUNK_SIZE = 100;

const fetchStudySets = async (): Promise<Response> => {
    try {
        const response = await fetch(STUDY_SETS_URL, {
            method: "GET",
            credentials: "include",
        });
        return response;
    } catch (error) {
        console.error("Error fetching study sets:", error);
        throw error;
    }
};

const fetchStudySet = async (setId: string): Promise<Response> => {
    try {
        const response = await fetch(`${STUDY_SETS_URL}/${setId}`, {
            method: "GET",
            credentials: "include",
        });
        return response;
    } catch (error) {
        console.error("Error fetching study set:", error);
        throw error;
    }
};

const createStudySet = async (input: CreateStudySetInput): Promise<Response> => {
    try {
        const response = await fetch(STUDY_SETS_URL, {
            method: "POST",
            headers: JSON_HEADERS,
            credentials: "include",
            body: JSON.stringify(input),
        });
        return response;
    } catch (error) {
        console.error("Error creating study set:", error);
        throw error;
    }
};

const updateStudySet = async (setId: string, input: UpdateStudySetInput): Promise<Response> => {
    try {
        const response = await fetch(`${STUDY_SETS_URL}/${setId}`, {
            method: "PUT",
            headers: JSON_HEADERS,
            credentials: "include",
            body: JSON.stringify(input),
        });
        return response;
    } catch (error) {
        console.error("Error updating study set:", error);
        throw error;
    }
};

const deleteStudySet = async (setId: string): Promise<Response> => {
    try {
        const response = await fetch(`${STUDY_SETS_URL}/${setId}`, {
            method: "DELETE",
            credentials: "include",
        });
        return response;
    } catch (error) {
        console.error("Error deleting study set:", error);
        throw error;
    }
};

const addCard = async (setId: string, input: CardInput): Promise<Response> => {
    try {
        const response = await fetch(`${STUDY_SETS_URL}/${setId}/cards`, {
            method: "POST",
            headers: JSON_HEADERS,
            credentials: "include",
            body: JSON.stringify(input),
        });
        return response;
    } catch (error) {
        console.error("Error adding card:", error);
        throw error;
    }
};

const addCardsBulk = async (setId: string, cards: CardInput[]): Promise<Response> => {
    try {
        const response = await fetch(`${STUDY_SETS_URL}/${setId}/cards/bulk`, {
            method: "POST",
            headers: JSON_HEADERS,
            credentials: "include",
            body: JSON.stringify({ cards }),
        });
        return response;
    } catch (error) {
        console.error("Error adding cards:", error);
        throw error;
    }
};

const updateCard = async (setId: string, cardId: string, input: CardInput): Promise<Response> => {
    try {
        const response = await fetch(`${STUDY_SETS_URL}/${setId}/cards/${cardId}`, {
            method: "PUT",
            headers: JSON_HEADERS,
            credentials: "include",
            body: JSON.stringify(input),
        });
        return response;
    } catch (error) {
        console.error("Error updating card:", error);
        throw error;
    }
};

const deleteCard = async (setId: string, cardId: string): Promise<Response> => {
    try {
        const response = await fetch(`${STUDY_SETS_URL}/${setId}/cards/${cardId}`, {
            method: "DELETE",
            credentials: "include",
        });
        return response;
    } catch (error) {
        console.error("Error deleting card:", error);
        throw error;
    }
};

/**
 * Uploads a PDF/Word file and returns the parsed cards (nothing is saved on the server).
 * Uses XMLHttpRequest because fetch cannot report upload progress.
 * If your other requests send a CSRF header, add it here too.
 */
const parseImportFile = (file: File, onUploadProgress?: (percent: number) => void): Promise<Response> =>
    new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${STUDY_SETS_URL}/import/parse`);
        xhr.withCredentials = true;

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                onUploadProgress?.(Math.round((event.loaded / event.total) * 100));
            }
        };
        xhr.upload.onload = () => onUploadProgress?.(100);

        xhr.onload = () => {
            resolve(
                new Response(xhr.responseText, {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: { "Content-Type": "application/json" },
                }),
            );
        };
        xhr.onerror = () => {
            console.error("Error uploading import file");
            reject(new Error("Network error while uploading the file."));
        };
        xhr.onabort = () => reject(new Error("The upload was cancelled."));

        xhr.send(formData);
    });

/**
 * Brings the server's cards in line with the rows in the form: deletes removed cards, updates
 * changed ones, then adds new ones in chunks. Throws if any request fails.
 */
const syncCards = async (
    setId: string,
    original: FlashCard[],
    rows: Array<CardInput & { id?: string }>,
    onProgress?: (done: number, total: number) => void,
): Promise<void> => {
    const keptIds = new Set(rows.filter((r) => r.id).map((r) => r.id));
    const toDelete = original.filter((card) => !keptIds.has(card.id));

    const toUpdate: Array<{ id: string; term: string; definition: string }> = [];
    const toAdd: CardInput[] = [];

    for (const row of rows) {
        const term = row.term.trim();
        const definition = row.definition.trim();

        if (!row.id) {
            toAdd.push({ term, definition });
            continue;
        }
        const previous = original.find((c) => c.id === row.id);
        if (previous && (previous.term !== term || previous.definition !== definition)) {
            toUpdate.push({ id: row.id, term, definition });
        }
    }

    const total = toDelete.length + toUpdate.length + toAdd.length;
    let done = 0;
    const report = (count: number) => {
        done += count;
        onProgress?.(done, total);
    };
    onProgress?.(0, total);

    for (const card of toDelete) {
        await assertOk(await deleteCard(setId, card.id));
        report(1);
    }
    for (const { id, term, definition } of toUpdate) {
        await assertOk(await updateCard(setId, id, { term, definition }));
        report(1);
    }
    for (let i = 0; i < toAdd.length; i += BULK_CHUNK_SIZE) {
        const chunk = toAdd.slice(i, i + BULK_CHUNK_SIZE);
        await assertOk(await addCardsBulk(setId, chunk));
        report(chunk.length);
    }
};

export const StudySetService = {
    fetchStudySets,
    fetchStudySet,
    createStudySet,
    updateStudySet,
    deleteStudySet,
    addCard,
    addCardsBulk,
    updateCard,
    deleteCard,
    parseImportFile,
    syncCards,
};