CREATE TABLE study_sets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL
);

CREATE INDEX idx_study_sets_user_id ON study_sets(user_id);

CREATE TABLE cards (
    id UUID PRIMARY KEY,
    study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
    term VARCHAR(500) NOT NULL,
    definition VARCHAR(1000) NOT NULL,
    sort_order INT NOT NULL,
    created_at DATE NOT NULL,
    updated_at DATE NOT NULL
);

CREATE INDEX idx_cards_study_set_id ON cards(study_set_id);