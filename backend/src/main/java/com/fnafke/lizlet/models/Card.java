package com.fnafke.lizlet.models;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cards")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_set_id", nullable = false)
    private StudySet studySet;

    @Column(name = "term", nullable = false, length = 500)
    private String term;

    @Column(name = "definition", nullable = false, length = 1000)
    private String definition;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt = LocalDate.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDate updatedAt = LocalDate.now();

    protected Card() {
    }

    public Card(String term, String definition) {
        this.term = term;
        this.definition = definition;
    }

    public void update(String term, String definition) {
        this.term = term;
        this.definition = definition;
        this.updatedAt = LocalDate.now();
    }

    public UUID getId() {
        return id;
    }

    public StudySet getStudySet() {
        return studySet;
    }

    void setStudySet(StudySet studySet) {
        this.studySet = studySet;
    }

    public String getTerm() {
        return term;
    }

    public String getDefinition() {
        return definition;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }
}