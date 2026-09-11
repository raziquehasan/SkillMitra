"use client";

import { useState, useEffect } from "react";
import { District } from "@/lib/api";

interface MaharashtraDistrictMapProps {
  districts: District[];
  selectedDistrict: string | null;
  onDistrictClick: (districtId: string) => void;
  districtIntelligence?: Record<string, {
    demandLevel?: string;
    jobPostings?: number;
    demandSignals?: number;
    trainingProgrammes?: number;
    trainingCapacity?: number;
  }>;
}

interface GeoJSONFeature {
  type: "Feature";
  properties: {
    dt_code: string;
    district: string;
    st_nm: string;
    st_code: string;
    year: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

const getDemandColor = (demandLevel?: string): string => {
  switch (demandLevel?.toLowerCase()) {
    case "high":
    case "high demand":
      return "#1e3a5f"; // dark navy
    case "growing":
      return "#2563eb"; // strong blue
    case "moderate":
      return "#60a5fa"; // medium/light blue
    case "low":
      return "#94a3b8"; // grey-blue
    default:
      return "#f1f5f9"; // very pale grey (no data) - clearly different from low
  }
};

const getDemandLabel = (demandLevel?: string): string => {
  switch (demandLevel?.toLowerCase()) {
    case "high":
    case "high demand":
      return "High Demand";
    case "growing":
      return "Growing";
    case "moderate":
      return "Moderate";
    case "low":
      return "Low";
    default:
      return "No Data";
  }
};

export default function MaharashtraDistrictMap({
  districts,
  selectedDistrict,
  onDistrictClick,
  districtIntelligence = {},
}: MaharashtraDistrictMapProps) {
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const response = await fetch('/maharashtra-districts.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGeoData(data);
      } catch (error) {
        console.error('Failed to load GeoJSON data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load map data');
      } finally {
        setLoading(false);
      }
    };
    loadGeoData();
  }, []);

  // Create a mapping of district names to IDs with support for renamed districts
  const districtNameToId = districts.reduce((acc, district) => {
    acc[district.name.toLowerCase()] = district.id;
    return acc;
  }, {} as Record<string, string>);

  // District name mappings for renamed districts (GeoJSON official names -> Database names)
  const districtNameMappings: Record<string, string> = {
    "ahilyanagar": "ahmednagar",
    "chhatrapati sambhajinagar": "aurangabad", 
    "dharashiv": "osmanabad",
    "mumbai city": "mumbai",
    "mumbai suburban": "mumbai suburban"
  };

  const getDistrictId = (geoDistrictName: string): string | null => {
    const normalizedName = geoDistrictName.toLowerCase();
    // First try direct match
    if (districtNameToId[normalizedName]) {
      return districtNameToId[normalizedName];
    }
    // Then try mapped name for renamed districts
    const mappedName = districtNameMappings[normalizedName];
    if (mappedName && districtNameToId[mappedName]) {
      return districtNameToId[mappedName];
    }
    return null;
  };

  const getDistrictIntelligence = (geoDistrictName: string) => {
    const districtId = getDistrictId(geoDistrictName);
    return districtId ? districtIntelligence[districtId] : undefined;
  };

  // Extract all coordinate rings from GeoJSON geometry
  const extractPolygonRings = (geometry: GeoJSONFeature['geometry']): number[][][] => {
    const rings: number[][][] = [];
    
    if (geometry.type === 'Polygon') {
      // Polygon: coordinates = [ring1, ring2, ...]
      // Each ring: [[lon, lat], [lon, lat], ...]
      const coords = geometry.coordinates as number[][][];
      coords.forEach(ring => {
        if (Array.isArray(ring) && ring.length > 0) {
          rings.push(ring);
        }
      });
    } else if (geometry.type === 'MultiPolygon') {
      // MultiPolygon: coordinates = [polygon1, polygon2, ...]
      // Each polygon: [ring1, ring2, ...]
      const coords = geometry.coordinates as number[][][][];
      coords.forEach(polygon => {
        if (Array.isArray(polygon)) {
          polygon.forEach(ring => {
            if (Array.isArray(ring) && ring.length > 0) {
              rings.push(ring);
            }
          });
        }
      });
    }
    
    return rings;
  };

  // Calculate bounding box from all features
  const calculateBounds = (features: GeoJSONFeature[]) => {
    let minLon = Infinity, maxLon = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    let validCoords = 0;

    features.forEach(feature => {
      const rings = extractPolygonRings(feature.geometry);
      
      rings.forEach(ring => {
        ring.forEach(coord => {
          if (Array.isArray(coord) && coord.length >= 2) {
            const [lon, lat] = coord;
            if (typeof lon === 'number' && typeof lat === 'number' && !isNaN(lon) && !isNaN(lat)) {
              minLon = Math.min(minLon, lon);
              maxLon = Math.max(maxLon, lon);
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
              validCoords++;
            }
          }
        });
      });
    });

    // Fallback to Maharashtra bounds if no valid coordinates found
    if (validCoords === 0) {
      return { minLon: 72, maxLon: 81, minLat: 15, maxLat: 22 };
    }

    console.log('MAP BOUNDS:', { minLon, maxLon, minLat, maxLat, validCoords });
    return { minLon, maxLon, minLat, maxLat };
  };

  // Convert a single coordinate ring to SVG path segment
  const ringToSvgPath = (
    ring: number[][],
    bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number },
    svgWidth: number,
    svgHeight: number,
    padding: number,
    scale: number
  ): string => {
    const pathSegments = ring.map(coord => {
      if (!Array.isArray(coord) || coord.length < 2) return null;
      const [lon, lat] = coord;
      if (typeof lon !== 'number' || typeof lat !== 'number' || isNaN(lon) || isNaN(lat)) return null;

      const x = padding + ((lon - bounds.minLon) * scale);
      const y = padding + ((bounds.maxLat - lat) * scale); // Flip Y for SVG
      return `${x.toFixed(2)} ${y.toFixed(2)}`;
    }).filter(Boolean) as string[];

    if (pathSegments.length === 0) return '';
    return `M ${pathSegments.join(' L ')} Z`;
  };

  // Convert GeoJSON coordinates to SVG path and calculate centroid
  const coordinatesToPath = (
    geometry: GeoJSONFeature['geometry'],
    bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number },
    svgWidth: number,
    svgHeight: number
  ): { path: string; centroid: { x: number; y: number } } => {
    const rings = extractPolygonRings(geometry);
    
    if (rings.length === 0) {
      return { path: '', centroid: { x: svgWidth / 2, y: svgHeight / 2 } };
    }

    // Add padding
    const padding = 5;
    const usableWidth = svgWidth - (padding * 2);
    const usableHeight = svgHeight - (padding * 2);

    const lonRange = bounds.maxLon - bounds.minLon;
    const latRange = bounds.maxLat - bounds.minLat;

    // Avoid division by zero
    const scaleX = lonRange > 0 ? usableWidth / lonRange : 1;
    const scaleY = latRange > 0 ? usableHeight / latRange : 1;
    const scale = Math.min(scaleX, scaleY); // Preserve aspect ratio

    // Convert each ring to a separate SVG subpath
    const subpaths = rings.map(ring => 
      ringToSvgPath(ring, bounds, svgWidth, svgHeight, padding, scale)
    ).filter(Boolean);

    if (subpaths.length === 0) {
      return { path: '', centroid: { x: svgWidth / 2, y: svgHeight / 2 } };
    }

    // Combine all subpaths
    const path = subpaths.join(' ');

    // Calculate centroid from all coordinates
    let allCoords: { x: number; y: number }[] = [];
    rings.forEach(ring => {
      ring.forEach(coord => {
        if (Array.isArray(coord) && coord.length >= 2) {
          const [lon, lat] = coord;
          if (typeof lon === 'number' && typeof lat === 'number' && !isNaN(lon) && !isNaN(lat)) {
            const x = padding + ((lon - bounds.minLon) * scale);
            const y = padding + ((bounds.maxLat - lat) * scale);
            allCoords.push({ x, y });
          }
        }
      });
    });

    const centroidX = allCoords.length > 0 
      ? allCoords.reduce((sum, coord) => sum + coord.x, 0) / allCoords.length 
      : svgWidth / 2;
    const centroidY = allCoords.length > 0 
      ? allCoords.reduce((sum, coord) => sum + coord.y, 0) / allCoords.length 
      : svgHeight / 2;

    return { path, centroid: { x: centroidX, y: centroidY } };
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ minHeight: "280px" }}>
        <p className="text-xs text-slate-500">Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center" style={{ minHeight: "280px" }}>
        <p className="text-xs text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!geoData || !geoData.features || geoData.features.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ minHeight: "280px" }}>
        <p className="text-xs text-slate-500">Map unavailable</p>
      </div>
    );
  }

  // Calculate dynamic bounds from actual data
  const bounds = calculateBounds(geoData.features);

  // Validation log
  console.log("Maharashtra Map Validation", {
    geojsonFeatures: geoData.features.length,
    renderedDistricts: geoData.features.length,
    bounds
  });

  // Calculate coverage statistics
  const districtsWithData = Object.keys(districtIntelligence).length;
  const districtsWithHighDemand = Object.values(districtIntelligence).filter(
    intel => intel.demandLevel?.toLowerCase() === 'high' || intel.demandLevel?.toLowerCase() === 'high demand'
  ).length;
  
  // Calculate aggregate statistics for live status
  const totalDemandSignals = Object.values(districtIntelligence).reduce(
    (sum, intel) => sum + (intel.demandSignals || 0), 0
  );
  const totalJobPostings = Object.values(districtIntelligence).reduce(
    (sum, intel) => sum + (intel.jobPostings || 0), 0
  );
  const totalTrainingProgrammes = Object.values(districtIntelligence).reduce(
    (sum, intel) => sum + (intel.trainingProgrammes || 0), 0
  );

  // Use larger SVG dimensions for better scaling
  const svgWidth = 800;
  const svgHeight = 600;

  const handleMouseEnter = (districtName: string, event: React.MouseEvent) => {
    setHoveredDistrict(districtName);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  const handleMouseLeave = () => {
    setHoveredDistrict(null);
    setTooltipPosition(null);
  };

  return (
    <div className="w-full">
      {/* Live status indicator */}
      <div className="mb-3 bg-[#123b68]/5 border border-[#123b68]/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-[#123b68] animate-pulse" />
          <span className="font-semibold text-[#123b68]">
            Demand intelligence
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
          {districtsWithData > 0 ? (
            <>
              <span className="font-medium text-slate-700">{districtsWithData} districts with active signals</span>
              {totalDemandSignals > 0 && <span>· {totalDemandSignals} demand signals</span>}
              {totalJobPostings > 0 && <span>· {totalJobPostings} job-market openings</span>}
              {totalTrainingProgrammes > 0 && <span>· {totalTrainingProgrammes} training programmes</span>}
            </>
          ) : (
            <span className="text-slate-500">Loading demand intelligence...</span>
          )}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: "280px" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {geoData.features.map((feature) => {
            const districtName = feature.properties.district;
            const districtId = getDistrictId(districtName);
            const intelligence = getDistrictIntelligence(districtName);
            const demandColor = getDemandColor(intelligence?.demandLevel);
            const isSelected = selectedDistrict === districtId;
            const isHovered = hoveredDistrict === districtName;

            const { path: pathData, centroid } = coordinatesToPath(
              feature.geometry,
              bounds,
              svgWidth,
              svgHeight
            );

            // Skip if path is empty
            if (!pathData) {
              return null;
            }

            return (
              <g key={`${feature.properties.dt_code}-${feature.properties.district}`}>
                <path
                  d={pathData}
                  fill={demandColor}
                  stroke={isSelected ? "#123b68" : isHovered ? "#0f2d4a" : "#ffffff"}
                  strokeWidth={isSelected ? 5 : isHovered ? 3 : 1}
                  className="cursor-pointer transition-all duration-150"
                  style={{ 
                    opacity: isHovered ? 0.85 : 1,
                    filter: isSelected ? 'brightness(1.1) drop-shadow(0 4px 8px rgba(18, 59, 104, 0.4))' : isHovered ? 'brightness(0.9) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                  }}
                  vectorEffect="non-scaling-stroke"
                  onClick={() => districtId && onDistrictClick(districtId)}
                  onMouseEnter={(e) => handleMouseEnter(districtName, e)}
                  onMouseLeave={handleMouseLeave}
                />
                {/* Selected district name label inside polygon */}
                {isSelected && (
                  <g>
                    {/* White background pill for better visibility */}
                    <rect
                      x={centroid.x - 40}
                      y={centroid.y - 12}
                      width="80"
                      height="24"
                      rx="4"
                      fill="#ffffff"
                      stroke="#123b68"
                      strokeWidth="2"
                      pointerEvents="none"
                      opacity="0.95"
                    />
                    {/* District name text */}
                    <text
                      x={centroid.x.toFixed(2)}
                      y={centroid.y.toFixed(2)}
                      dy="0.35em"
                      fontSize="12"
                      fontWeight="700"
                      fill="#123b68"
                      textAnchor="middle"
                      pointerEvents="none"
                      style={{ 
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        textShadow: 'none'
                      }}
                    >
                      {(() => {
                        const district = districts.find(d => d.id === districtId);
                        return district ? district.name : districtName;
                      })()}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredDistrict && tooltipPosition && (
          <div
            className="absolute z-50 bg-white border-2 border-slate-300 rounded-lg shadow-xl p-4 pointer-events-none min-w-[200px]"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y - 10,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {(() => {
              const district = districts.find(d => d.name.toLowerCase() === hoveredDistrict.toLowerCase());
              const intelligence = district ? districtIntelligence[district.id] : undefined;
              
              return (
                <div className="space-y-2">
                  <div className="font-bold text-[#123b68] text-sm border-b-2 border-slate-200 pb-2">
                    {hoveredDistrict.toUpperCase()}
                  </div>
                  {intelligence ? (
                    <>
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        {getDemandLabel(intelligence.demandLevel)}
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        {intelligence.demandSignals !== undefined && (
                          <div className="flex justify-between">
                            <span>Demand signals</span>
                            <span className="font-bold text-slate-800">{intelligence.demandSignals}</span>
                          </div>
                        )}
                        {intelligence.jobPostings !== undefined && (
                          <div className="flex justify-between">
                            <span>Job postings</span>
                            <span className="font-bold text-slate-800">{intelligence.jobPostings}</span>
                          </div>
                        )}
                        {intelligence.trainingProgrammes !== undefined && (
                          <div className="flex justify-between">
                            <span>Training programmes</span>
                            <span className="font-bold text-slate-800">{intelligence.trainingProgrammes}</span>
                          </div>
                        )}
                        {intelligence.trainingCapacity !== undefined && (
                          <div className="flex justify-between">
                            <span>Training capacity</span>
                            <span className="font-bold text-slate-800">{intelligence.trainingCapacity}</span>
                          </div>
                        )}
                      </div>
                      {/* Demand → Training signal in tooltip */}
                      {intelligence.jobPostings && intelligence.trainingCapacity && (
                        <div className="text-xs pt-2 border-t border-slate-200 italic text-slate-700">
                          → Review training alignment
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-slate-500 italic">No demand data available</div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#1e3a5f" }} />
          <span className="text-slate-600">High Demand</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#2563eb" }} />
          <span className="text-slate-600">Growing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#60a5fa" }} />
          <span className="text-slate-600">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#94a3b8" }} />
          <span className="text-slate-600">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f1f5f9" }} />
          <span className="text-slate-600">No Data</span>
        </div>
      </div>

      {/* Coverage footer */}
      <div className="mt-3 text-xs text-slate-500 border-t border-slate-200 pt-2">
        <div className="flex flex-wrap gap-2">
          <span>{geoData.features.length} districts mapped</span>
          <span>·</span>
          <span className="font-medium text-slate-700">{districtsWithData} with current demand evidence</span>
          {districtsWithHighDemand > 0 && (
            <>
              <span>·</span>
              <span className="font-medium text-[#123b68]">{districtsWithHighDemand} high demand</span>
            </>
          )}
        </div>
      </div>

      {/* Selected district intelligence */}
      {selectedDistrict && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">DISTRICT INTELLIGENCE</p>
          {(() => {
            const district = districts.find(d => d.id === selectedDistrict);
            const intelligence = districtIntelligence[selectedDistrict];
            
            // Debug logging
            console.log('District Intelligence Debug:', {
              selectedDistrict,
              district: district ? { id: district.id, name: district.name } : null,
              intelligence,
              districtIntelligenceKeys: Object.keys(districtIntelligence),
              districtNameToId: districtNameToId
            });
            
            if (!district) return <p className="text-xs text-slate-600">District not found</p>;
            if (!intelligence) return (
              <div className="space-y-1">
                <p className="text-xs text-slate-600">No current demand evidence for this district</p>
                <p className="text-xs text-slate-500 italic">Training and demand indicators are not currently available for this district.</p>
              </div>
            );

            // Find the corresponding GeoJSON district name for display
            const geoDistrictName = Object.keys(districtNameToId).find(
              key => districtNameToId[key] === selectedDistrict
            );
            const displayName = geoDistrictName || district.name;

            return (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#123b68]">{displayName}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500">Demand Level</p>
                    <p className="font-medium text-slate-700">{getDemandLabel(intelligence.demandLevel)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Job Postings</p>
                    <p className="font-medium text-slate-700">{intelligence.jobPostings ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Demand Signals</p>
                    <p className="font-medium text-slate-700">{intelligence.demandSignals ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Training Programmes</p>
                    <p className="font-medium text-slate-700">{intelligence.trainingProgrammes ?? "—"}</p>
                  </div>
                </div>
                {intelligence.trainingCapacity !== undefined && (
                  <div className="text-xs">
                    <p className="text-slate-500">Training Capacity</p>
                    <p className="font-medium text-slate-700">{intelligence.trainingCapacity}</p>
                  </div>
                )}
                {/* Demand → Training signal */}
                {intelligence.jobPostings && intelligence.trainingCapacity && (
                  <div className="text-xs pt-2 border-t border-slate-100">
                    <p className="text-slate-500 italic">→ Review training alignment</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
