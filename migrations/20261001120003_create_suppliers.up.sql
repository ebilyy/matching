-- suppliers: per-shop supplier with remembered column mapping (AC-02, AC-04) and feed URL (SAD §3).
-- The same real-world supplier used by two shops is two rows, so decisions never cross shops (AC-12).
CREATE TABLE IF NOT EXISTS suppliers (
    id             UUID         PRIMARY KEY,
    shop_id        UUID         NOT NULL REFERENCES shops (id),
    name           VARCHAR(200) NOT NULL,
    feed_url       TEXT,
    column_mapping JSONB,
    price_date     TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_suppliers_shop_id_id UNIQUE (shop_id, id)
);
