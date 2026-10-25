package com.fnafke.lizlet.models;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "card_progress", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "card_id" }))
public class CardProgress {

    public static final int MAX_BOX = 5;

    // Days until the next review, indexed by box (index 0 is unused).
    private static final int[] INTERVAL_DAYS = { 0, 1, 2, 4, 8, 16 };

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Plain id columns (the FKs are enforced in the database) so we never load
    // User or Card just to read or update progress.
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "card_id", nullable = false, updatable = false)
    private UUID cardId;

    @Column(name = "box", nullable = false)
    private int box = 1;

    @Column(name = "streak", nullable = false)
    private int streak = 0;

    @Column(name = "correct_count", nullable = false)
    private int correctCount = 0;

    @Column(name = "incorrect_count", nullable = false)
    private int incorrectCount = 0;

    @Column(name = "last_reviewed_at")
    private LocalDate lastReviewedAt;

    @Column(name = "next_review_at")
    private LocalDate nextReviewAt;

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt = LocalDate.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDate updatedAt = LocalDate.now();

    protected CardProgress() {
    }

    public CardProgress(UUID userId, UUID cardId) {
        this.userId = userId;
        this.cardId = cardId;
    }

    /**
     * Leitner rules:
     * - wrong: back to box 1, due again tomorrow
     * - correct and due: up one box (max 5), next review after that box's interval
     * - correct but not due yet (extra practice): only the counters change
     */
    public void recordReview(boolean correct, LocalDate today) {
        if (correct) {
            correctCount++;
            streak++;
            if (isDue(today)) {
                box = Math.min(MAX_BOX, box + 1);
                nextReviewAt = today.plusDays(INTERVAL_DAYS[box]);
            }
        } else {
            incorrectCount++;
            streak = 0;
            box = 1;
            nextReviewAt = today.plusDays(INTERVAL_DAYS[1]);
        }
        lastReviewedAt = today;
        updatedAt = today;
    }

    public boolean isDue(LocalDate today) {
        return nextReviewAt == null || !nextReviewAt.isAfter(today);
    }

    public boolean isMastered() {
        return box >= MAX_BOX;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getCardId() {
        return cardId;
    }

    public int getBox() {
        return box;
    }

    public int getStreak() {
        return streak;
    }

    public int getCorrectCount() {
        return correctCount;
    }

    public int getIncorrectCount() {
        return incorrectCount;
    }

    public LocalDate getLastReviewedAt() {
        return lastReviewedAt;
    }

    public LocalDate getNextReviewAt() {
        return nextReviewAt;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }
}