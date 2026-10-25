package com.fnafke.lizlet.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fnafke.lizlet.dto.BulkCardsRequest;
import com.fnafke.lizlet.dto.CardRequest;
import com.fnafke.lizlet.dto.CardResponse;
import com.fnafke.lizlet.dto.CreateStudySetRequest;
import com.fnafke.lizlet.dto.StudySetDetailResponse;
import com.fnafke.lizlet.dto.StudySetSummaryResponse;
import com.fnafke.lizlet.dto.UpdateStudySetRequest;
import com.fnafke.lizlet.models.User;
import com.fnafke.lizlet.services.StudySetService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/study-sets")
public class StudySetController {

    private final StudySetService studySetService;

    public StudySetController(StudySetService studySetService) {
        this.studySetService = studySetService;
    }

    // ---------- Study sets ----------

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudySetDetailResponse create(@AuthenticationPrincipal User user,
            @Valid @RequestBody CreateStudySetRequest request) {
        return studySetService.create(user, request);
    }

    @GetMapping
    public List<StudySetSummaryResponse> findAll(@AuthenticationPrincipal User user) {
        return studySetService.findAll(user);
    }

    @GetMapping("/{setId}")
    public StudySetDetailResponse findById(@AuthenticationPrincipal User user, @PathVariable UUID setId) {
        return studySetService.findById(user, setId);
    }

    @PutMapping("/{setId}")
    public StudySetDetailResponse update(@AuthenticationPrincipal User user, @PathVariable UUID setId,
            @Valid @RequestBody UpdateStudySetRequest request) {
        return studySetService.update(user, setId, request);
    }

    @DeleteMapping("/{setId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal User user, @PathVariable UUID setId) {
        studySetService.delete(user, setId);
    }

    // ---------- Cards ----------

    @PostMapping("/{setId}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse addCard(@AuthenticationPrincipal User user, @PathVariable UUID setId,
            @Valid @RequestBody CardRequest request) {
        return studySetService.addCard(user, setId, request);
    }

    @PostMapping("/{setId}/cards/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public List<CardResponse> addCards(@AuthenticationPrincipal User user, @PathVariable UUID setId,
            @Valid @RequestBody BulkCardsRequest request) {
        return studySetService.addCards(user, setId, request);
    }

    @PutMapping("/{setId}/cards/{cardId}")
    public CardResponse updateCard(@AuthenticationPrincipal User user, @PathVariable UUID setId,
            @PathVariable UUID cardId, @Valid @RequestBody CardRequest request) {
        return studySetService.updateCard(user, setId, cardId, request);
    }

    @DeleteMapping("/{setId}/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@AuthenticationPrincipal User user, @PathVariable UUID setId,
            @PathVariable UUID cardId) {
        studySetService.deleteCard(user, setId, cardId);
    }
}