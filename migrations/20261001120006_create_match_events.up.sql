-- match_events: append-only source of truth for matches and decisions (ADR-0004).
-- A stream is the pair (shop_id, own_product_id, supplier_position_id); the unique
-- stream version makes the second concurrent decision fail -> 409 (PRD §6).
-- Written only by the match-ledger module (ADR-0007).
CREATE TABLE IF NOT EXISTS match_events (
    id                   UUID        PRIMARY KEY,
    shop_id              UUID        NOT NULL REFERENCES shops (id),
    own_product_id       UUID        NOT NULL,
    supplier_position_id UUID        NOT NULL,
    stream_version       INTEGER     NOT NULL,
    type                 VARCHAR(64) NOT NULL,
    schema_version       SMALLINT    NOT NULL,
    manager_id           UUID,
    import_id            UUID,
    payload              JSONB       NOT NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Optimistic concurrency; also serves the history read by own product (AC-14)
    -- and the FK index for fk_match_events_own_product.
    CONSTRAINT uq_match_events_stream_version
        UNIQUE (shop_id, own_product_id, supplier_position_id, stream_version),
    CONSTRAINT fk_match_events_own_product       FOREIGN KEY (shop_id, own_product_id)       REFERENCES own_products (shop_id, id),
    CONSTRAINT fk_match_events_supplier_position FOREIGN KEY (shop_id, supplier_position_id) REFERENCES supplier_positions (shop_id, id),
    CONSTRAINT fk_match_events_manager           FOREIGN KEY (shop_id, manager_id)           REFERENCES managers (shop_id, id),
    CONSTRAINT fk_match_events_import            FOREIGN KEY (shop_id, import_id)            REFERENCES imports (shop_id, id)
);

-- FK index for fk_match_events_supplier_position.
CREATE INDEX IF NOT EXISTS idx_match_events_shop_id_supplier_position_id
    ON match_events (shop_id, supplier_position_id);
-- FK index for fk_match_events_manager; partial because system events (manager_id NULL) dominate.
CREATE INDEX IF NOT EXISTS idx_match_events_shop_id_manager_id
    ON match_events (shop_id, manager_id) WHERE manager_id IS NOT NULL;
-- Events of one import: accuracy audit sample of auto-matches (PRD §6); FK index for fk_match_events_import.
CREATE INDEX IF NOT EXISTS idx_match_events_shop_id_import_id
    ON match_events (shop_id, import_id) WHERE import_id IS NOT NULL;
