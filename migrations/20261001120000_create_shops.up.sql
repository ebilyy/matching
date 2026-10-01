-- shops: tenant root (ADR-0008). Created by an operator; no self-signup in this iteration.
CREATE TABLE IF NOT EXISTS shops (
    id         UUID         PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
