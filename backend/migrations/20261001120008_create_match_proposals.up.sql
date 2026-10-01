-- match_proposals: inline projection of match_events — the review queue (ADR-0004; SAD name
-- proposal_queue_view). brand / category are copied from own_products so the queue page and
-- bulk filter stay single-table reads (QG-3).
CREATE TABLE IF NOT EXISTS match_proposals (
    shop_id              UUID         NOT NULL REFERENCES shops (id),
    own_product_id       UUID         NOT NULL,
    supplier_position_id UUID         NOT NULL,
    reason               VARCHAR(32)  NOT NULL,
    confidence           NUMERIC(4,3) NOT NULL,
    explanation          JSONB        NOT NULL,
    brand                VARCHAR(200),
    category             VARCHAR(500),
    stream_version       INTEGER      NOT NULL,
    proposed_at          TIMESTAMPTZ  NOT NULL,
    CONSTRAINT pk_match_proposals PRIMARY KEY (shop_id, own_product_id, supplier_position_id),
    CONSTRAINT fk_match_proposals_own_product       FOREIGN KEY (shop_id, own_product_id)       REFERENCES own_products (shop_id, id),
    CONSTRAINT fk_match_proposals_supplier_position FOREIGN KEY (shop_id, supplier_position_id) REFERENCES supplier_positions (shop_id, id)
);

-- Queue page: 50 proposals by confidence DESC with keyset pagination (AC-08, QG-3).
CREATE INDEX IF NOT EXISTS idx_match_proposals_shop_id_confidence
    ON match_proposals (shop_id, confidence DESC, own_product_id, supplier_position_id);
-- Queue filtered by brand + bulk-confirm preview with low-confidence count (AC-09, flow 4).
CREATE INDEX IF NOT EXISTS idx_match_proposals_shop_id_brand_confidence
    ON match_proposals (shop_id, brand, confidence DESC);
-- Queue filtered by category (US-04).
CREATE INDEX IF NOT EXISTS idx_match_proposals_shop_id_category_confidence
    ON match_proposals (shop_id, category, confidence DESC);
-- Proposals of a re-imported position (cascade, AC-11); FK index for fk_match_proposals_supplier_position.
CREATE INDEX IF NOT EXISTS idx_match_proposals_shop_id_supplier_position_id
    ON match_proposals (shop_id, supplier_position_id);
