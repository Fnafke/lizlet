CREATE TABLE card_progress (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    box INT NOT NULL DEFAULT 1,
    streak INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    incorrect_count INT NOT NULL DEFAULT 0,
    last_reviewed_at DATE,
    next_review_at DATE,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL,
    CONSTRAINT uq_card_progress_user_card UNIQUE (user_id, card_id),
    CONSTRAINT chk_card_progress_box CHECK (box BETWEEN 1 AND 5)
);

CREATE INDEX idx_card_progress_user_next_review ON card_progress(user_id, next_review_at);