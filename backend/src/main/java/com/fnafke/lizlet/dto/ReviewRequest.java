package com.fnafke.lizlet.dto;

import jakarta.validation.constraints.NotNull;

public record ReviewRequest(@NotNull Boolean correct) {
}