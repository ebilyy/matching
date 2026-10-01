-- suppliers: contact details shown on the supplier card. All nullable: existing rows have none,
-- and none of them is required to import a price.
ALTER TABLE suppliers
    ADD COLUMN IF NOT EXISTS email       VARCHAR(254),
    ADD COLUMN IF NOT EXISTS website     TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS phone       VARCHAR(32);
