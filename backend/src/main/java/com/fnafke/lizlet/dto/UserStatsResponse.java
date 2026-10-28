package com.fnafke.lizlet.dto;

import java.time.LocalDate;
import java.util.List;

/** cardsPerBox is [new, box 1, box 2, box 3, box 4, box 5]. */
public record UserStatsResponse(
        int totalSets, int totalCards, int newCards, int learningCards, int masteredCards,
        int dueToday, int totalReviews, int correctReviews, LocalDate lastStudied,
        List<Integer> cardsPerBox, List<DailyReviewCount> upcoming) {
}