
-- SQL functions to help with routes table operations
-- These should be added to the Supabase SQL Editor and executed

-- Function to get all routes
CREATE OR REPLACE FUNCTION get_all_routes()
RETURNS SETOF routes
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT * FROM routes ORDER BY created_at DESC;
$$;

-- Function to get a specific route by ID
CREATE OR REPLACE FUNCTION get_route_by_id(route_id UUID)
RETURNS SETOF routes
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT * FROM routes WHERE id = route_id;
$$;

-- Function to update a route
CREATE OR REPLACE FUNCTION update_route(
  p_id UUID,
  p_points JSONB,
  p_segments JSONB,
  p_total_distance NUMERIC,
  p_total_duration NUMERIC,
  p_total_carbon_footprint NUMERIC,
  p_total_fuel_consumption NUMERIC,
  p_is_optimized BOOLEAN,
  p_optimized_at TEXT
)
RETURNS routes
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  updated_route routes;
BEGIN
  UPDATE routes
  SET 
    points = p_points,
    segments = p_segments,
    total_distance = p_total_distance,
    total_duration = p_total_duration,
    total_carbon_footprint = p_total_carbon_footprint,
    total_fuel_consumption = p_total_fuel_consumption,
    is_optimized = p_is_optimized,
    optimized_at = p_optimized_at::TIMESTAMPTZ,
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO updated_route;
  
  RETURN updated_route;
END;
$$;

-- Function to create a new route
CREATE OR REPLACE FUNCTION create_route(
  p_name TEXT,
  p_points JSONB,
  p_segments JSONB,
  p_total_distance NUMERIC,
  p_total_duration NUMERIC,
  p_total_carbon_footprint NUMERIC,
  p_total_fuel_consumption NUMERIC,
  p_transport_types TEXT[],
  p_is_optimized BOOLEAN,
  p_optimized_at TEXT
)
RETURNS routes
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  new_route routes;
BEGIN
  INSERT INTO routes (
    name,
    points,
    segments,
    total_distance,
    total_duration,
    total_carbon_footprint,
    total_fuel_consumption,
    transport_types,
    is_optimized,
    optimized_at,
    created_by
  )
  VALUES (
    p_name,
    p_points,
    p_segments,
    p_total_distance,
    p_total_duration,
    p_total_carbon_footprint,
    p_total_fuel_consumption,
    p_transport_types,
    p_is_optimized,
    p_optimized_at::TIMESTAMPTZ,
    auth.uid()
  )
  RETURNING * INTO new_route;
  
  RETURN new_route;
END;
$$;
