package com.fnafke.lizlet.controllers;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fnafke.lizlet.dto.CardProgressResponse;
import com.fnafke.lizlet.dto.ProgressOverviewResponse;
import com.fnafke.lizlet.dto.ReviewRequest;
import com.fnafke.lizlet.dto.SetProgressResponse;
import com.fnafke.lizlet.dto.UserStatsResponse;
import com.fnafke.lizlet.models.User;
import com.fnafke.lizlet.services.ProgressService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping("/study-sets/{setId}/cards/{cardId}/review")
    public CardProgressResponse review(@AuthenticationPrincipal User user, @PathVariable UUID setId,
            @PathVariable UUID cardId, @Valid @RequestBody ReviewRequest request) {
        return progressService.review(user, setId, cardId, request.correct());
    }

    @GetMapping("/study-sets/{setId}/progress")
    public SetProgressResponse getSetProgress(@AuthenticationPrincipal User user, @PathVariable UUID setId) {
        return progressService.getSetProgress(user, setId);
    }

    @GetMapping("/progress/overview")
    public ProgressOverviewResponse getOverview(@AuthenticationPrincipal User user) {
        return progressService.getOverview(user);
    }

    @GetMapping("/progress/stats")
    public UserStatsResponse getStats(@AuthenticationPrincipal User user) {
        return progressService.getStats(user);
    }
}