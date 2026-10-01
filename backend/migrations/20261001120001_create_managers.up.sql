-- managers: actor identity for match history (AC-14). How a request resolves to a
-- manager is an open question (SAD §11); this table only names the actor.
CREATE TABLE IF NOT EXISTS managers (
    id           UUID         PRIMARY KEY,
    shop_id      UUID         NOT NULL REFERENCES shops (id),
    display_name VARCHAR(200) NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_managers_shop_id_id UNIQUE (shop_id, id)
);
