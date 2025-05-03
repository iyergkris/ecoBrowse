"use client";

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EcoScoreDisplay } from "@/components/eco-score-display";
import { FootprintDetails } from "@/components/footprint-details";
import { Suggestions } from "@/components/suggestions";
import { ReportsDashboard } from "@/components/reports-dashboard";
import { calculateWebsiteCarbonFootprint } from '@/services/website-carbon-footprint';
import type { WebsiteCarbonFootprint } from '@/services/website-carbon-footprint';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [currentUrlToAnalyze, setCurrentUrlToAnalyze] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [footprintData, setFootprintData] = useState<WebsiteCarbonFootprint | null>(null);
  const [triggerSuggestions, setTriggerSuggestions] = useState<boolean>(false);
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
    setTriggerSuggestions(false); // Ensure suggestions don't trigger prematurely

    try {
      const data = await calculateWebsiteCarbonFootprint(formattedUrl);
      setFootprintData(data);

      // Add data to reports (using local storage via the component)
      // Find a way to trigger this addition within ReportsDashboard or lift state up
      // For now, we'll simulate adding data if it were possible directly
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
          // Force update reports dashboard if needed - this might require lifting state or using a context/event bus
          window.dispatchEvent(new Event('storage')); // Basic way to notify other components listening to storage event
      } catch (storageError) {
          console.error("Failed to save report data:", storageError);
          // Optionally notify user, but avoid disrupting main flow
      }


      setTriggerSuggestions(true); // Now trigger suggestion fetching
       toast({
          title: "Analysis Complete",
          description: `Footprint calculated for ${formattedUrl}`,
        });

    } catch (error) {
      console.error("Error calculating carbon footprint:", error);
       toast({
          title: "Analysis Failed",
          description: `Could not analyze ${formattedUrl}. Please check the URL or try again.`,
          variant: "destructive",
        });
      setCurrentUrlToAnalyze(null); // Reset on error
      setTriggerSuggestions(false);
    } finally {
      // Keep loading true until suggestions are also potentially loaded.
      // Suggestions component will set loading to false via onFetchComplete
    }
  }, [websiteUrl, isLoading, toast]);

 const handleSuggestionsFetchComplete = useCallback(() => {
    setIsLoading(false); // Set loading false only after suggestions are done
    setTriggerSuggestions(false); // Reset trigger
 }, []);


  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center space-y-2">
         <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-leaf h-4 w-4"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
            <span>EcoBrowse</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Website Carbon Footprint Analyzer</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Enter a website URL to check its estimated carbon footprint score and get tips for a greener web experience.
        </p>
      </header>

      {/* Input Section */}
      <div className="flex flex-col sm:flex-row items-center gap-2 max-w-lg mx-auto">
        <Input
          type="text"
          placeholder="e.g., example.com"
          value={websiteUrl}
          onChange={(e) => {
              setWebsiteUrl(e.target.value);
              setCurrentUrlToAnalyze(null); // Clear analysis state if URL changes
              setFootprintData(null);
              setTriggerSuggestions(false);
              setIsLoading(false);
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          className="flex-grow"
          aria-label="Website URL Input"
        />
        <Button onClick={handleAnalyze} disabled={isLoading || !websiteUrl} className="w-full sm:w-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Display */}
            <EcoScoreDisplay score={footprintData?.carbonFootprintScore ?? 0} />

            {/* Footprint Details */}
            <FootprintDetails details={footprintData} />

            {/* Suggestions */}
             <div className="md:col-span-2">
                 <Suggestions
                    websiteUrl={currentUrlToAnalyze}
                    triggerFetch={triggerSuggestions}
                    onFetchComplete={handleSuggestionsFetchComplete}
                  />
             </div>
          </div>
      )}


      {/* Reports Section */}
       <div className="pt-8">
          <ReportsDashboard />
       </div>

    </main>
  );
}
