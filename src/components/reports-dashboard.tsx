"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, BarChart, Trash2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'; // Add Loader2
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define the structure of a single report entry
interface ReportEntry {
  timestamp: number; // Unix timestamp
  websiteUrl: string;
  carbonScore: number; // 0-1 scale (0=worst, 1=best)
}

// Define the structure for aggregated data
interface AggregatedReport {
  period: string; // e.g., 'Week of 2024-07-21', 'July 2024', '2024'
  totalVisits: number;
  averageScore: number; // 0-100 scale (higher is better)
  bestScoreSite: string | null; // URL (Score) - Highest score
  worstScoreSite: string | null; // URL (Score) - Lowest score
}

const STORAGE_KEY = 'ecoBrowseReports';

export function ReportsDashboard() {
  const [reportData, setReportData] = useState<ReportEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'annual'>('weekly');
  const [aggregatedReports, setAggregatedReports] = useState<AggregatedReport[]>([]);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false); // State to track client-side rendering

  // Function to load data from localStorage
  const loadReportData = useCallback(() => {
     if (typeof window === 'undefined') return; // Don't run on server

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const data = storedData ? JSON.parse(storedData) : [];
      // Sort by timestamp descending (newest first) before setting state
      const sortedData = data.sort((a: ReportEntry, b: ReportEntry) => b.timestamp - a.timestamp);
      setReportData(sortedData);
      console.log("ReportsDashboard: Loaded data from localStorage");
    } catch (error) {
      console.error("Failed to load report data:", error);
      toast({
        title: "Error Loading Data",
        description: "Could not load report data.",
        variant: "destructive",
      });
    }
  }, [toast]);

   // Function to handle storage changes and update state
   const handleStorageChange = useCallback((event: StorageEvent) => {
      // Check if the event key matches our storage key
     if (event.key === STORAGE_KEY) {
        console.log("ReportsDashboard: Storage change detected, reloading data.");
        loadReportData(); // Reload data on change
     }
   }, [loadReportData]);


  // Load data on mount and listen for changes
   useEffect(() => {
    setIsClient(true); // Set client state to true once mounted
    loadReportData(); // Initial load

    // Add listener for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
   }, [loadReportData, handleStorageChange]);


  const aggregateData = useCallback((data: ReportEntry[], selectedTimeframe: 'weekly' | 'monthly' | 'annual'): AggregatedReport[] => {
    const aggregated: { [key: string]: { entries: ReportEntry[], totalScore: number } } = {};

    const getPeriodKey = (timestamp: number): string => {
      const date = new Date(timestamp);
      if (selectedTimeframe === 'weekly') {
        const dayOfWeek = date.getDay(); // 0 (Sun) - 6 (Sat)
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        return `Week of ${startOfWeek.toISOString().split('T')[0]}`;
      } else if (selectedTimeframe === 'monthly') {
        return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      } else { // annual
        return `${date.getFullYear()}`;
      }
    };

    data.forEach(entry => {
       // Ensure score is a number before processing
       if (typeof entry.carbonScore === 'number' && !isNaN(entry.carbonScore)) {
            const key = getPeriodKey(entry.timestamp);
            if (!aggregated[key]) {
                aggregated[key] = { entries: [], totalScore: 0 };
            }
            aggregated[key].entries.push(entry);
            aggregated[key].totalScore += entry.carbonScore; // Sum the 0-1 scores
       } else {
           console.warn("Skipping invalid report entry:", entry);
       }
    });

    return Object.entries(aggregated).map(([period, { entries, totalScore }]) => {
      const totalVisits = entries.length;
       // Calculate average score (0-1 scale), then multiply by 100 for display
      const averageScore = totalVisits > 0 ? (totalScore / totalVisits) * 100 : 0;

       // Find best (highest score) and worst (lowest score) sites
       let bestScore = -1; // Start below min possible score (0)
       let worstScore = 2; // Start above max possible score (1)
       let bestScoreSite: string | null = null;
       let worstScoreSite: string | null = null;

        entries.forEach(e => {
            // Find best (highest score)
            if(e.carbonScore > bestScore) {
                bestScore = e.carbonScore;
                bestScoreSite = e.websiteUrl;
            }
            // Find worst (lowest score)
             if(e.carbonScore < worstScore) {
                worstScore = e.carbonScore;
                worstScoreSite = e.websiteUrl;
            }
        });

      return {
        period,
        totalVisits,
        averageScore,
        // Format scores to 0-100 scale for display
        bestScoreSite: bestScoreSite ? `${bestScoreSite} (${(bestScore * 100).toFixed(0)})` : 'N/A',
        worstScoreSite: worstScoreSite ? `${worstScoreSite} (${(worstScore * 100).toFixed(0)})` : 'N/A' ,
      };
    }).sort((a, b) => {
      // Attempt to sort by date, newest first
      try {
         let dateA: Date, dateB: Date;
         if(a.period.startsWith('Week of')) {
             dateA = new Date(a.period.replace('Week of ', ''));
             dateB = new Date(b.period.replace('Week of ', ''));
         } else if (a.period.includes(' ')) { // Monthly format 'Month Year'
             dateA = new Date(a.period);
             dateB = new Date(b.period);
         } else { // Annual format 'Year'
             dateA = new Date(parseInt(a.period), 0, 1); // Jan 1st of the year
             dateB = new Date(parseInt(b.period), 0, 1);
         }

         if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
             return dateB.getTime() - dateA.getTime(); // Newest first
         }
      } catch (e) {
          console.warn("Could not parse dates for sorting:", a.period, b.period, e);
      }
      // Fallback sort by period string if date parsing fails
      return b.period.localeCompare(a.period);
    });
  }, []);


   // Update aggregated reports when data or timeframe changes
  useEffect(() => {
    setAggregatedReports(aggregateData(reportData, timeframe));
  }, [reportData, timeframe, aggregateData]);

  const downloadPdfReport = () => {
     if (aggregatedReports.length === 0) {
      toast({ title: "No Data", description: "Cannot download an empty report.", variant:"destructive" });
      return;
    }

    const doc = new jsPDF();
    const tableColumns = ["Period", "Total Visits", "Avg. Score", "Best Site (Score)", "Worst Site (Score)"];
    const tableRows = aggregatedReports.map(report => [
        report.period,
        report.totalVisits.toString(),
        report.averageScore.toFixed(0), // Show avg score 0-100
        report.bestScoreSite || 'N/A',
        report.worstScoreSite || 'N/A'
    ]);

    // Add Title
    doc.setFontSize(18);
    doc.text("EcoBrowse Eco-Efficiency Report", 14, 22);

    // Add Subtitle (Timeframe and Generation Date)
    doc.setFontSize(11);
    doc.setTextColor(100); // Gray color
    doc.text(`Timeframe: ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);


    // Add Table using autoTable
    autoTable(doc, {
        startY: 45, // Y position to start the table
        head: [tableColumns],
        body: tableRows,
        theme: 'striped', // 'striped', 'grid', 'plain'
        headStyles: { fillColor: [77, 175, 100] }, // Updated primary color HSL(150, 60%, 40%) approx RGB
        styles: { fontSize: 8 },
        columnStyles: {
           0: { cellWidth: 35 }, // Period
           1: { cellWidth: 20, halign: 'center' }, // Total Visits
           2: { cellWidth: 20, halign: 'center' }, // Avg. Score
           3: { cellWidth: 'auto' }, // Best Score Site
           4: { cellWidth: 'auto' }, // Worst Score Site
        },
        didParseCell: function (data) {
            // Wrap text for long site names
            if (data.column.index === 3 || data.column.index === 4) {
                // No explicit wrapping needed, autoTable handles basic width
            }
        }
    });

    // Add Footer Note
    const finalY = (doc as any).lastAutoTable.finalY || 45; // Get Y position after table
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Note: Scores range from 0 (worst) to 100 (best). Higher scores indicate better eco-efficiency.", 14, finalY + 10);

    // Save the PDF
    doc.save(`EcoBrowse_Report_${timeframe}_${new Date().toISOString().split('T')[0]}.pdf`);

     toast({ title: "Report Downloaded", description: `Your ${timeframe} report has been generated as PDF.` });
  };

   const clearAllData = () => {
        // Optimistically update UI
        const oldReportData = reportData;
        setReportData([]);
        setAggregatedReports([]);

        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log("Cleared data from localStorage");
            // Dispatch storage event manually to notify other components (like page.tsx)
            window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: null, storageArea: localStorage }));
            toast({ title: "Data Cleared", description: "All historical report data has been removed." });
        } catch (error) {
             // Revert UI changes on error
             setReportData(oldReportData);
             setAggregatedReports(aggregateData(oldReportData, timeframe));
            console.error("Failed to clear storage:", error);
            toast({
                title: "Error Clearing Data",
                description: "Could not remove report data from storage.",
                variant: "destructive",
            });
        }
    };

    // Prevent rendering server-side or before client check
    if (!isClient) {
        // Render a simple loading skeleton or placeholder
         return (
             <Card className="w-full">
                 <CardHeader>
                     <CardTitle>Statistical Reports</CardTitle>
                     <CardDescription>Loading report data...</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <div className="h-40 flex items-center justify-center text-muted-foreground">
                         <Loader2 className="h-8 w-8 animate-spin" />
                     </div>
                 </CardContent>
                 <CardFooter className="flex justify-end">
                    <Button variant="destructive" size="sm" disabled>
                         <Trash2 className="mr-2 h-4 w-4" />
                         Clear All Data
                     </Button>
                 </CardFooter>
             </Card>
         );
    }


  return (
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
         <div>
            <CardTitle>Statistical Reports</CardTitle>
             {/* Update description to reflect higher = better */}
            <CardDescription>Your browsing eco-efficiency overview.</CardDescription>
         </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
          <Select value={timeframe} onValueChange={(value: 'weekly' | 'monthly' | 'annual') => setTimeframe(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadPdfReport} variant="outline" size="sm" disabled={aggregatedReports.length === 0}>
            <FileText className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {aggregatedReports.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-center">Visits</TableHead>
                    <TableHead className="text-center">Avg. Score</TableHead>
                    {/* Update headers */}
                    <TableHead>
                        <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600"/> Best Site
                        </div>
                    </TableHead>
                    <TableHead>
                        <div className="flex items-center gap-1">
                            <TrendingDown className="h-4 w-4 text-destructive"/> Worst Site
                        </div>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {aggregatedReports.map((report) => (
                    <TableRow key={report.period}>
                    <TableCell className="font-medium whitespace-nowrap">{report.period}</TableCell>
                    <TableCell className="text-center">{report.totalVisits}</TableCell>
                    {/* Display average score 0-100 */}
                    <TableCell className="text-center font-semibold">{report.averageScore.toFixed(0)}</TableCell>
                    {/* Update cells for best/worst sites */}
                    <TableCell className="text-xs truncate max-w-[150px] sm:max-w-[200px] whitespace-nowrap" title={report.bestScoreSite || 'N/A'}>
                         {report.bestScoreSite || 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs truncate max-w-[150px] sm:max-w-[200px] whitespace-nowrap" title={report.worstScoreSite || 'N/A'}>
                         {report.worstScoreSite || 'N/A'}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
           </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <BarChart className="mx-auto h-12 w-12 mb-2" />
            <p>No report data available for the selected timeframe.</p>
            <p className="text-xs">Analyze websites to generate reports.</p>
          </div>
        )}
      </CardContent>
       <CardFooter className="flex justify-end pt-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                     {/* Disable clear button if no data exists */}
                    <Button variant="destructive" size="sm" disabled={reportData.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All Data
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all
                            your browsing report history stored locally.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearAllData}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
    </Card>
  );
}
