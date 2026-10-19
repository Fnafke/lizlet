package com.fnafke.lizlet.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.fnafke.lizlet.models.StudySet;

public record StudySetDetailResponse(
        UUID id, String title, String description, List<CardResponse> cards,
        LocalDate createdAt, LocalDate updatedAt) {

    public static StudySetDetailResponse from(StudySet set) {
        return new StudySetDetailResponse(set.getId(), set.getTitle(), set.getDescription(),
                set.getCards().stream().map(CardResponse::from).toList(),
                set.getCreatedAt(), set.getUpdatedAt());
    }
}