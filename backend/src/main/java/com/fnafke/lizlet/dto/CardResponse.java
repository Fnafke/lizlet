package com.fnafke.lizlet.dto;

import java.util.UUID;

import com.fnafke.lizlet.models.Card;

public record CardResponse(UUID id, String term, String definition, int sortOrder) {

    public static CardResponse from(Card card) {
        return new CardResponse(card.getId(), card.getTerm(), card.getDefinition(), card.getSortOrder());
    }
}