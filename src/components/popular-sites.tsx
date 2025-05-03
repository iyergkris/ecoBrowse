"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateWebsiteCarbonFootprint } from '@/services/website-carbon-footprint';
import { Globe, AlertCircle } from 'lucide-react';

// List of popular websites (Top 10 based on general knowledge, adjust as needed)
const POPULAR_WEBSITES = [
  'google.com',
  'youtube.com',
  'facebook.com',
  'wikipedia.org',
  'amazon.com',
  'reddit.com',
  'yahoo.com',
  'instagram.com',
  'twitter.com', // or x.com
  'linkedin.com',
];

interface SiteScoreData {
  url: string;
  score: number | null; // 0-100 scale
  error: boolean;
}

export function PopularSites() {
  const [siteScores, setSiteScores] = useState<SiteScoreData[]>(
    POPULAR_WEBSITES.map(url => ({ url, score: null, error: false }))
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      const scorePromises = POPULAR_WEBSITES.map(async (url) => {
        try {
          const fullUrl = `https://${url}`; // Ensure protocol for analysis
          const data = await calculateWebsiteCarbonFootprint(fullUrl);
          return { url, score: Math.round(data.carbonFootprintScore * 100), error: false }; // Scale to 0-100
        } catch (error) {
          console.error(`Error fetching score for ${url}:`, error);
          return { url, score: null, error: true };
        }
      });

      const results = await Promise.all(scorePromises);
      // Sort by score (lowest first), errors at the end
      results.sort((a, b) => {
        if (a.error && b.error) return 0;
        if (a.error) return 1;
        if (b.error) return -1;
        if (a.score === null && b.score === null) return 0;
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return a.score - b.score;
      });
      setSiteScores(results);
      setIsLoading(false);
    };

    fetchScores();
  }, []);

  const renderScore = (data: SiteScoreData) => {
    if (data.error) {
      return (
        <span className="text-destructive flex items-center text-xs">
          <AlertCircle className="mr-1 h-3 w-3" /> Error
        </span>
      );
    }
    if (data.score === null) {
       return <span className="text-muted-foreground text-xs">N/A</span>;
    }

    let scoreColor = 'text-destructive'; // Default to red (high score = bad)
    if (data.score <= 33) scoreColor = 'text-green-600'; // Use specific color for better contrast
    else if (data.score <= 66) scoreColor = 'text-yellow-600'; // Use specific color

    return <span className={`font-medium ${scoreColor}`}>{data.score}</span>;
  };

  return (
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Popular Websites Eco-Scores
        </CardTitle>
        <CardDescription>
          Estimated carbon footprint scores for some of the web's most visited sites (Lower is better).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10px]">#</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="text-right">Score (0-100)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                  </TableRow>
                ))
              : siteScores.map((data, index) => (
                  <TableRow key={data.url}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{data.url}</TableCell>
                    <TableCell className="text-right">{renderScore(data)}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
         {!isLoading && siteScores.some(s => s.error) && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center">
              <AlertCircle className="mr-1 h-3 w-3" />
              Some scores could not be calculated due to errors or site unavailability.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
