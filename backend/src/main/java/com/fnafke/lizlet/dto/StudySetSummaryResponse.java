package com.fnafke.lizlet.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.fnafke.lizlet.models.StudySet;

public record StudySetSummaryResponse(
        UUID id, String title, String description, int cardCount,
        LocalDate createdAt, LocalDate updatedAt) {

    public static StudySetSummaryResponse from(StudySet set) {
        return new StudySetSummaryResponse(set.getId(), set.getTitle(), set.getDescription(),
                set.getCards().size(), set.getCreatedAt(), set.getUpdatedAt());
    }
}