package com.fnafke.lizlet.dto;

import java.util.UUID;

public record SetProgressSummary(
        UUID setId, String title, int total, int newCount, int learningCount, int masteredCount, int dueCount) {
}