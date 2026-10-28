package com.fnafke.lizlet.services;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fnafke.lizlet.dto.CardProgressResponse;
import com.fnafke.lizlet.dto.DailyReviewCount;
import com.fnafke.lizlet.dto.ProgressOverviewResponse;
import com.fnafke.lizlet.dto.SetProgressResponse;
import com.fnafke.lizlet.dto.SetProgressSummary;
import com.fnafke.lizlet.dto.UserStatsResponse;
import com.fnafke.lizlet.models.exceptions.ResourceNotFoundException;
import com.fnafke.lizlet.models.Card;
import com.fnafke.lizlet.models.CardProgress;
import com.fnafke.lizlet.models.StudySet;
import com.fnafke.lizlet.models.User;
import com.fnafke.lizlet.repositories.CardProgressRepository;
import com.fnafke.lizlet.repositories.StudySetRepository;

@Service
@Transactional(readOnly = true)
public class ProgressService {

    private final StudySetRepository studySetRepository;
    private final CardProgressRepository cardProgressRepository;

    public ProgressService(StudySetRepository studySetRepository, CardProgressRepository cardProgressRepository) {
        this.studySetRepository = studySetRepository;
        this.cardProgressRepository = cardProgressRepository;
    }

    @Transactional
    public CardProgressResponse review(User user, UUID setId, UUID cardId, boolean correct) {
        StudySet set = getOwnedSet(setId, user);
        boolean cardInSet = set.getCards().stream().anyMatch(c -> c.getId().equals(cardId));
        if (!cardInSet) {
            throw new ResourceNotFoundException("Card not found");
        }

        LocalDate today = LocalDate.now();
        CardProgress progress = cardProgressRepository.findByUserIdAndCardId(user.getId(), cardId)
                .orElseGet(() -> new CardProgress(user.getId(), cardId));
        progress.recordReview(correct, today);

        return CardProgressResponse.from(cardProgressRepository.save(progress), today);
    }

    public SetProgressResponse getSetProgress(User user, UUID setId) {
        StudySet set = getOwnedSet(setId, user);
        LocalDate today = LocalDate.now();

        Map<UUID, CardProgress> byCard = progressByCard(user.getId(), set.getCards());
        SetProgressSummary summary = summarize(set, byCard, today);
        List<CardProgressResponse> cards = byCard.values().stream()
                .map(p -> CardProgressResponse.from(p, today))
                .toList();

        return new SetProgressResponse(summary.setId(), summary.total(), summary.newCount(),
                summary.learningCount(), summary.masteredCount(), summary.dueCount(), cards);
    }

    public ProgressOverviewResponse getOverview(User user) {
        LocalDate today = LocalDate.now();

        Map<UUID, CardProgress> byCard = cardProgressRepository.findAllByUserId(user.getId()).stream()
                .collect(Collectors.toMap(CardProgress::getCardId, Function.identity()));

        List<SetProgressSummary> summaries = studySetRepository
                .findAllByOwner_IdOrderByUpdatedAtDesc(user.getId()).stream()
                .map(set -> summarize(set, byCard, today))
                .toList();

        int totalDue = summaries.stream().mapToInt(SetProgressSummary::dueCount).sum();
        return new ProgressOverviewResponse(totalDue, summaries);
    }

    /** Statistics across all of the user's sets, for the account page. */
    public UserStatsResponse getStats(User user) {
        LocalDate today = LocalDate.now();

        List<StudySet> sets = studySetRepository.findAllByOwner_IdOrderByUpdatedAtDesc(user.getId());
        int totalCards = sets.stream().mapToInt(set -> set.getCards().size()).sum();
        List<CardProgress> progress = cardProgressRepository.findAllByUserId(user.getId());

        int[] perBox = new int[CardProgress.MAX_BOX + 1]; // index = box (1 to 5)
        int[] upcoming = new int[7]; // index 0 = today (including overdue), 1..6 = the next days
        int mastered = 0;
        int correct = 0;
        int incorrect = 0;
        LocalDate lastStudied = null;

        for (CardProgress p : progress) {
            perBox[p.getBox()]++;
            if (p.isMastered()) {
                mastered++;
            }
            correct += p.getCorrectCount();
            incorrect += p.getIncorrectCount();

            if (p.getLastReviewedAt() != null
                    && (lastStudied == null || p.getLastReviewedAt().isAfter(lastStudied))) {
                lastStudied = p.getLastReviewedAt();
            }

            if (p.isDue(today)) {
                upcoming[0]++;
            } else {
                long days = ChronoUnit.DAYS.between(today, p.getNextReviewAt());
                if (days >= 1 && days <= 6) {
                    upcoming[(int) days]++;
                }
            }
        }

        int newCards = Math.max(0, totalCards - progress.size());
        upcoming[0] += newCards; // new cards are due too

        List<Integer> cardsPerBox = new ArrayList<>();
        cardsPerBox.add(newCards);
        for (int box = 1; box <= CardProgress.MAX_BOX; box++) {
            cardsPerBox.add(perBox[box]);
        }

        List<DailyReviewCount> forecast = IntStream.range(0, 7)
                .mapToObj(i -> new DailyReviewCount(today.plusDays(i), upcoming[i]))
                .toList();

        return new UserStatsResponse(sets.size(), totalCards, newCards, progress.size() - mastered, mastered,
                upcoming[0], correct + incorrect, correct, lastStudied, cardsPerBox, forecast);
    }

    // ---------- Helpers ----------

    private StudySet getOwnedSet(UUID setId, User owner) {
        return studySetRepository.findByIdAndOwner_Id(setId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Study set not found"));
    }

    private Map<UUID, CardProgress> progressByCard(UUID userId, List<Card> cards) {
        List<UUID> cardIds = cards.stream().map(Card::getId).toList();
        if (cardIds.isEmpty()) {
            return Map.of();
        }
        return cardProgressRepository.findAllByUserIdAndCardIdIn(userId, cardIds).stream()
                .collect(Collectors.toMap(CardProgress::getCardId, Function.identity()));
    }

    // A card without progress is "new" and counts as due.
    private SetProgressSummary summarize(StudySet set, Map<UUID, CardProgress> byCard, LocalDate today) {
        int fresh = 0;
        int learning = 0;
        int mastered = 0;
        int due = 0;

        for (Card card : set.getCards()) {
            CardProgress progress = byCard.get(card.getId());
            if (progress == null) {
                fresh++;
                due++;
                continue;
            }
            if (progress.isMastered()) {
                mastered++;
            } else {
                learning++;
            }
            if (progress.isDue(today)) {
                due++;
            }
        }

        return new SetProgressSummary(set.getId(), set.getTitle(), set.getCards().size(),
                fresh, learning, mastered, due);
    }
}