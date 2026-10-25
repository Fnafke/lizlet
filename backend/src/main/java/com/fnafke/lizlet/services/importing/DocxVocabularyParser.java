package com.fnafke.lizlet.services.importing;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.stereotype.Component;

import com.fnafke.lizlet.dto.ImportPreviewResponse;
import com.fnafke.lizlet.dto.ParsedCard;
import com.fnafke.lizlet.models.exceptions.ImportException;

@Component
public class DocxVocabularyParser {

    public ImportPreviewResponse parse(byte[] bytes) {
        List<ParsedCard> cards = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        try (XWPFDocument document = new XWPFDocument(new ByteArrayInputStream(bytes))) {
            List<XWPFTable> tables = document.getTables();
            if (tables.isEmpty()) {
                warnings.add("No tables were found in this document. Only tables are imported.");
            }

            int tableNumber = 0;
            for (XWPFTable table : tables) {
                tableNumber++;
                int rowNumber = 0;
                for (XWPFTableRow row : table.getRows()) {
                    rowNumber++;
                    List<XWPFTableCell> cells = row.getTableCells();
                    if (cells.size() < 2) {
                        continue;
                    }
                    List<String> terms = entries(cells.get(0));
                    List<String> definitions = entries(cells.get(1));
                    if (terms.isEmpty() && definitions.isEmpty()) {
                        continue;
                    }
                    ImportSupport.pair(terms, definitions,
                            "Table %d, row %d".formatted(tableNumber, rowNumber), cards, warnings);
                }
            }
        } catch (IOException | RuntimeException e) {
            throw new ImportException("This Word file could not be read. Make sure it is a valid .docx file.");
        }

        return new ImportPreviewResponse(cards, warnings);
    }

    // One entry per paragraph. Blank paragraphs are dropped: they are only used to
    // keep the
    // left and right column visually aligned when an entry on the other side wraps.
    private List<String> entries(XWPFTableCell cell) {
        List<String> entries = new ArrayList<>();
        for (XWPFParagraph paragraph : cell.getParagraphs()) {
            for (String line : paragraph.getText().split("\\R")) {
                String cleaned = ImportSupport.clean(line);
                if (!cleaned.isEmpty()) {
                    entries.add(cleaned);
                }
            }
        }
        return entries;
    }
}