import type { CardInput, CreateStudySetInput, FlashCard, UpdateStudySetInput } from "@/types/studySet";
import { assertOk } from "@/utils/apiUtils";

const STUDY_SETS_URL = `${import.meta.env.VITE_API_BASE_URL}/study-sets`;
const JSON_HEADERS = { "Content-Type": "application/json" };

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
 * Brings the server's cards in line with the rows in the form:
 * deletes removed cards, updates changed ones, adds new ones (in order).
 * Throws if any request fails.
 */
const syncCards = async (
    setId: string,
    original: FlashCard[],
    rows: Array<CardInput & { id?: string }>,
): Promise<void> => {
    const keptIds = new Set(rows.filter((r) => r.id).map((r) => r.id));

    for (const card of original) {
        if (!keptIds.has(card.id)) {
            await assertOk(await deleteCard(setId, card.id));
        }
    }

    for (const row of rows) {
        const term = row.term.trim();
        const definition = row.definition.trim();

        if (!row.id) {
            await assertOk(await addCard(setId, { term, definition }));
            continue;
        }

        const previous = original.find((c) => c.id === row.id);
        if (previous && (previous.term !== term || previous.definition !== definition)) {
            await assertOk(await updateCard(setId, row.id, { term, definition }));
        }
    }
};

export const StudySetService = {
    fetchStudySets,
    fetchStudySet,
    createStudySet,
    updateStudySet,
    deleteStudySet,
    addCard,
    updateCard,
    deleteCard,
    syncCards,
};