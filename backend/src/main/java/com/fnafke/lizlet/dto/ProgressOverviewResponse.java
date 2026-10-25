package com.fnafke.lizlet.dto;

import java.util.List;

public record ProgressOverviewResponse(int totalDue, List<SetProgressSummary> sets) {
}