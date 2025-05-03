"use client";

import * as React from "react";
import type { WebsiteCarbonFootprint } from "@/services/website-carbon-footprint";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Database, Recycle, FileText } from "lucide-react";

interface FootprintDetailsProps {
  details: WebsiteCarbonFootprint | null;
}

export function FootprintDetails({ details }: FootprintDetailsProps) {
  if (!details) {
    return (
      <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>Footprint Details</CardTitle>
          <CardDescription>Calculating footprint...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Waiting for data...</p>
        </CardContent>
      </Card>
    );
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Footprint Details</CardTitle>
        <CardDescription>Breakdown of the factors contributing to the score.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
             <Database className="h-4 w-4" />
             <span>Data Transfer Size</span>
          </div>
          <span className="font-medium">{formatBytes(details.dataTransferSize)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4" />
            <span>Server Energy Efficiency</span>
          </div>
          <span className="font-medium">{(details.serverEnergyEfficiency * 100).toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
             <Recycle className="h-4 w-4" />
             <span>Renewable Energy Usage</span>
          </div>
          <span className="font-medium">{(details.renewableEnergyUsage * 100).toFixed(1)}%</span>
        </div>
         <div className="pt-4">
            <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Calculation Notes & Sources
            </h4>
            <p className="text-xs text-muted-foreground italic">
                {details.calculationNotes}
            </p>
         </div>
      </CardContent>
    </Card>
  );
}
