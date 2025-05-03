"use client";

import * as React from "react";
import type { WebsiteCarbonFootprint } from "@/services/website-carbon-footprint";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { Zap, Database, Recycle, FileText, Info } from "lucide-react"; // Changed Loader2 to Info

interface FootprintDetailsProps {
  details: WebsiteCarbonFootprint | null;
  isLoading: boolean; // Add isLoading prop
}

export function FootprintDetails({ details, isLoading }: FootprintDetailsProps) {
  const formatBytes = (bytes: number, decimals = 2) => {
     if (bytes < 0 || isNaN(bytes)) return 'N/A'; // Handle invalid input
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
     // Ensure i is within bounds
     const unitIndex = Math.max(0, Math.min(i, sizes.length - 1));
    return parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(dm)) + ' ' + sizes[unitIndex];
  };

   const formatPercentage = (value: number) => {
    if (value < 0 || value > 1 || isNaN(value)) return 'N/A'; // Handle invalid input
    return (value * 100).toFixed(1) + '%';
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>Est. Data Transfer</span>
             </div>
             <Skeleton className="h-4 w-20" />
          </div>
           <div className="flex items-center justify-between text-sm">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>Est. Server Efficiency</span>
             </div>
             <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between text-sm">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Recycle className="h-4 w-4" />
                <span>Est. Renewable Energy</span>
             </div>
             <Skeleton className="h-4 w-16" />
          </div>
          <div className="pt-4">
             <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                Calculation Info
             </h4>
             <Skeleton className="h-3 w-full mb-1" />
             <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      );
    }

    if (!details) {
      return <p className="text-sm text-muted-foreground">Waiting for analysis results...</p>;
    }

    // Render actual data when not loading and details are available
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Database className="h-4 w-4" />
                    <span>Est. Data Transfer</span>
                </div>
                {/* Lower is better for data transfer */}
                <span className="font-medium">{formatBytes(details.dataTransferSize)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    {/* Higher is better */}
                    <span>Est. Server Efficiency</span>
                </div>
                <span className="font-medium">{formatPercentage(details.serverEnergyEfficiency)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Recycle className="h-4 w-4" />
                    {/* Higher is better */}
                    <span>Est. Renewable Energy</span>
                </div>
                <span className="font-medium">{formatPercentage(details.renewableEnergyUsage)}</span>
            </div>
            <div className="pt-4">
                <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    Calculation Info
                </h4>
                <p className="text-xs text-muted-foreground italic">
                    {details.calculationNotes}
                </p>
            </div>
        </div>
    );
  };

  return (
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Efficiency Factors</CardTitle>
        <CardDescription>
           {isLoading ? "Analyzing factors..." : "Estimated factors influencing the eco-score."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
