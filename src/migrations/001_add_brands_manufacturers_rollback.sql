BEGIN;

-- Drop the view first
DROP VIEW IF EXISTS active_brands_view;

-- Remove foreign key constraints
ALTER TABLE bicycles
DROP CONSTRAINT IF EXISTS fk_bicycle_brand;

ALTER TABLE components
DROP CONSTRAINT IF EXISTS components_brand_id_fkey;

-- Drop indexes
DROP INDEX IF EXISTS idx_brands_manufacturer;
DROP INDEX IF EXISTS idx_brand_history_brand;
DROP INDEX IF EXISTS idx_bicycles_brand;
DROP INDEX IF EXISTS idx_components_brand;

-- Remove brand_id columns
ALTER TABLE bicycles
DROP COLUMN IF EXISTS brand_id,
DROP COLUMN IF EXISTS model_year;

ALTER TABLE components
DROP COLUMN IF EXISTS brand_id;

-- Drop new tables in reverse order of creation
DROP TABLE IF EXISTS brand_history;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS manufacturers;

COMMIT;
