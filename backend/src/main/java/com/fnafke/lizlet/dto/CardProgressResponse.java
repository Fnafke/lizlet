package com.fnafke.lizlet.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.fnafke.lizlet.models.CardProgress;

public record CardProgressResponse(
        UUID cardId, int box, int streak, int correctCount, int incorrectCount,
        LocalDate lastReviewedAt, LocalDate nextReviewAt, boolean due) {

    public static CardProgressResponse from(CardProgress progress, LocalDate today) {
        return new CardProgressResponse(progress.getCardId(), progress.getBox(), progress.getStreak(),
                progress.getCorrectCount(), progress.getIncorrectCount(), progress.getLastReviewedAt(),
                progress.getNextReviewAt(), progress.isDue(today));
    }
}