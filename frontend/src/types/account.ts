export interface Account {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface DailyReviewCount {
    date: string;
    count: number;
}

export interface UserStats {
    totalSets: number;
    totalCards: number;
    newCards: number;
    learningCards: number;
    masteredCards: number;
    dueToday: number;
    totalReviews: number;
    correctReviews: number;
    lastStudied: string | null;
    /** [new, box 1, box 2, box 3, box 4, box 5] */
    cardsPerBox: number[];
    upcoming: DailyReviewCount[];
}