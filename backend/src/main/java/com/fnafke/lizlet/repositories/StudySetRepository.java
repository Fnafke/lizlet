package com.fnafke.lizlet.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fnafke.lizlet.models.StudySet;

public interface StudySetRepository extends JpaRepository<StudySet, UUID> {

    @EntityGraph(attributePaths = "cards")
    List<StudySet> findAllByOwner_IdOrderByUpdatedAtDesc(UUID ownerId);

    @EntityGraph(attributePaths = "cards")
    Optional<StudySet> findByIdAndOwner_Id(UUID id, UUID ownerId);
}