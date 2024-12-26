-- Start transaction to ensure all changes are atomic
BEGIN;

-- Create manufacturers table
CREATE TABLE manufacturers (
    manufacturer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    country VARCHAR(100),
    founded_year INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create brands table
CREATE TABLE brands (
    brand_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer_id INT REFERENCES manufacturers(manufacturer_id),
    start_date DATE,
    end_date DATE,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create brand history table
CREATE TABLE brand_history (
    history_id SERIAL PRIMARY KEY,
    brand_id INT REFERENCES brands(brand_id),
    old_manufacturer_id INT REFERENCES manufacturers(manufacturer_id),
    new_manufacturer_id INT REFERENCES manufacturers(manufacturer_id),
    change_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default manufacturer for existing bikes
INSERT INTO manufacturers (name, active)
VALUES ('Legacy Manufacturer', true);

-- Extract unique brand names from existing bicycles and components
WITH unique_brands AS (
    SELECT DISTINCT name as brand_name
    FROM bicycles
    WHERE name IS NOT NULL
)
INSERT INTO brands (name, manufacturer_id, active)
SELECT 
    brand_name,
    (SELECT manufacturer_id FROM manufacturers WHERE name = 'Legacy Manufacturer'),
    true
FROM unique_brands;

-- Add brand_id column to bicycles table
ALTER TABLE bicycles 
ADD COLUMN brand_id INT,
ADD COLUMN model_year INTEGER;

-- Update bicycles with corresponding brand_ids
UPDATE bicycles b
SET brand_id = (
    SELECT br.brand_id 
    FROM brands br 
    WHERE br.name = b.name
);

-- Add brand_id column to components table
ALTER TABLE components
ADD COLUMN brand_id INT REFERENCES brands(brand_id);

-- Make brand_id NOT NULL in bicycles after data migration
ALTER TABLE bicycles
ALTER COLUMN brand_id SET NOT NULL,
ADD CONSTRAINT fk_bicycle_brand
    FOREIGN KEY (brand_id)
    REFERENCES brands(brand_id);

-- Create indexes for performance
CREATE INDEX idx_brands_manufacturer ON brands(manufacturer_id);
CREATE INDEX idx_brand_history_brand ON brand_history(brand_id);
CREATE INDEX idx_bicycles_brand ON bicycles(brand_id);
CREATE INDEX idx_components_brand ON components(brand_id);

-- Add constraints to ensure valid date ranges
ALTER TABLE brands
ADD CONSTRAINT valid_dates 
    CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date);

-- Create view for active brands with their current manufacturers
CREATE OR REPLACE VIEW active_brands_view AS
SELECT 
    b.brand_id,
    b.name as brand_name,
    b.website as brand_website,
    b.logo_url,
    b.description,
    m.manufacturer_id,
    m.name as manufacturer_name,
    m.country as manufacturer_country,
    m.website as manufacturer_website
FROM brands b
LEFT JOIN manufacturers m ON b.manufacturer_id = m.manufacturer_id
WHERE b.active = true
  AND (b.end_date IS NULL OR b.end_date >= CURRENT_DATE);

COMMIT;
