package com.fnafke.lizlet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CardRequest(
                @NotBlank @Size(max = 500) String term,
                @NotBlank @Size(max = 1000) String definition) {
}