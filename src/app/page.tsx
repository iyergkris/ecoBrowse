"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link'; // Import Link
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EcoScoreDisplay } from "@/components/eco-score-display";
import { FootprintDetails } from "@/components/footprint-details";
import { ReportsDashboard } from "@/components/reports-dashboard";
import { PopularSites } from "@/components/popular-sites"; // Import PopularSites
import { calculateWebsiteCarbonFootprint } from '@/services/website-carbon-footprint';
import type { WebsiteCarbonFootprint } from '@/services/website-carbon-footprint';
import { Loader2, Search, Leaf } from 'lucide-react'; // Import Leaf
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Define STORAGE_KEY locally or import if defined elsewhere
const STORAGE_KEY = 'ecoBrowseReports';

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [currentUrlToAnalyze, setCurrentUrlToAnalyze] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [footprintData, setFootprintData] = useState<WebsiteCarbonFootprint | null>(null);
  const [reportUpdateTrigger, setReportUpdateTrigger] = useState<number>(0); // Keep for potential force re-render needs
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false); // Track client-side rendering

  // Set client state on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!websiteUrl || isLoading) return;

    let formattedUrl = websiteUrl;
    // Basic URL validation/formatting
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setIsLoading(true);
    setFootprintData(null); // Clear previous data
    setCurrentUrlToAnalyze(formattedUrl); // Set the URL to be analyzed

    try {
      const data = await calculateWebsiteCarbonFootprint(formattedUrl);
      setFootprintData(data);

      // Add data to reports using localStorage
       try {
            const newEntry = {
                timestamp: Date.now(),
                websiteUrl: formattedUrl,
                carbonScore: data.carbonFootprintScore, // Use the 0-1 score (higher is better)
            };

             if (typeof localStorage !== 'undefined') {
                 // Use localStorage
                const storedData = localStorage.getItem(STORAGE_KEY);
                const reports = storedData ? JSON.parse(storedData) : [];
                reports.push(newEntry);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
                // Dispatch standard storage event for components listening to localStorage changes
                window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(reports), storageArea: localStorage }));
                 console.log('Report saved to localStorage');
             } else {
                  console.warn("localStorage unavailable, cannot save report.");
                   toast({
                      title: "Storage Unavailable",
                      description: "Could not save the analysis result to your reports.",
                      variant: "destructive",
                  });
             }

            // Trigger state update in this component if necessary (though listening components are preferred)
            setReportUpdateTrigger(Date.now());

       } catch (storageError) {
            console.error("Failed to save report data:", storageError);
           // Optionally notify user
            toast({
                title: "Storage Error",
                description: "Could not save the analysis result to your reports.",
                variant: "destructive",
            });
       }


       toast({
          title: "Analysis Complete",
          description: `Eco-Efficiency score calculated for ${formattedUrl}`,
        });

    } catch (error) {
      console.error("Error calculating carbon footprint:", error);
       toast({
          title: "Analysis Failed",
          description: error instanceof Error ? error.message : `Could not analyze ${formattedUrl}. Please check the URL and try again.`,
          variant: "destructive",
        });
      setCurrentUrlToAnalyze(null); // Reset on error
    } finally {
      setIsLoading(false); // Set loading false after analysis is done
    }
  }, [websiteUrl, isLoading, toast]);

    // Effect to listen for storage changes specifically for clearing data
    // This ensures UI consistency if data is cleared from the ReportsDashboard
    useEffect(() => {
        const handleStorageClear = (event: StorageEvent) => {
            // Listen for standard storage event with null newValue
            if (event.key === STORAGE_KEY && event.newValue === null) {
                 console.log("Home: Detected report data cleared, triggering UI update.");
                 // Force a state update to potentially re-render dependent components if necessary
                 setReportUpdateTrigger(Date.now());
            }
        };

        window.addEventListener('storage', handleStorageClear);
        return () => {
            window.removeEventListener('storage', handleStorageClear);
        };
    }, []); // Empty dependency array


    // Conditionally render skeleton or actual content based on client state
    if (!isClient) {
      return (
         <main className="container mx-auto max-w-7xl p-4 md:p-8 space-y-8 min-h-screen">
             <header className="text-center space-y-3">
                <Skeleton className="h-8 w-32 inline-block rounded-full" />
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-2/3 mx-auto" />
            </header>
             <div className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto p-2 bg-card rounded-lg shadow">
                 <Skeleton className="h-10 flex-grow rounded-md" />
                 <Skeleton className="h-10 w-28 rounded-md" />
             </div>
             {/* Skeleton for potential results */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-card/50 rounded-lg border border-border/50">
                 <Skeleton className="h-32 w-full rounded-lg" />
                 <Skeleton className="h-48 w-full rounded-lg" />
             </div>
             {/* Skeleton for reports */}
             <div className="pt-8">
                <Skeleton className="h-64 w-full rounded-lg" />
             </div>
             {/* Skeleton for popular sites */}
             <div className="pt-8">
                 <Skeleton className="h-96 w-full rounded-lg" />
             </div>
            <footer className="text-center text-xs text-muted-foreground pt-6">
                <Skeleton className="h-4 w-48 mx-auto" />
            </footer>
         </main>
      );
    }


  return (
    // Apply max-width for larger screens, mx-auto for centering
    // Add subtle background texture/gradient if desired
    <main className="container mx-auto max-w-7xl p-4 md:p-8 space-y-8 bg-gradient-to-br from-background to-secondary/30 min-h-screen">
      <header className="text-center space-y-3">
         {/* Enhanced Header Styling - Make it a link */}
          <Link href="/" passHref legacyBehavior> {/* Wrap in Link, use legacyBehavior for href on anchor */}
              <div className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-lg font-semibold shadow-md transition-transform duration-200 hover:scale-105">
                  {/* Use Leaf Icon directly */}
                  <Leaf className="h-5 w-5" />
                  <span>EcoBrowse</span>
              </div>
          </Link>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Website Eco-Efficiency Analyzer</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Enter a website URL to check its estimated eco-efficiency score (higher is better) and browse greener.
        </p>
      </header>

      {/* Input Section - slightly more prominent */}
      <div className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto p-2 bg-card rounded-lg shadow">
        <Input
          type="text"
          placeholder="e.g., example.com"
          value={websiteUrl}
          onChange={(e) => {
              setWebsiteUrl(e.target.value);
              setCurrentUrlToAnalyze(null); // Clear analysis state if URL changes
              setFootprintData(null);
              // No need to set isLoading here, handleAnalyze does it
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          className="flex-grow border-muted focus:border-primary focus:ring-primary" // Adjusted styling
          aria-label="Website URL Input"
           disabled={isLoading} // Disable input while loading
        />
        <Button onClick={handleAnalyze} disabled={isLoading || !websiteUrl} className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
             <Search className="mr-2 h-4 w-4" />
          )}
          Analyze
        </Button>
      </div>

      {/* Results Section */}
      {(isLoading || footprintData) && ( // Show section if loading or data exists
          // Use grid layout with responsiveness: 1 column on small screens, 2 on medium+
          // Added subtle border/background to group results
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-card/50 rounded-lg border border-border/50">
            {/* Score Display - Pass score or -1 for loading */}
            <EcoScoreDisplay score={isLoading ? -1 : (footprintData?.carbonFootprintScore ?? 0)} />

            {/* Footprint Details */}
            <FootprintDetails details={footprintData} isLoading={isLoading} />

          </div>
      )}


      {/* Reports Section */}
       <div className="pt-8">
          {/* Pass key to potentially force re-render, though component manages its own state */}
          <ReportsDashboard key={reportUpdateTrigger} />
       </div>

       {/* Popular Sites Section */}
       <div className="pt-8">
          <PopularSites />
       </div>


        <footer className="text-center text-xs text-muted-foreground pt-6">
            EcoBrowse v0.1.0 - Helping you navigate the web sustainably.
        </footer>

    </main>
  );
}
