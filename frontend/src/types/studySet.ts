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

// ---------- Progress ----------

export interface CardProgress {
    cardId: string;
    box: number;
    streak: number;
    correctCount: number;
    incorrectCount: number;
    lastReviewedAt: string | null;
    nextReviewAt: string | null;
    due: boolean;
}

export interface SetProgress {
    setId: string;
    total: number;
    newCount: number;
    learningCount: number;
    masteredCount: number;
    dueCount: number;
    cards: CardProgress[];
}

export interface SetProgressSummary {
    setId: string;
    title: string;
    total: number;
    newCount: number;
    learningCount: number;
    masteredCount: number;
    dueCount: number;
}

export interface ProgressOverview {
    totalDue: number;
    sets: SetProgressSummary[];
}