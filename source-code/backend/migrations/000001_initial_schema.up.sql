-- ============================================================================
-- Planet Motor BMW — Initial Schema
-- Converted from Prisma schema.prisma (8 tables, 3 enums)
-- ============================================================================

-- Drop old Prisma-managed tables if they exist (order matters for FK deps).
-- This gives us a clean slate on databases that previously used Prisma.
DROP TABLE IF EXISTS stock_logs CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;
DROP TABLE IF EXISTS _prisma_migrations CASCADE;

DROP TYPE IF EXISTS stock_change_type;
DROP TYPE IF EXISTS product_status;
-- (Prisma may have created these as text columns, so drop types if present)

-- Enable uuid-ossp extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ENUMS ====================

CREATE TYPE product_status AS ENUM ('AVAILABLE', 'OUT_OF_STOCK');
CREATE TYPE stock_change_type AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

-- ==================== ADMINS ====================

CREATE TABLE admins (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== CATEGORIES ====================

CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== PRODUCTS ====================

CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                TEXT NOT NULL,
    slug                TEXT NOT NULL UNIQUE,
    description         TEXT,
    price               DECIMAL(12, 2) NOT NULL,
    stock               INTEGER NOT NULL DEFAULT 0,
    unit                TEXT NOT NULL DEFAULT 'kg',
    image_url           TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    status              product_status NOT NULL DEFAULT 'AVAILABLE',
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    stock_updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    category_id         UUID NOT NULL REFERENCES categories(id)
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_active ON products(is_active);

-- ==================== STOCK LOGS ====================

CREATE TABLE stock_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quantity_change INTEGER NOT NULL,
    stock_before    INTEGER NOT NULL,
    stock_after     INTEGER NOT NULL,
    type            stock_change_type NOT NULL,
    reference       TEXT,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    product_id      UUID NOT NULL REFERENCES products(id)
);

CREATE INDEX idx_stock_logs_product_id ON stock_logs(product_id);

-- ==================== STORE SETTINGS ====================

CREATE TABLE store_settings (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key        TEXT NOT NULL UNIQUE,
    value      TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
