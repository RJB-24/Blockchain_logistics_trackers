
-- This SQL creates the routes table for storing optimized shipping routes
-- To execute, run this in your Supabase SQL Editor

-- Create the routes table
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  
  -- Route details as JSONB for flexibility
  points JSONB NOT NULL DEFAULT '[]'::jsonb,
  segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Summary metrics
  total_distance NUMERIC NOT NULL DEFAULT 0,
  total_duration NUMERIC NOT NULL DEFAULT 0,
  total_carbon_footprint NUMERIC NOT NULL DEFAULT 0,
  total_fuel_consumption NUMERIC NOT NULL DEFAULT 0,
  
  -- Metadata
  transport_types TEXT[] NOT NULL DEFAULT '{}',
  shipments_included UUID[] NOT NULL DEFAULT '{}',
  is_optimized BOOLEAN NOT NULL DEFAULT false,
  optimized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Weather and traffic considerations
  weather_conditions JSONB,
  traffic_conditions JSONB
);

-- Add RLS policies
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Create policy for select: managers and drivers can view all routes
CREATE POLICY "Managers and drivers can view all routes"
ON routes
FOR SELECT
USING (
  (
    SELECT role FROM user_roles WHERE user_id = auth.uid() AND role IN ('manager', 'driver')
  ) IS NOT NULL
);

-- Create policy for insert: only managers can create routes
CREATE POLICY "Only managers can create routes"
ON routes
FOR INSERT
WITH CHECK (
  (
    SELECT role FROM user_roles WHERE user_id = auth.uid() AND role = 'manager'
  ) IS NOT NULL
);

-- Create policy for update: managers can update all routes, drivers can only update routes they created
CREATE POLICY "Managers can update all routes, drivers can update their routes"
ON routes
FOR UPDATE
USING (
  (
    SELECT role FROM user_roles WHERE user_id = auth.uid() AND role = 'manager'
  ) IS NOT NULL
  OR
  (
    (SELECT role FROM user_roles WHERE user_id = auth.uid() AND role = 'driver') IS NOT NULL
    AND created_by = auth.uid()
  )
);

-- Create policy for delete: only managers can delete routes
CREATE POLICY "Only managers can delete routes"
ON routes
FOR DELETE
USING (
  (
    SELECT role FROM user_roles WHERE user_id = auth.uid() AND role = 'manager'
  ) IS NOT NULL
);

-- Add an index on transport_types for faster queries
CREATE INDEX routes_transport_types_idx ON routes USING GIN (transport_types);

-- Add an index on shipments_included for faster lookups
CREATE INDEX routes_shipments_included_idx ON routes USING GIN (shipments_included);

-- Add function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_routes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to call the function on update
CREATE TRIGGER routes_updated_at_trigger
BEFORE UPDATE ON routes
FOR EACH ROW
EXECUTE FUNCTION update_routes_updated_at();

-- Add some sample data
INSERT INTO routes (
  name, 
  points, 
  segments, 
  total_distance, 
  total_duration, 
  total_carbon_footprint, 
  total_fuel_consumption, 
  transport_types, 
  is_optimized
) VALUES (
  'New York to Los Angeles',
  '[
    {"id": "p1", "name": "New York Warehouse", "address": "123 Main St, New York, NY", "coordinates": {"lat": 40.7128, "lng": -74.0060}, "type": "origin"},
    {"id": "p2", "name": "Pittsburgh Stopover", "address": "456 Steel Ave, Pittsburgh, PA", "coordinates": {"lat": 40.4406, "lng": -79.9959}, "type": "waypoint"},
    {"id": "p3", "name": "Chicago Distribution", "address": "789 Wind St, Chicago, IL", "coordinates": {"lat": 41.8781, "lng": -87.6298}, "type": "waypoint"},
    {"id": "p4", "name": "Denver Hub", "address": "101 Mountain Rd, Denver, CO", "coordinates": {"lat": 39.7392, "lng": -104.9903}, "type": "waypoint"},
    {"id": "p5", "name": "Los Angeles Destination", "address": "555 Beach Blvd, Los Angeles, CA", "coordinates": {"lat": 34.0522, "lng": -118.2437}, "type": "destination"}
  ]',
  '[
    {"origin": {"id": "p1", "name": "New York Warehouse"}, "destination": {"id": "p2", "name": "Pittsburgh Stopover"}, "distance": 480, "duration": 420, "mode": "truck", "carbonFootprint": 44.16, "fuelConsumption": 168},
    {"origin": {"id": "p2", "name": "Pittsburgh Stopover"}, "destination": {"id": "p3", "name": "Chicago Distribution"}, "distance": 530, "duration": 465, "mode": "truck", "carbonFootprint": 48.76, "fuelConsumption": 185.5},
    {"origin": {"id": "p3", "name": "Chicago Distribution"}, "destination": {"id": "p4", "name": "Denver Hub"}, "distance": 1000, "duration": 330, "mode": "rail", "carbonFootprint": 22, "fuelConsumption": 50},
    {"origin": {"id": "p4", "name": "Denver Hub"}, "destination": {"id": "p5", "name": "Los Angeles Destination"}, "distance": 1300, "duration": 1040, "mode": "truck", "carbonFootprint": 119.6, "fuelConsumption": 455}
  ]',
  3310,
  2255,
  234.52,
  858.5,
  '{truck, rail}',
  false
);
