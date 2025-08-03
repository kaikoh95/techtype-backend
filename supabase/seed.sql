-- Seed data for PC Components Hierarchy
-- Creates the AlphaPC structure as specified in the requirements

-- Clear existing data (if any)
DELETE FROM techtype.properties;
DELETE FROM techtype.nodes;

-- Insert root node: AlphaPC
INSERT INTO techtype.nodes (id, name, parent_id) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'AlphaPC', NULL);

-- Insert AlphaPC root properties
INSERT INTO techtype.properties (node_id, key, value) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Height', 450.00),
    ('00000000-0000-0000-0000-000000000001', 'Width', 180.00);

-- Insert Processing node
INSERT INTO techtype.nodes (id, name, parent_id) VALUES 
    ('00000000-0000-0000-0000-000000000002', 'Processing', '00000000-0000-0000-0000-000000000001');

-- Insert Processing RAM property
INSERT INTO techtype.properties (node_id, key, value) VALUES 
    ('00000000-0000-0000-0000-000000000002', 'RAM', 32000.00);

-- Insert CPU node under Processing
INSERT INTO techtype.nodes (id, name, parent_id) VALUES 
    ('00000000-0000-0000-0000-000000000003', 'CPU', '00000000-0000-0000-0000-000000000002');

-- Insert CPU properties
INSERT INTO techtype.properties (node_id, key, value) VALUES 
    ('00000000-0000-0000-0000-000000000003', 'Cores', 4.00),
    ('00000000-0000-0000-0000-000000000003', 'Power', 2.41);

-- Insert Graphics node under Processing
INSERT INTO techtype.nodes (id, name, parent_id) VALUES 
    ('00000000-0000-0000-0000-000000000004', 'Graphics', '00000000-0000-0000-0000-000000000002');

-- Insert Graphics properties
INSERT INTO techtype.properties (node_id, key, value) VALUES 
    ('00000000-0000-0000-0000-000000000004', 'RAM', 4000.00),
    ('00000000-0000-0000-0000-000000000004', 'Ports', 8.00);

-- Insert Storage node
INSERT INTO techtype.nodes (id, name, parent_id) VALUES 
    ('00000000-0000-0000-0000-000000000005', 'Storage', '00000000-0000-0000-0000-000000000001');

-- Insert SSD node under Storage
INSERT INTO techtype.nodes (id, name, parent_id) VALUES 
    ('00000000-0000-0000-0000-000000000006', 'SSD', '00000000-0000-0000-0000-000000000005');

-- Insert SSD properties
INSERT INTO techtype.properties (node_id, key, value) VALUES 
    ('00000000-0000-0000-0000-000000000006', 'Capacity', 1024.00),
    ('00000000-0000-0000-0000-000000000006', 'WriteSpeed', 250.00);

-- Insert HDD node under Storage
INSERT INTO techtype.nodes (id, name, parent_id) VALUES 
    ('00000000-0000-0000-0000-000000000007', 'HDD', '00000000-0000-0000-0000-000000000005');

-- Insert HDD properties
INSERT INTO techtype.properties (node_id, key, value) VALUES 
    ('00000000-0000-0000-0000-000000000007', 'Capacity', 5120.00),
    ('00000000-0000-0000-0000-000000000007', 'WriteSpeed', 1.724752);