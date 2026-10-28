package com.fnafke.lizlet.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.fnafke.lizlet.models.User;

public record AccountResponse(
        UUID id, String username, String email, String role, LocalDate createdAt, LocalDate updatedAt) {

    public static AccountResponse from(User user) {
        return new AccountResponse(user.getId(), user.getUsername(), user.getEmail(),
                user.getRole().name(), user.getCreatedAt(), user.getUpdatedAt());
    }
}