package com.fnafke.lizlet.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fnafke.lizlet.dto.ImportPreviewResponse;
import com.fnafke.lizlet.models.exceptions.ImportException;
import com.fnafke.lizlet.services.importing.ImportService;

@RestController
@RequestMapping("/api/study-sets/import")
public class ImportController {

    private final ImportService importService;

    public ImportController(ImportService importService) {
        this.importService = importService;
    }

    // Parses only. Nothing is saved; the frontend fills the form with the result.
    @PostMapping(value = "/parse", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImportPreviewResponse parse(@RequestParam("file") MultipartFile file) {
        return importService.parse(file);
    }

    @ExceptionHandler(ImportException.class)
    public ResponseEntity<Map<String, String>> handleImportException(ImportException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
    }
}