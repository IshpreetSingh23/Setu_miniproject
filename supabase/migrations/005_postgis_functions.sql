-- Migration 005: PostGIS Stored Functions & RPC Endpoints
-- Enables server-side ellipsoidal geodesic calculations, validation, and spatial querying

-- 1. Calculate Geodesic Parcel Area in Acres using PostGIS Geography
CREATE OR REPLACE FUNCTION calculate_parcel_area_acres(geom GEOMETRY)
RETURNS NUMERIC AS $$
BEGIN
    IF geom IS NULL THEN
        RETURN 0.0;
    END IF;
    -- ST_Area on geography computes spherical/ellipsoidal area in square meters
    -- 1 Acre = 4046.8564224 square meters
    RETURN ROUND((ST_Area(geom::geography) / 4046.8564224)::numeric, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Validate Parcel Geometry Integrity
CREATE OR REPLACE FUNCTION validate_parcel_geometry(geom GEOMETRY)
RETURNS JSONB AS $$
BEGIN
    IF geom IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'reason', 'Geometry is null');
    END IF;
    RETURN jsonb_build_object(
        'valid', ST_IsValid(geom),
        'reason', ST_IsValidReason(geom),
        'geometry_type', ST_GeometryType(geom)
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Retrieve Property with GeoJSON Feature
CREATE OR REPLACE FUNCTION get_property_geojson(p_property_id TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(p.geometry)::jsonb,
        'properties', to_jsonb(p) - 'geometry'
    ) INTO result
    FROM properties p
    WHERE p.property_id = p_property_id OR p.id::text = p_property_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Spatial Proximity Search for Nearby Parcels
CREATE OR REPLACE FUNCTION search_properties_spatial(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_meters DOUBLE PRECISION DEFAULT 1000.0
)
RETURNS TABLE (
    id UUID,
    property_id TEXT,
    owner_name TEXT,
    khasra_number TEXT,
    area_value NUMERIC,
    area_unit TEXT,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.property_id,
        p.owner_name,
        p.khasra_number,
        p.area_value,
        p.area_unit,
        ST_Distance(
            p.geometry::geography,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
        ) AS distance_meters
    FROM properties p
    WHERE ST_DWithin(
        p.geometry::geography,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius_meters
    )
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;
