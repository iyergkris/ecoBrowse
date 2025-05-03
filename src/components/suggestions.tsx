"use client";

import * as React from "react";
import { suggestEcoFriendlyAlternatives } from "@/ai/flows/suggest-eco-friendly-alternatives";
import type { SuggestEcoFriendlyAlternativesOutput } from "@/ai/flows/suggest-eco-friendly-alternatives";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Globe, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface SuggestionsProps {
  websiteUrl: string | null;
  triggerFetch: boolean; // Prop to trigger fetching
  onFetchComplete: () => void; // Callback when fetch completes
}

export function Suggestions({ websiteUrl, triggerFetch, onFetchComplete }: SuggestionsProps) {
  const [suggestions, setSuggestions] = React.useState<SuggestEcoFriendlyAlternativesOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const prevUrlRef = React.useRef<string | null>(null);


  React.useEffect(() => {
    if (triggerFetch && websiteUrl && websiteUrl !== prevUrlRef.current) {
      const fetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions(null); // Clear previous suggestions
        prevUrlRef.current = websiteUrl; // Update the ref immediately

        try {
          const result = await suggestEcoFriendlyAlternatives({ websiteUrl });
          setSuggestions(result);
        } catch (err) {
          console.error("Error fetching suggestions:", err);
          setError("Failed to load suggestions. Please try again.");
        } finally {
          setIsLoading(false);
          onFetchComplete(); // Signal completion
        }
      };
      fetchSuggestions();
    } else if (!triggerFetch) {
       // Reset state if trigger is false (e.g., URL input cleared)
       prevUrlRef.current = null;
       setSuggestions(null);
       setError(null);
       setIsLoading(false);
    }
  }, [websiteUrl, triggerFetch, onFetchComplete]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
           <Skeleton className="h-4 w-1/3 mt-4" />
           <Skeleton className="h-4 w-full" />
           <Skeleton className="h-4 w-2/3" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!suggestions && !websiteUrl) {
       return <p className="text-sm text-muted-foreground">Enter a website URL above to get suggestions.</p>;
    }

     if (!suggestions && websiteUrl && !triggerFetch && !isLoading) {
       return <p className="text-sm text-muted-foreground">Click "Analyze" to get suggestions for {websiteUrl}.</p>;
    }


    if (suggestions) {
      return (
        <div className="space-y-4">
          {suggestions.suggestions.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Tips to Reduce Footprint
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {suggestions.suggestions.map((suggestion, index) => (
                  <li key={`suggestion-${index}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.alternativeWebsites.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                <Globe className="h-4 w-4 text-primary" />
                Greener Alternatives
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {suggestions.alternativeWebsites.map((altWebsite, index) => (
                   // Basic link, consider adding target="_blank" rel="noopener noreferrer" for external links
                  <li key={`alt-${index}`}>
                    <a href={altWebsite.startsWith('http') ? altWebsite : `https://${altWebsite}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {altWebsite}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestions.suggestions.length === 0 && suggestions.alternativeWebsites.length === 0 && (
             <p className="text-sm text-muted-foreground">No specific suggestions available for this site.</p>
          )}
        </div>
      );
    }

    return null; // Should not happen with current logic, but added for completeness
  };


  return (
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Smart Suggestions</CardTitle>
        <CardDescription>AI-powered tips and greener website alternatives.</CardDescription>
      </CardHeader>
      <CardContent>
       {renderContent()}
      </CardContent>
    </Card>
  );
}
