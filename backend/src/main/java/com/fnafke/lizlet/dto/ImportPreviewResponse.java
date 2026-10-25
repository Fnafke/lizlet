package com.fnafke.lizlet.dto;

import java.util.List;

public record ImportPreviewResponse(List<ParsedCard> cards, List<String> warnings) {
}