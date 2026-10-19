export interface FlashCard {
    id: string;
    term: string;
    definition: string;
    sortOrder: number;
}

export interface StudySetSummary {
    id: string;
    title: string;
    description: string | null;
    cardCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface StudySetDetail {
    id: string;
    title: string;
    description: string | null;
    cards: FlashCard[];
    createdAt: string;
    updatedAt: string;
}

export interface CardInput {
    term: string;
    definition: string;
}

export interface CreateStudySetInput {
    title: string;
    description: string | null;
    cards: CardInput[];
}

export interface UpdateStudySetInput {
    title: string;
    description: string | null;
}