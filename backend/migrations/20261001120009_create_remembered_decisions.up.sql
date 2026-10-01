-- remembered_decisions: inline projection of match_events — manager decisions with the
-- position fingerprint they were made on (ADR-0004; SAD name remembered_decision_view).
-- Cascade (b) reapplies a decision only while the fingerprint is unchanged (AC-10, AC-11);
-- cascade (a) consults rejections so a cancelled pair is not recreated (AC-13).
CREATE TABLE IF NOT EXISTS remembered_decisions (
    shop_id              UUID        NOT NULL REFERENCES shops (id),
    own_product_id       UUID        NOT NULL,
    supplier_position_id UUID        NOT NULL,
    decision             VARCHAR(16) NOT NULL,
    fingerprint          VARCHAR(64) NOT NULL,
    stream_version       INTEGER     NOT NULL,
    decided_at           TIMESTAMPTZ NOT NULL,
    CONSTRAINT pk_remembered_decisions PRIMARY KEY (shop_id, own_product_id, supplier_position_id),
    CONSTRAINT fk_remembered_decisions_own_product       FOREIGN KEY (shop_id, own_product_id)       REFERENCES own_products (shop_id, id),
    CONSTRAINT fk_remembered_decisions_supplier_position FOREIGN KEY (shop_id, supplier_position_id) REFERENCES supplier_positions (shop_id, id)
);

-- Cascade (b): decisions for the positions of the imported price; FK index for fk_remembered_decisions_supplier_position.
CREATE INDEX IF NOT EXISTS idx_remembered_decisions_shop_id_supplier_position_id
    ON remembered_decisions (shop_id, supplier_position_id);
