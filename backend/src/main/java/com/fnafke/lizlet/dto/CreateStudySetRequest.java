package com.fnafke.lizlet.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateStudySetRequest(
                @NotBlank @Size(max = 100) String title,
                @Size(max = 500) String description,
                @Valid List<CardRequest> cards) {
}