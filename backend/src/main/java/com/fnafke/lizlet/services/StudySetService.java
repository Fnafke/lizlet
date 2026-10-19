package com.fnafke.lizlet.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fnafke.lizlet.dto.CardRequest;
import com.fnafke.lizlet.dto.CardResponse;
import com.fnafke.lizlet.dto.CreateStudySetRequest;
import com.fnafke.lizlet.dto.StudySetDetailResponse;
import com.fnafke.lizlet.dto.StudySetSummaryResponse;
import com.fnafke.lizlet.dto.UpdateStudySetRequest;
import com.fnafke.lizlet.models.exceptions.ResourceNotFoundException;
import com.fnafke.lizlet.models.Card;
import com.fnafke.lizlet.models.StudySet;
import com.fnafke.lizlet.models.User;
import com.fnafke.lizlet.repositories.StudySetRepository;

@Service
@Transactional(readOnly = true)
public class StudySetService {

    private final StudySetRepository studySetRepository;

    public StudySetService(StudySetRepository studySetRepository) {
        this.studySetRepository = studySetRepository;
    }

    // ---------- Study sets ----------

    @Transactional
    public StudySetDetailResponse create(User owner, CreateStudySetRequest request) {
        StudySet set = new StudySet(owner, request.title().trim(), request.description());
        if (request.cards() != null) {
            request.cards().forEach(c -> set.addCard(new Card(c.term().trim(), c.definition().trim())));
        }
        return StudySetDetailResponse.from(studySetRepository.save(set));
    }

    public List<StudySetSummaryResponse> findAll(User owner) {
        return studySetRepository.findAllByOwner_IdOrderByUpdatedAtDesc(owner.getId()).stream()
                .map(StudySetSummaryResponse::from)
                .toList();
    }

    public StudySetDetailResponse findById(User owner, UUID setId) {
        return StudySetDetailResponse.from(getOwnedSet(setId, owner));
    }

    @Transactional
    public StudySetDetailResponse update(User owner, UUID setId, UpdateStudySetRequest request) {
        StudySet set = getOwnedSet(setId, owner);
        set.update(request.title().trim(), request.description());
        return StudySetDetailResponse.from(set);
    }

    @Transactional
    public void delete(User owner, UUID setId) {
        studySetRepository.delete(getOwnedSet(setId, owner));
    }

    // ---------- Cards ----------

    @Transactional
    public CardResponse addCard(User owner, UUID setId, CardRequest request) {
        StudySet set = getOwnedSet(setId, owner);
        set.addCard(new Card(request.term().trim(), request.definition().trim()));
        studySetRepository.saveAndFlush(set); // flush so the new card gets its id
        return CardResponse.from(set.getCards().get(set.getCards().size() - 1));
    }

    @Transactional
    public CardResponse updateCard(User owner, UUID setId, UUID cardId, CardRequest request) {
        Card card = getCard(getOwnedSet(setId, owner), cardId);
        card.update(request.term().trim(), request.definition().trim());
        return CardResponse.from(card);
    }

    @Transactional
    public void deleteCard(User owner, UUID setId, UUID cardId) {
        StudySet set = getOwnedSet(setId, owner);
        set.removeCard(getCard(set, cardId));
    }

    // ---------- Helpers ----------

    // Returns 404 (not 403) for other users' sets so you don't leak which ids
    // exist.
    private StudySet getOwnedSet(UUID setId, User owner) {
        return studySetRepository.findByIdAndOwner_Id(setId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Study set not found"));
    }

    private Card getCard(StudySet set, UUID cardId) {
        return set.getCards().stream()
                .filter(c -> c.getId().equals(cardId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
    }
}