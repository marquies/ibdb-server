-- Create Manufacturers Table
CREATE TABLE manufacturers (
    manufacturer_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    country VARCHAR(100),
    founded_year INTEGER,
    active BOOLEAN DEFAULT true
);

-- Create Brands Table
CREATE TABLE brands (
    brand_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer_id INT REFERENCES manufacturers(manufacturer_id),
    start_date DATE,
    end_date DATE,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    description TEXT,
    active BOOLEAN DEFAULT true
);

-- Create Brand History Table (for tracking ownership changes)
CREATE TABLE brand_history (
    history_id SERIAL PRIMARY KEY,
    brand_id INT REFERENCES brands(brand_id),
    old_manufacturer_id INT REFERENCES manufacturers(manufacturer_id),
    new_manufacturer_id INT REFERENCES manufacturers(manufacturer_id),
    change_date DATE NOT NULL,
    notes TEXT
);

-- Create Bicycles Table
CREATE TABLE bicycles (
    bike_id SERIAL PRIMARY KEY,
    brand_id INT REFERENCES brands(brand_id),
    name VARCHAR(255) NOT NULL,
    model_year INTEGER,
    type VARCHAR(50) CHECK (type IN ('e-bike', 'MTB', 'road', 'gravel', 'hybrid'))
);

-- Create Components Table
CREATE TABLE components (
    component_id SERIAL PRIMARY KEY,
    bike_id INT REFERENCES bicycles(bike_id) ON DELETE CASCADE,
    brand_id INT REFERENCES brands(brand_id),
    category VARCHAR(50) CHECK (category IN ('frame', 'wheels', 'drivetrain', 'brakes', 'fork', 'rear_shock', 
                                             'cockpit_components', 'saddle', 'seatpost', 'pedals', 'e_bike_features')),
    name VARCHAR(255) NOT NULL,
    weight FLOAT,
    material VARCHAR(255)
);

-- Create Frame Table
CREATE TABLE frame (
    frame_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    size VARCHAR(50),
    geometry_type VARCHAR(100),
    bottom_bracket_type VARCHAR(100),
    head_tube_angle FLOAT,
    seat_tube_angle FLOAT,
    reach FLOAT,
    stack FLOAT,
    chainstay_length FLOAT
);

-- Create Wheels Table
CREATE TABLE wheels (
    wheel_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    rims VARCHAR(255),
    spokes VARCHAR(255),
    hubs VARCHAR(255),
    tires VARCHAR(255)
);

-- Create Drivetrain Table
CREATE TABLE drivetrain (
    drivetrain_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    shifters VARCHAR(255),
    derailleurs VARCHAR(255),
    cassette VARCHAR(255),
    chain VARCHAR(255)
);

-- Create Cockpit Components Table
CREATE TABLE cockpit_components (
    cockpit_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    handlebars VARCHAR(255),
    stems VARCHAR(255),
    headsets VARCHAR(255)
);

-- Create E-Bike Features Table
CREATE TABLE e_bike_features (
    e_bike_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    motor VARCHAR(255),
    battery VARCHAR(255),
    display VARCHAR(255)
);

-- Create Forks Table
CREATE TABLE forks (
    fork_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    details VARCHAR(255)
);

-- Create Brakes Table
CREATE TABLE brakes (
    brake_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    details VARCHAR(255)
);

-- Create Rear Shocks Table
CREATE TABLE rear_shocks (
    rear_shock_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    details VARCHAR(255)
);

-- Create Saddles Table
CREATE TABLE saddles (
    saddle_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    details VARCHAR(255)
);

-- Create Seatposts Table
CREATE TABLE seatposts (
    seatpost_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    details VARCHAR(255)
);

-- Create Pedals Table
CREATE TABLE pedals (
    pedal_id SERIAL PRIMARY KEY,
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    details VARCHAR(255)
);

-- Create Component Standards Table
CREATE TABLE component_standards (
    standard_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT
);

-- Create Frame Standards Table
CREATE TABLE frame_standards (
    frame_id INT REFERENCES frame(frame_id) ON DELETE CASCADE,
    standard_id INT REFERENCES component_standards(standard_id) ON DELETE CASCADE,
    PRIMARY KEY (frame_id, standard_id)
);

-- Create Component Compatibility Table
CREATE TABLE component_compatibility (
    component_id INT REFERENCES components(component_id) ON DELETE CASCADE,
    standard_id INT REFERENCES component_standards(standard_id) ON DELETE CASCADE,
    PRIMARY KEY (component_id, standard_id)
);