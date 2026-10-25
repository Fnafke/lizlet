package com.fnafke.lizlet.services.importing;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.springframework.stereotype.Component;

import com.fnafke.lizlet.dto.ImportPreviewResponse;
import com.fnafke.lizlet.dto.ParsedCard;
import com.fnafke.lizlet.models.exceptions.ImportException;

/**
 * Reads a two-column vocabulary table (terms left, definitions right).
 *
 * Word exports such a table cell by cell: first all lines of a left cell, then
 * all lines of the
 * matching right cell. Each such pair is a "block". Inside a block, lines at
 * the same height
 * belong together.
 */
@Component
public class PdfVocabularyParser {

    private static final int MAX_PAGES = 200;
    private static final double ROW_TOLERANCE = 2.5; // points

    public ImportPreviewResponse parse(byte[] bytes) {
        List<List<Line>> pages = readLines(bytes);
        List<String> warnings = new ArrayList<>();
        List<ParsedCard> cards = new ArrayList<>();

        removeNoise(pages, warnings);

        List<Line> all = pages.stream().flatMap(List::stream).toList();
        if (all.size() < 2) {
            throw new ImportException("No table content was found in this PDF.");
        }
        double boundary = findColumnBoundary(all);

        for (List<Line> page : pages) {
            readPage(page, boundary, cards, warnings);
        }
        return new ImportPreviewResponse(cards, warnings);
    }

    // ---------- Reading ----------

    private List<List<Line>> readLines(byte[] bytes) {
        try (PDDocument document = Loader.loadPDF(bytes)) {
            if (document.getNumberOfPages() > MAX_PAGES) {
                throw new ImportException("This PDF has more than " + MAX_PAGES + " pages.");
            }
            GlyphCollector collector = new GlyphCollector();
            collector.getText(document);
            return collector.toLines();
        } catch (ImportException e) {
            throw e;
        } catch (IOException | RuntimeException e) {
            throw new ImportException("This PDF could not be read. It may be damaged or password protected.");
        }
    }

    /**
     * Collects every glyph with its position, in content-stream order, grouped per
     * page.
     */
    private static final class GlyphCollector extends PDFTextStripper {

        private final List<List<TextPosition>> pages = new ArrayList<>();

        GlyphCollector() throws IOException {
            setSortByPosition(false); // keep the order of the file: cell by cell
        }

        @Override
        protected void startPage(PDPage page) throws IOException {
            pages.add(new ArrayList<>());
            super.startPage(page);
        }

        @Override
        protected void writeString(String text, List<TextPosition> positions) throws IOException {
            pages.get(pages.size() - 1).addAll(positions);
        }

        List<List<Line>> toLines() {
            List<List<Line>> result = new ArrayList<>();
            for (int p = 0; p < pages.size(); p++) {
                List<Line> lines = new ArrayList<>();
                Line current = null;

                for (TextPosition glyph : pages.get(p)) {
                    String ch = glyph.getUnicode();
                    if (ch == null || ch.isEmpty()) {
                        continue;
                    }
                    double size = glyph.getFontSizeInPt() > 0 ? glyph.getFontSizeInPt() : 10;
                    double x = glyph.getXDirAdj();
                    double end = x + glyph.getWidthDirAdj();
                    double y = glyph.getYDirAdj();

                    if (current != null && current.accepts(x, y)) {
                        current.append(ch, x, end);
                    } else if (!ch.isBlank()) {
                        current = new Line(p + 1, glyph.getPageHeight(), x, y, size);
                        lines.add(current);
                        current.append(ch, x, end);
                    }
                }

                lines.removeIf(l -> l.text().isEmpty());
                result.add(lines);
            }
            return result;
        }
    }

    private static final class Line {
        final int page;
        final double pageHeight;
        final double startX;
        final double y;
        final double fontSize;
        double endX;
        private final StringBuilder text = new StringBuilder();

        Line(int page, double pageHeight, double startX, double y, double fontSize) {
            this.page = page;
            this.pageHeight = pageHeight;
            this.startX = startX;
            this.endX = startX;
            this.y = y;
            this.fontSize = fontSize;
        }

        // Same line when the baseline matches and the next glyph follows closely. A big
        // jump to
        // the right means the next glyph belongs to the other column.
        boolean accepts(double glyphX, double glyphY) {
            return Math.abs(glyphY - y) <= 0.5 * fontSize
                    && glyphX >= endX - 0.5 * fontSize
                    && glyphX - endX <= 3 * fontSize;
        }

        void append(String ch, double glyphStart, double glyphEnd) {
            if (ch.isBlank()) {
                if (text.length() > 0 && text.charAt(text.length() - 1) != ' ') {
                    text.append(' ');
                }
                return;
            }
            if (text.length() > 0 && text.charAt(text.length() - 1) != ' ' && glyphStart - endX > 0.25 * fontSize) {
                text.append(' ');
            }
            text.append(ch);
            endX = glyphEnd;
        }

        String text() {
            return text.toString().trim();
        }
    }

    // ---------- Noise ----------

    private void removeNoise(List<List<Line>> pages, List<String> warnings) {
        // Page numbers, headers and footers: capitals/digits only, in the top or bottom
        // margin.
        for (List<Line> page : pages) {
            page.removeIf(l -> (l.y < l.pageHeight * 0.06 || l.y > l.pageHeight * 0.915)
                    && !hasLowercase(l.text()));
        }

        // Headings are set in a larger font than the table text.
        double bodySize = dominantFontSize(pages);
        int ignored = 0;
        for (List<Line> page : pages) {
            int before = page.size();
            page.removeIf(l -> l.fontSize > bodySize * 1.15);
            ignored += before - page.size();
        }

        // An all-caps title at the very start, in case it uses the normal font size.
        for (List<Line> page : pages) {
            if (page.isEmpty()) {
                continue;
            }
            while (!page.isEmpty() && isAllCaps(page.get(0).text())) {
                page.remove(0);
                ignored++;
            }
            break;
        }

        if (ignored > 0) {
            warnings.add("Ignored " + ignored + " heading line(s) outside the table.");
        }
    }

    private double dominantFontSize(List<List<Line>> pages) {
        Map<Long, Integer> weight = new HashMap<>();
        for (List<Line> page : pages) {
            for (Line line : page) {
                weight.merge(Math.round(line.fontSize * 2), line.text().length(), Integer::sum);
            }
        }
        return weight.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey() / 2.0)
                .orElse(11.0);
    }

    private boolean hasLowercase(String text) {
        return text.chars().anyMatch(Character::isLowerCase);
    }

    private boolean isAllCaps(String text) {
        return text.chars().anyMatch(Character::isLetter) && !hasLowercase(text);
    }

    // ---------- Columns ----------

    /**
     * 1-D two-means on where lines start: one cluster is the left column, the other
     * the right.
     */
    private double findColumnBoundary(List<Line> lines) {
        double[] xs = lines.stream().mapToDouble(l -> l.startX).sorted().toArray();
        double c1 = xs[0];
        double c2 = xs[xs.length - 1];

        for (int i = 0; i < 25; i++) {
            double mid = (c1 + c2) / 2;
            double sum1 = 0;
            double sum2 = 0;
            int n1 = 0;
            int n2 = 0;
            for (double x : xs) {
                if (x < mid) {
                    sum1 += x;
                    n1++;
                } else {
                    sum2 += x;
                    n2++;
                }
            }
            if (n1 == 0 || n2 == 0) {
                break;
            }
            double next1 = sum1 / n1;
            double next2 = sum2 / n2;
            boolean stable = Math.abs(next1 - c1) < 0.01 && Math.abs(next2 - c2) < 0.01;
            c1 = next1;
            c2 = next2;
            if (stable) {
                break;
            }
        }

        if (c2 - c1 < 40) {
            throw new ImportException("Two columns (terms on the left, definitions on the right) "
                    + "could not be found in this PDF.");
        }
        return (c1 + c2) / 2;
    }

    // ---------- Blocks and rows ----------

    private void readPage(List<Line> page, double boundary, List<ParsedCard> cards, List<String> warnings) {
        // Consecutive lines on the same side form a run (one cell). A left run followed
        // by a
        // right run is one block.
        List<Line> pendingLeft = null;
        List<Line> run = new ArrayList<>();
        Boolean runIsLeft = null;

        List<List<Line>> runs = new ArrayList<>();
        List<Boolean> sides = new ArrayList<>();
        for (Line line : page) {
            boolean left = line.startX < boundary;
            if (runIsLeft == null || runIsLeft != left) {
                if (!run.isEmpty()) {
                    runs.add(run);
                    sides.add(runIsLeft);
                }
                run = new ArrayList<>();
                runIsLeft = left;
            }
            run.add(line);
        }
        if (!run.isEmpty()) {
            runs.add(run);
            sides.add(runIsLeft);
        }

        for (int i = 0; i < runs.size(); i++) {
            if (sides.get(i)) {
                if (pendingLeft != null) {
                    readBlock(pendingLeft, List.of(), cards, warnings);
                }
                pendingLeft = runs.get(i);
            } else {
                readBlock(pendingLeft != null ? pendingLeft : List.of(), runs.get(i), cards, warnings);
                pendingLeft = null;
            }
        }
        if (pendingLeft != null) {
            readBlock(pendingLeft, List.of(), cards, warnings);
        }
    }

    private void readBlock(List<Line> left, List<Line> right, List<ParsedCard> cards, List<String> warnings) {
        if (left.isEmpty() && right.isEmpty()) {
            return;
        }

        double leftEnd = left.stream().mapToDouble(l -> l.y).max().orElse(-1);
        double rightEnd = right.stream().mapToDouble(l -> l.y).max().orElse(-1);

        List<Double> ys = new ArrayList<>();
        left.forEach(l -> ys.add(l.y));
        right.forEach(l -> ys.add(l.y));
        Collections.sort(ys);
        List<Double> rows = new ArrayList<>();
        for (double y : ys) {
            if (rows.isEmpty() || y - rows.get(rows.size() - 1) > ROW_TOLERANCE) {
                rows.add(y);
            }
        }

        List<String[]> drafts = new ArrayList<>();
        boolean suspicious = false;

        for (double row : rows) {
            Line l = lineAt(left, row);
            Line r = lineAt(right, row);

            if (l != null && r != null) {
                drafts.add(new String[] { l.text(), r.text() });
            } else if (r != null) {
                // Only a definition on this row. In the middle of the block it is the wrapped
                // second line of the previous definition (the left side holds a blank line
                // there).
                if (row <= leftEnd && !drafts.isEmpty()) {
                    join(drafts.get(drafts.size() - 1), 1, r.text());
                } else {
                    drafts.add(new String[] { "", r.text() });
                    suspicious = true;
                }
            } else if (l != null) {
                if (row <= rightEnd && !drafts.isEmpty()) {
                    join(drafts.get(drafts.size() - 1), 0, l.text());
                } else {
                    drafts.add(new String[] { l.text(), "" });
                    suspicious = true;
                }
            }
        }

        if (suspicious) {
            Line first = !left.isEmpty() ? left.get(0) : right.get(0);
            warnings.add("Page %d: the terms and definitions in the block starting with \"%s\" do not line up. "
                    .formatted(first.page, first.text()) + "Check these cards.");
        }

        for (String[] draft : drafts) {
            String term = ImportSupport.clean(draft[0]);
            String definition = ImportSupport.clean(draft[1]);
            if (!term.isEmpty() || !definition.isEmpty()) {
                cards.add(new ParsedCard(term, definition, suspicious));
            }
        }
    }

    private Line lineAt(List<Line> lines, double row) {
        for (Line line : lines) {
            if (Math.abs(line.y - row) <= ROW_TOLERANCE) {
                return line;
            }
        }
        return null;
    }

    private void join(String[] draft, int index, String continuation) {
        draft[index] = draft[index].endsWith("-") ? draft[index] + continuation : draft[index] + " " + continuation;
    }
}