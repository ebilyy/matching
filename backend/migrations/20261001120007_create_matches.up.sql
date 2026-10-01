-- matches: inline projection of match_events — current matches (ADR-0004; SAD name match_view).
-- The only source of purchase price and availability (CONTEXT invariant, AC-16).
CREATE TABLE IF NOT EXISTS matches (
    shop_id              UUID        NOT NULL REFERENCES shops (id),
    own_product_id       UUID        NOT NULL,
    supplier_position_id UUID        NOT NULL,
    origin               VARCHAR(32) NOT NULL,
    stream_version       INTEGER     NOT NULL,
    matched_at           TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_matches PRIMARY KEY (shop_id, own_product_id, supplier_position_id),
    CONSTRAINT fk_matches_own_product       FOREIGN KEY (shop_id, own_product_id)       REFERENCES own_products (shop_id, id),
    CONSTRAINT fk_matches_supplier_position FOREIGN KEY (shop_id, supplier_position_id) REFERENCES supplier_positions (shop_id, id)
);

-- Matches of a position whose fingerprint changed (AC-11); FK index for fk_matches_supplier_position.
CREATE INDEX IF NOT EXISTS idx_matches_shop_id_supplier_position_id
    ON matches (shop_id, supplier_position_id);
