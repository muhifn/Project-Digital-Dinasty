-- Reverse of initial schema

DROP TABLE IF EXISTS stock_logs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS store_settings;

DROP TYPE IF EXISTS stock_change_type;
DROP TYPE IF EXISTS product_status;

DROP EXTENSION IF EXISTS "uuid-ossp";
