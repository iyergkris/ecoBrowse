"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EcoScoreDisplay } from "@/components/eco-score-display";
import { FootprintDetails } from "@/components/footprint-details";
import { ReportsDashboard } from "@/components/reports-dashboard";
import { calculateWebsiteCarbonFootprint } from '@/services/website-carbon-footprint';
import type { WebsiteCarbonFootprint } from '@/services/website-carbon-footprint';
import { Loader2, Search, Leaf } from 'lucide-react'; // Import Leaf
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [currentUrlToAnalyze, setCurrentUrlToAnalyze] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [footprintData, setFootprintData] = useState<WebsiteCarbonFootprint | null>(null);
  // Add state to force re-render of ReportsDashboard if needed, although listening to storage event might be better
  const [reportUpdateTrigger, setReportUpdateTrigger] = useState<number>(0);
  const { toast } = useToast();

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

      // Add data to reports (using local storage)
      try {
          const storedData = localStorage.getItem('ecoBrowseReports');
          const reports = storedData ? JSON.parse(storedData) : [];
          const newEntry = {
              timestamp: Date.now(),
              websiteUrl: formattedUrl,
              carbonScore: data.carbonFootprintScore, // Assuming this is the 0-1 score
          };
          reports.push(newEntry);
          localStorage.setItem('ecoBrowseReports', JSON.stringify(reports));
          // Dispatch a storage event to notify other components (like ReportsDashboard)
          window.dispatchEvent(new StorageEvent('storage', { key: 'ecoBrowseReports', newValue: JSON.stringify(reports) }));
           // Alternatively, or additionally, trigger state update if direct notification is preferred
           setReportUpdateTrigger(Date.now()); // Update trigger state

      } catch (storageError) {
          console.error("Failed to save report data:", storageError);
          // Optionally notify user, but avoid disrupting main flow
      }

       toast({
          title: "Analysis Complete",
          description: `Footprint calculated for ${formattedUrl}`,
        });

    } catch (error) {
      console.error("Error calculating carbon footprint:", error);
       toast({
          title: "Analysis Failed",
          description: `Could not analyze ${formattedUrl}. The site might be unreachable or the URL incorrect. Please check and try again.`,
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
            if (event.key === 'ecoBrowseReports' && event.newValue === null) {
                 console.log("Home: Detected report data cleared, triggering UI update.");
                // Force a state update to potentially re-render dependent components if necessary
                // Often, the child component (ReportsDashboard) listening to storage is sufficient
                setReportUpdateTrigger(Date.now());
            }
        };

        window.addEventListener('storage', handleStorageClear);
        return () => {
            window.removeEventListener('storage', handleStorageClear);
        };
    }, []);


  return (
    // Apply max-width for larger screens, mx-auto for centering
    // Add subtle background texture/gradient if desired
    <main className="container mx-auto max-w-7xl p-4 md:p-8 space-y-8 bg-gradient-to-br from-background to-secondary/30 min-h-screen">
      <header className="text-center space-y-3">
         {/* Enhanced Header Styling */}
         <div className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-lg font-semibold shadow-md">
             {/* Use Leaf Icon directly */}
             <Leaf className="h-5 w-5" />
            <span>EcoBrowse</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Website Carbon Footprint Analyzer</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Enter a website URL to check its estimated carbon footprint score and browse greener.
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
              setIsLoading(false);
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          className="flex-grow border-muted focus:border-primary focus:ring-primary" // Adjusted styling
          aria-label="Website URL Input"
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
      {(isLoading || footprintData || currentUrlToAnalyze) && (
          // Use grid layout with responsiveness: 1 column on small screens, 2 on medium+
          // Added subtle border/background to group results
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-card/50 rounded-lg border border-border/50">
            {/* Score Display */}
            <EcoScoreDisplay score={footprintData?.carbonFootprintScore ?? (isLoading ? -1 : 0)} />

            {/* Footprint Details */}
            <FootprintDetails details={footprintData} isLoading={isLoading} />

          </div>
      )}


      {/* Reports Section */}
       <div className="pt-8">
          {/* Pass key to force re-render when needed, although storage listener in component is preferred */}
          <ReportsDashboard key={reportUpdateTrigger} />
       </div>

        <footer className="text-center text-xs text-muted-foreground pt-6">
            EcoBrowse v0.1.0 - Helping you navigate the web sustainably.
        </footer>

    </main>
  );
}
