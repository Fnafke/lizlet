package com.fnafke.lizlet.models;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

@Entity
@Table(name = "study_sets")
public class StudySet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    @OneToMany(mappedBy = "studySet", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<Card> cards = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt = LocalDate.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDate updatedAt = LocalDate.now();

    protected StudySet() {
    }

    public StudySet(User owner, String title, String description) {
        this.owner = owner;
        this.title = title;
        this.description = description;
    }

    public void addCard(Card card) {
        card.setStudySet(this);
        card.setSortOrder(cards.size());
        cards.add(card);
        this.updatedAt = LocalDate.now();
    }

    public void removeCard(Card card) {
        cards.remove(card); // orphanRemoval deletes the row
        for (int i = 0; i < cards.size(); i++) {
            cards.get(i).setSortOrder(i);
        }
        this.updatedAt = LocalDate.now();
    }

    public void update(String title, String description) {
        this.title = title;
        this.description = description;
        this.updatedAt = LocalDate.now();
    }

    public UUID getId() {
        return id;
    }

    public User getOwner() {
        return owner;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public List<Card> getCards() {
        return cards;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }
}