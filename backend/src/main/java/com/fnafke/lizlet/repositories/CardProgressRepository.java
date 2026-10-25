package com.fnafke.lizlet.repositories;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fnafke.lizlet.models.CardProgress;

public interface CardProgressRepository extends JpaRepository<CardProgress, UUID> {

    Optional<CardProgress> findByUserIdAndCardId(UUID userId, UUID cardId);

    List<CardProgress> findAllByUserIdAndCardIdIn(UUID userId, Collection<UUID> cardIds);

    List<CardProgress> findAllByUserId(UUID userId);
}