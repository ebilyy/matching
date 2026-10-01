-- supplier_positions: live positions of a supplier, upserted in place by position_key
-- after staging validation (ADR-0005). Never deleted: a position missing from the latest
-- price gets absent_since (AC-17).
CREATE TABLE IF NOT EXISTS supplier_positions (
    id                UUID          PRIMARY KEY,
    shop_id           UUID          NOT NULL REFERENCES shops (id),
    supplier_id       UUID          NOT NULL,
    position_key      VARCHAR(128)  NOT NULL,
    supplier_code     VARCHAR(100),
    name              VARCHAR(500)  NOT NULL,
    fingerprint       VARCHAR(64)   NOT NULL,
    barcode           VARCHAR(32),
    manufacturer_code VARCHAR(100),
    brand             VARCHAR(200),
    price             NUMERIC(14,4) NOT NULL,
    in_stock          BOOLEAN,
    stock_quantity    INTEGER,
    absent_since      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_supplier_positions_shop_id_id UNIQUE (shop_id, id),
    -- Upsert key (ADR-0005); also the FK index for fk_supplier_positions_supplier.
    CONSTRAINT uq_supplier_positions_shop_id_supplier_id_position_key
        UNIQUE (shop_id, supplier_id, position_key),
    CONSTRAINT fk_supplier_positions_supplier FOREIGN KEY (shop_id, supplier_id) REFERENCES suppliers (shop_id, id)
);
