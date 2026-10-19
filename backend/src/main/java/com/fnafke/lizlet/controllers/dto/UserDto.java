package com.fnafke.lizlet.controllers.dto;

import java.util.UUID;

import com.fnafke.lizlet.models.User;

public record UserDto(
        UUID id,
        String username,
        String email,
        String role) {
    public UserDto(User user) {
        this(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name());
    }
}
