-- Clear existing data
DELETE FROM e_bike_features;
DELETE FROM pedals;
DELETE FROM seatpost;
DELETE FROM saddle;
DELETE FROM cockpit_components;
DELETE FROM rear_shock;
DELETE FROM fork;
DELETE FROM frame;
DELETE FROM brakes;
DELETE FROM drivetrain;
DELETE FROM wheels;
DELETE FROM components;
DELETE FROM bicycles;

-- Insert sample bicycles
INSERT INTO bicycles (bike_id, name, type) VALUES
(101, 'Mountain Explorer Pro', 'MTB'),
(102, 'City Cruiser E-Bike', 'e-bike'),
(103, 'Gravel Adventure X', 'gravel'),
(104, 'Road Master Elite', 'road'),
(105, 'Urban Commuter Plus', 'hybrid');

-- Insert components for Mountain Explorer Pro
INSERT INTO components (component_id, bike_id, category, name, weight, material) VALUES
(200, 101, 'frame', 'Explorer Carbon Frame', 2200, 'Carbon Fiber'),
(201, 101, 'fork', 'RockShox Pike Ultimate', 1890, 'Aluminum/Carbon'),
(202, 101, 'wheel', 'DT Swiss XM 1501', 1700, 'Aluminum'),
(203, 101, 'drivetrain', 'SRAM XX1 Eagle', 1500, 'Various'),
(204, 101, 'brakes', 'Shimano XT M8120', 800, 'Aluminum'),
(205, 101, 'rear_shock', 'Fox Float DPX2', 350, 'Aluminum'),
(206, 101, 'cockpit_components', 'Race Face Next R', 780, 'Carbon'),
(207, 101, 'saddle', 'Ergon SM Pro', 235, 'Various'),
(208, 101, 'seatpost', 'Fox Transfer Factory', 650, 'Aluminum'),
(209, 101, 'pedals', 'Shimano XT M8100', 340, 'Aluminum');

-- Insert components for City Cruiser E-Bike
INSERT INTO components (component_id, bike_id, category, name, weight, material) VALUES
(220, 102, 'frame', 'City Cruiser Alloy Frame', 2800, 'Aluminum'),
(210, 102, 'wheel', 'Shimano MT500', 2200, 'Aluminum'),
(211, 102, 'drivetrain', 'Shimano Steps E6100', 2800, 'Various'),
(212, 102, 'brakes', 'Shimano MT420', 900, 'Aluminum'),
(213, 102, 'fork', 'SR Suntour NCX', 1650, 'Aluminum'),
(214, 102, 'cockpit_components', 'Ergotec Touring', 820, 'Aluminum'),
(215, 102, 'saddle', 'Selle Royal Lookin', 350, 'Various'),
(216, 102, 'seatpost', 'Ergotec Alu', 350, 'Aluminum'),
(217, 102, 'pedals', 'Wellgo C098', 290, 'Aluminum'),
(218, 102, 'e_bike_features', 'Bosch Performance CX', 2900, 'Various');

-- Insert Frame Details
INSERT INTO frame (frame_id, component_id, size, geometry_type, bottom_bracket_type, head_tube_angle, seat_tube_angle, reach, stack, chainstay_length) VALUES
(101, 200, 'L', 'Trail', 'BSA Threaded', 65.5, 76.0, 475, 630, 435),
(102, 220, 'M', 'Comfort', 'Press Fit BB86', 69.5, 73.0, 390, 590, 455);

-- Insert detailed component information
-- Wheels
INSERT INTO wheels (wheel_id, component_id, rims, spokes, hubs, tires) VALUES
(301, 202, 'DT Swiss XM 481', 'DT Swiss Competition', 'DT Swiss 350', 'Maxxis Minion DHF 29x2.5'),
(302, 210, 'Shimano MT500', 'Stainless Steel', 'Shimano MT500', 'Schwalbe Marathon Plus 700x38c');

-- Drivetrain
INSERT INTO drivetrain (drivetrain_id, component_id, shifters, derailleurs, cassette, chain) VALUES
(401, 203, 'SRAM XX1 Eagle', 'SRAM XX1 Eagle', 'SRAM XX1 Eagle 10-52T', 'SRAM XX1 Eagle'),
(402, 211, 'Shimano Steps Di2', 'Shimano Deore', 'Shimano 11-42T', 'Shimano HG601');

-- Brakes
INSERT INTO brakes (brake_id, component_id, details) VALUES
(501, 204, '4-piston hydraulic, 203mm front/180mm rear rotors'),
(502, 212, '4-piston hydraulic, 180mm front/160mm rear rotors');

-- Fork
INSERT INTO fork (fork_id, component_id, details) VALUES
(601, 201, '150mm travel, 42mm offset, Charger 2.1 RC2 damper'),
(602, 213, '63mm travel, lockout, preload adjustment');

-- Rear Shock
INSERT INTO rear_shock (rear_shock_id, component_id, details) VALUES
(701, 205, '230x60mm, 3-position compression adjust');

-- Cockpit Components
INSERT INTO cockpit_components (cockpit_id, component_id, handlebars, stems, headsets) VALUES
(801, 206, 'Race Face Next R 35x800mm', 'Race Face Turbine R 35x50mm', 'Cane Creek 40'),
(802, 214, 'Ergotec Touring 31.8x640mm', 'Ergotec Up2 90mm', 'FSA No.10');

-- Saddle
INSERT INTO saddle (saddle_id, component_id, details) VALUES
(901, 207, 'S/M size, titanium rails'),
(902, 215, 'Gel padding, steel rails');

-- Seatpost
INSERT INTO seatpost (seatpost_id, component_id, details) VALUES
(1001, 208, '170mm travel, Kashima coat'),
(1002, 216, '350mm length, 27.2mm diameter');

-- Pedals
INSERT INTO pedals (pedal_id, component_id, details) VALUES
(1101, 209, 'SPD compatible, adjustable tension'),
(1102, 217, 'Aluminum platform, sealed bearings');

-- E-Bike Features
INSERT INTO e_bike_features (e_bike_id, component_id, motor, battery, display) VALUES
(1201, 218, 'Bosch Performance CX Gen4 85Nm', 'Bosch PowerTube 625Wh', 'Bosch Kiox');

-- Insert Component Standards
INSERT INTO component_standards (name, category, description) VALUES
    ('Tapered', 'cockpit_components', 'Tapered head tube standard for modern mountain bikes'),
    ('Straight 1-1/8"', 'cockpit_components', 'Traditional straight steerer tube standard'),
    ('Metric 230x65', 'rear_shock', 'Metric rear shock sizing - 230mm length, 65mm stroke'),
    ('Trunnion 185x55', 'rear_shock', 'Trunnion mount rear shock - 185mm length, 55mm stroke'),
    ('BSA', 'frame', 'British Standard threading for bottom brackets'),
    ('PF30', 'frame', 'Press Fit 30 bottom bracket standard'),
    ('Boost 148', 'wheels', '148mm rear hub spacing standard'),
    ('Boost 110', 'wheels', '110mm front hub spacing standard');

-- Example: Link a frame with its standards
INSERT INTO frame_standards (frame_id, standard_id)
SELECT f.frame_id, s.standard_id
FROM frame f
CROSS JOIN component_standards s
WHERE s.name IN ('Tapered', 'BSA', 'Metric 230x65')
LIMIT 1;

-- Example: Link components with their compatible standards
INSERT INTO component_compatibility (component_id, standard_id)
SELECT c.component_id, s.standard_id
FROM components c
CROSS JOIN component_standards s
WHERE (c.category = 'rear_shock' AND s.name = 'Metric 230x65')
   OR (c.category = 'cockpit_components' AND s.name = 'Tapered')
LIMIT 2;
