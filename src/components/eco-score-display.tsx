"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { cn } from "@/lib/utils";
import { Leaf, Loader2, TrendingUp } from "lucide-react"; // Replace Leaf with TrendingUp

interface EcoScoreDisplayProps {
  score: number; // Score is now 0 (worst) to 1 (best), or -1 for loading
}

// Function to map score (0-1) to HSL color (Red 0 -> Yellow 60 -> Green 120)
const getScoreColor = (score: number): string => {
  // Clamp score between 0 and 1
  const clampedScore = Math.max(0, Math.min(1, score));
  // Linear interpolation for hue: Red (0) to Green (120)
  const hue = clampedScore * 120;
  return `hsl(${hue}, 70%, 45%)`; // Adjusted saturation and lightness for visibility
};

export function EcoScoreDisplay({ score }: EcoScoreDisplayProps) {
  const isLoading = score === -1;
  // Scale score from 0-1 to 0-100
  const scorePercentage = isLoading ? 0 : Math.round(score * 100);
  const color = isLoading ? 'hsl(var(--muted-foreground))' : getScoreColor(score);

  let ratingText = "Poor";
  if (!isLoading) {
    if (score >= 0.67) ratingText = "Good"; // 67-100
    else if (score >= 0.34) ratingText = "Moderate"; // 34-66
    // Poor is score < 0.34 (0-33)
  }

  return (
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Eco-Efficiency Score
        </CardTitle>
         {isLoading ? (
           <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
         ) : (
            // Use TrendingUp icon to signify higher = better
            <TrendingUp className="h-4 w-4 text-muted-foreground" style={{ color }} />
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
                  {scorePercentage} / 100
               </div>
               <p className="text-xs text-muted-foreground mb-2">
                  ({ratingText} Efficiency - Higher is better)
               </p>
               <Progress
                  value={scorePercentage} // Progress bar naturally shows higher = more progress
                  className="h-3 progress-indicator-colored" // Use the class for custom color
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
