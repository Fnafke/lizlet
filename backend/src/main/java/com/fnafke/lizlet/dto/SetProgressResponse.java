package com.fnafke.lizlet.dto;

import java.util.List;
import java.util.UUID;

/**
 * Only cards that have been reviewed at least once appear in `cards`; the rest
 * are "new".
 */
public record SetProgressResponse(
        UUID setId, int total, int newCount, int learningCount, int masteredCount, int dueCount,
        List<CardProgressResponse> cards) {
}