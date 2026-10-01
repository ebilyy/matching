-- own_products: the shop's catalog (ADR-0002). Upserted by (shop_id, sku) on catalog import;
-- products missing from a re-upload get archived_at, their matches are kept (SAD §11 default).
CREATE TABLE IF NOT EXISTS own_products (
    id                UUID         PRIMARY KEY,
    shop_id           UUID         NOT NULL REFERENCES shops (id),
    sku               VARCHAR(100) NOT NULL,
    name              VARCHAR(500) NOT NULL,
    barcode           VARCHAR(32),
    manufacturer_code VARCHAR(100),
    brand             VARCHAR(200),
    category          VARCHAR(500),
    archived_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_own_products_shop_id_id  UNIQUE (shop_id, id),
    CONSTRAINT uq_own_products_shop_id_sku UNIQUE (shop_id, sku)
);

-- Cascade stage (a): exact normalized code -> own product(s) (AC-05, AC-07).
CREATE INDEX IF NOT EXISTS idx_own_products_shop_id_barcode
    ON own_products (shop_id, barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_own_products_shop_id_manufacturer_code
    ON own_products (shop_id, manufacturer_code) WHERE manufacturer_code IS NOT NULL;
