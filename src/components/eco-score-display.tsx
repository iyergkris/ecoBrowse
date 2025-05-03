"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";

interface EcoScoreDisplayProps {
  score: number; // Assuming score is between 0 (best) and 1 (worst)
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
  const scorePercentage = score * 100;
  const color = getScoreColor(score);

  let ratingText = "Poor";
  if (score <= 0.33) ratingText = "Good";
  else if (score <= 0.66) ratingText = "Moderate";

  return (
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Carbon Footprint Score
        </CardTitle>
        <Leaf className="h-4 w-4 text-muted-foreground" style={{ color }} />
      </CardHeader>
      <CardContent>
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
           // indicatorClassName prop is no longer strictly needed if using the CSS variable approach with the class
        />
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
