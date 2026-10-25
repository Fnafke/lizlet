package com.fnafke.lizlet.services.importing;

import java.text.Normalizer;
import java.util.List;

import com.fnafke.lizlet.dto.ParsedCard;

final class ImportSupport {

    private ImportSupport() {
    }

    /**
     * NFC-normalizes (so "é" is one character, which matters for the typing mode)
     * and tidies whitespace.
     */
    static String clean(String raw) {
        if (raw == null) {
            return "";
        }
        String text = Normalizer.normalize(raw, Normalizer.Form.NFC)
                .replace("\u200B", "")
                .replace("\u00AD", "");
        return text.replaceAll("[\\p{Zs}\\s]+", " ").trim();
    }

    /**
     * Pairs two lists by position. A different count flags every card of the block
     * for review.
     */
    static void pair(List<String> terms, List<String> definitions, String where,
            List<ParsedCard> cards, List<String> warnings) {
        boolean aligned = terms.size() == definitions.size();
        int count = Math.max(terms.size(), definitions.size());

        if (!aligned) {
            String first = !terms.isEmpty() ? terms.get(0) : definitions.get(0);
            warnings.add("%s: %d terms but %d definitions (block starting with \"%s\"). Check these cards."
                    .formatted(where, terms.size(), definitions.size(), first));
        }

        for (int i = 0; i < count; i++) {
            String term = i < terms.size() ? terms.get(i) : "";
            String definition = i < definitions.size() ? definitions.get(i) : "";
            cards.add(new ParsedCard(term, definition, !aligned));
        }
    }
}