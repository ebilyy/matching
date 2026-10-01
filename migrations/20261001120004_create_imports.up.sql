-- imports: one row per catalog or price file going through file-intake (ADR-0002, ADR-0003).
-- The pg-boss job is enqueued in the same transaction as the row; staging tables are
-- TEMP tables of the worker session and are not part of the schema (ADR-0005).
CREATE TABLE IF NOT EXISTS imports (
    id                 UUID          PRIMARY KEY,
    shop_id            UUID          NOT NULL REFERENCES shops (id),
    kind               VARCHAR(16)   NOT NULL,
    source             VARCHAR(16)   NOT NULL,
    status             VARCHAR(32)   NOT NULL,
    supplier_id        UUID,
    manager_id         UUID,
    idempotency_key    VARCHAR(200),
    storage_key        VARCHAR(1024),
    original_filename  VARCHAR(255),
    column_mapping     JSONB,
    issues             JSONB,
    rows_recognized    INTEGER,
    auto_matched_count INTEGER,
    proposals_count    INTEGER,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    started_at         TIMESTAMPTZ,
    finished_at        TIMESTAMPTZ,
    CONSTRAINT uq_imports_shop_id_id              UNIQUE (shop_id, id),
    CONSTRAINT uq_imports_shop_id_idempotency_key UNIQUE (shop_id, idempotency_key),
    CONSTRAINT fk_imports_supplier FOREIGN KEY (shop_id, supplier_id) REFERENCES suppliers (shop_id, id),
    CONSTRAINT fk_imports_manager  FOREIGN KEY (shop_id, manager_id)  REFERENCES managers (shop_id, id)
);

-- Import list per shop + 30-uploads-per-hour rate limit (PRD §6.1, SAD §8).
CREATE INDEX IF NOT EXISTS idx_imports_shop_id_created_at
    ON imports (shop_id, created_at DESC);
-- Import history of one supplier; FK index for fk_imports_supplier.
CREATE INDEX IF NOT EXISTS idx_imports_shop_id_supplier_id
    ON imports (shop_id, supplier_id, created_at DESC) WHERE supplier_id IS NOT NULL;
-- FK index for fk_imports_manager.
CREATE INDEX IF NOT EXISTS idx_imports_shop_id_manager_id
    ON imports (shop_id, manager_id) WHERE manager_id IS NOT NULL;
