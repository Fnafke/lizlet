package com.fnafke.lizlet.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record BulkCardsRequest(@NotEmpty @Size(max = 2000) @Valid List<CardRequest> cards) {
}
