
"use client";

import { Recommendation } from "../types";
import { MapPin, Clock, Star, DollarSign } from "lucide-react";
import { clsx } from "clsx";

interface LocationCardProps {
  recommendation: Recommendation;
  variant?: "default" | "compact";
  onClick?: () => void;
}

export function LocationCard({ recommendation, variant = "default", onClick }: LocationCardProps) {
  const isCompact = variant === "compact";
  
  return (
    <div 
      className={clsx(
        "card cursor-pointer hover:bg-surface/80 transition-all duration-150 animate-fade-in",
        isCompact ? "p-4" : "p-6"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={clsx(
            "font-semibold text-textPrimary",
            isCompact ? "text-base" : "text-lg"
          )}>
            {recommendation.name}
          </h3>
          
          <div className="flex items-center gap-2 mt-1 text-textSecondary text-sm">
            <MapPin className="w-4 h-4" />
            <span>{recommendation.address}</span>
          </div>
          
          {!isCompact && recommendation.description && (
            <p className="text-textSecondary mt-2 text-sm leading-relaxed">
              {recommendation.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-textPrimary">
                {(recommendation.socialSentimentScore * 5).toFixed(1)}
              </span>
            </div>
            
            {recommendation.priceRange && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-textSecondary" />
                <span className="text-sm text-textSecondary">
                  {recommendation.priceRange}
                </span>
              </div>
            )}
            
            {recommendation.openNow && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Open now</span>
              </div>
            )}
          </div>
          
          {recommendation.vibeTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {recommendation.vibeTags.slice(0, isCompact ? 2 : 4).map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-sm font-medium"
                >
                  {tag}
                </span>
              ))}
              {isCompact && recommendation.vibeTags.length > 2 && (
                <span className="text-xs text-textSecondary">
                  +{recommendation.vibeTags.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-4">
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse-glow"></div>
        </div>
      </div>
    </div>
  );
}
