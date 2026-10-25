// services/importing/ImportService.java
package com.fnafke.lizlet.services.importing;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fnafke.lizlet.dto.ImportPreviewResponse;
import com.fnafke.lizlet.dto.ParsedCard;
import com.fnafke.lizlet.models.exceptions.ImportException;

@Service
public class ImportService {

    private static final long MAX_FILE_BYTES = 10L * 1024 * 1024;
    private static final int MAX_CARDS = 2000;
    private static final int MAX_WARNINGS = 50;

    private final PdfVocabularyParser pdfParser;
    private final DocxVocabularyParser docxParser;

    public ImportService(PdfVocabularyParser pdfParser, DocxVocabularyParser docxParser) {
        this.pdfParser = pdfParser;
        this.docxParser = docxParser;
    }

    public ImportPreviewResponse parse(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ImportException("Choose a file to import.");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new ImportException("This file is too large. The maximum size is 10 MB.");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new ImportException("The file could not be read.");
        }

        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);

        ImportPreviewResponse result;
        if (name.endsWith(".pdf") && startsWith(bytes, "%PDF-")) {
            result = pdfParser.parse(bytes);
        } else if (name.endsWith(".docx") && startsWith(bytes, "PK")) {
            result = docxParser.parse(bytes);
        } else if (name.endsWith(".doc")) {
            throw new ImportException("Old .doc files are not supported. Save the file as .docx and try again.");
        } else {
            throw new ImportException("Unsupported file. Upload a .pdf or .docx file.");
        }

        List<ParsedCard> cards = result.cards();
        List<String> warnings = new ArrayList<>(result.warnings());

        if (cards.size() > MAX_CARDS) {
            cards = cards.subList(0, MAX_CARDS);
            warnings.add("Only the first " + MAX_CARDS + " cards were imported.");
        }
        if (warnings.size() > MAX_WARNINGS) {
            int extra = warnings.size() - MAX_WARNINGS;
            warnings = new ArrayList<>(warnings.subList(0, MAX_WARNINGS));
            warnings.add("...and " + extra + " more warnings.");
        }

        return new ImportPreviewResponse(cards, warnings);
    }

    private boolean startsWith(byte[] bytes, String prefix) {
        byte[] expected = prefix.getBytes(StandardCharsets.US_ASCII);
        if (bytes.length < expected.length) {
            return false;
        }
        for (int i = 0; i < expected.length; i++) {
            if (bytes[i] != expected[i]) {
                return false;
            }
        }
        return true;
    }
}