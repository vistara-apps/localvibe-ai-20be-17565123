
"use client";

import { Recommendation } from "../types";
import { MapPin, Navigation } from "lucide-react";
import { clsx } from "clsx";

interface MapProps {
  recommendations: Recommendation[];
  userLocation?: { latitude: number; longitude: number };
  onLocationSelect?: (recommendation: Recommendation) => void;
  variant?: "default";
}

export function Map({ recommendations, userLocation, onLocationSelect, variant = "default" }: MapProps) {
  // Mock map implementation - in production, use Google Maps, Mapbox, etc.
  const mockMapBounds = {
    minLat: Math.min(...recommendations.map(r => r.latitude)) - 0.01,
    maxLat: Math.max(...recommendations.map(r => r.latitude)) + 0.01,
    minLng: Math.min(...recommendations.map(r => r.longitude)) - 0.01,
    maxLng: Math.max(...recommendations.map(r => r.longitude)) + 0.01,
  };

  const getPositionInMap = (lat: number, lng: number) => {
    const x = ((lng - mockMapBounds.minLng) / (mockMapBounds.maxLng - mockMapBounds.minLng)) * 100;
    const y = ((mockMapBounds.maxLat - lat) / (mockMapBounds.maxLat - mockMapBounds.minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div className="card h-80 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-bg to-surface/50">
        {/* Grid pattern for map aesthetic */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        {/* User location */}
        {userLocation && (
          <div 
            className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg z-20 animate-pulse-glow"
            style={{
              left: `${getPositionInMap(userLocation.latitude, userLocation.longitude).x}%`,
              top: `${getPositionInMap(userLocation.latitude, userLocation.longitude).y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Navigation className="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        )}
        
        {/* Recommendation pins */}
        {recommendations.map((rec, index) => {
          const position = getPositionInMap(rec.latitude, rec.longitude);
          return (
            <div
              key={rec.recommendationId}
              className={clsx(
                "absolute w-6 h-6 bg-accent hover:bg-accent/80 rounded-full border-2 border-white shadow-lg cursor-pointer z-10 transition-all duration-150",
                "flex items-center justify-center group animate-fade-in"
              )}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${index * 100}ms`
              }}
              onClick={() => onLocationSelect?.(rec)}
            >
              <MapPin className="w-3 h-3 text-white" />
              
              {/* Tooltip */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-surface border border-white/20 rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-30">
                <p className="text-sm font-medium text-textPrimary">{rec.name}</p>
                <p className="text-xs text-textSecondary">{rec.type}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-surface/90 border border-white/20 rounded-md p-2">
          <p className="text-xs text-textSecondary">
            {recommendations.length} spots found
          </p>
        </div>
      </div>
    </div>
  );
}
