"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { cn } from "@/lib/utils";
import { Leaf, Loader2 } from "lucide-react";

interface EcoScoreDisplayProps {
  score: number; // Assuming score is between 0 (best) and 1 (worst), or -1 for loading
}

// Function to map score (0-1) to HSL color (Green 120 -> Yellow 60 -> Red 0)
const getScoreColor = (score: number): string => {
  // Clamp score between 0 and 1
  const clampedScore = Math.max(0, Math.min(1, score));
  // Linear interpolation for hue: Green (120) to Red (0)
  const hue = (1 - clampedScore) * 120;
  return `hsl(${hue}, 80%, 45%)`; // Fixed saturation and lightness
};

export function EcoScoreDisplay({ score }: EcoScoreDisplayProps) {
  const isLoading = score === -1;
  const scorePercentage = isLoading ? 0 : score * 100;
  const color = isLoading ? 'hsl(var(--muted-foreground))' : getScoreColor(score);

  let ratingText = "Poor";
  if (!isLoading) {
    if (score <= 0.33) ratingText = "Good";
    else if (score <= 0.66) ratingText = "Moderate";
  }

  return (
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Carbon Footprint Score
        </CardTitle>
         {isLoading ? (
           <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
         ) : (
            <Leaf className="h-4 w-4 text-muted-foreground" style={{ color }} />
         )}
      </CardHeader>
      <CardContent>
         {isLoading ? (
            <>
               <Skeleton className="h-8 w-24 mb-2" /> {/* Skeleton for score text */}
               <Skeleton className="h-3 w-full" /> {/* Skeleton for progress bar */}
            </>
         ) : (
            <>
               <div className="text-2xl font-bold" style={{ color }}>
                  {scorePercentage.toFixed(1)} / 100
               </div>
               <p className="text-xs text-muted-foreground mb-2">
                  ({ratingText} Efficiency - Lower is better)
               </p>
               <Progress
                  value={scorePercentage}
                  className="h-3 progress-indicator-colored" // Use the new class
                  style={{ '--progress-color': color } as React.CSSProperties}
               />
            </>
         )}
      </CardContent>
    </Card>
  );
}

// Ensure CSS Properties interface includes --progress-color if not globally defined elsewhere
declare module "react" {
  interface CSSProperties {
    '--progress-color'?: string;
  }
}
