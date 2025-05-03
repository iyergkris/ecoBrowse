"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, BarChart, Trash2 } from 'lucide-react'; // Changed icon from Download to FileText
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define the structure of a single report entry
interface ReportEntry {
  timestamp: number; // Unix timestamp
  websiteUrl: string;
  carbonScore: number; // 0-1 scale
}

// Define the structure for aggregated data
interface AggregatedReport {
  period: string; // e.g., 'Week of 2024-07-21', 'July 2024', '2024'
  totalVisits: number;
  averageScore: number; // 0-100 scale
  highestScoreSite: string | null; // URL (Score)
  lowestScoreSite: string | null; // URL (Score)
}

const LOCAL_STORAGE_KEY = 'ecoBrowseReports';

export function ReportsDashboard() {
  const [reportData, setReportData] = useState<ReportEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'annual'>('weekly');
  const [aggregatedReports, setAggregatedReports] = useState<AggregatedReport[]>([]);
  const { toast } = useToast();

  // Function to handle storage changes and update state
   const handleStorageChange = useCallback(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Sort raw data by timestamp, newest first before setting state
        const sortedData = parsedData.sort((a: ReportEntry, b: ReportEntry) => b.timestamp - a.timestamp);
        setReportData(sortedData);
        console.log("ReportsDashboard: Storage change detected, data reloaded and sorted.");
      } else {
         setReportData([]); // Clear data if storage is empty
         console.log("ReportsDashboard: Storage change detected, data cleared.");
      }
    } catch (error) {
      console.error("Failed to load report data from local storage on change:", error);
      toast({
        title: "Error Loading Data",
        description: "Could not load updated report data.",
        variant: "destructive",
      });
    }
   }, [toast]);


  // Load data from local storage on mount and listen for changes
  useEffect(() => {
    handleStorageChange(); // Initial load

    // Add listener for storage events from other tabs/windows or background script
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]); // Depend on the memoized handler


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
      const key = getPeriodKey(entry.timestamp);
      if (!aggregated[key]) {
        aggregated[key] = { entries: [], totalScore: 0 };
      }
      aggregated[key].entries.push(entry);
      aggregated[key].totalScore += entry.carbonScore;
    });

    return Object.entries(aggregated).map(([period, { entries, totalScore }]) => {
      const totalVisits = entries.length;
      const averageScore = totalVisits > 0 ? (totalScore / totalVisits) * 100 : 0; // Scale to 0-100

       let highestScore = -1;
       let lowestScore = 2; // Start above max possible score (1)
       let highestScoreSite: string | null = null;
       let lowestScoreSite: string | null = null;

        entries.forEach(e => {
            if(e.carbonScore > highestScore) {
                highestScore = e.carbonScore;
                highestScoreSite = e.websiteUrl;
            }
             if(e.carbonScore < lowestScore) {
                lowestScore = e.carbonScore;
                lowestScoreSite = e.websiteUrl;
            }
        });

      return {
        period,
        totalVisits,
        averageScore,
        highestScoreSite: highestScoreSite ? `${highestScoreSite} (${(highestScore*100).toFixed(1)})` : 'N/A',
        lowestScoreSite: lowestScoreSite ? `${lowestScoreSite} (${(lowestScore*100).toFixed(1)})` : 'N/A' ,
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
             return dateB.getTime() - dateA.getTime();
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
    const tableColumns = ["Period", "Total Visits", "Avg. Score", "Highest Score Site (Score)", "Lowest Score Site (Score)"];
    const tableRows = aggregatedReports.map(report => [
        report.period,
        report.totalVisits.toString(),
        report.averageScore.toFixed(1),
        report.highestScoreSite || 'N/A',
        report.lowestScoreSite || 'N/A'
    ]);

    // Add Title
    doc.setFontSize(18);
    doc.text("EcoBrowse Carbon Footprint Report", 14, 22);

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
        headStyles: { fillColor: [0, 150, 136] }, // Teal header color matching theme
        styles: { fontSize: 8 },
        columnStyles: {
           0: { cellWidth: 35 }, // Period
           1: { cellWidth: 20, halign: 'center' }, // Total Visits
           2: { cellWidth: 20, halign: 'center' }, // Avg. Score
           3: { cellWidth: 'auto' }, // Highest Score Site
           4: { cellWidth: 'auto' }, // Lowest Score Site
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
    doc.text("Note: Scores range from 0 (best) to 100 (worst). Average score reflects the mean carbon efficiency.", 14, finalY + 10);

    // Save the PDF
    doc.save(`EcoBrowse_Report_${timeframe}_${new Date().toISOString().split('T')[0]}.pdf`);

     toast({ title: "Report Downloaded", description: `Your ${timeframe} report has been generated as PDF.` });
  };

   const clearAllData = () => {
        setReportData([]);
        setAggregatedReports([]);
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            // Dispatch storage event manually to notify other components (like page.tsx)
            window.dispatchEvent(new StorageEvent('storage', { key: LOCAL_STORAGE_KEY, newValue: null }));
            toast({ title: "Data Cleared", description: "All historical report data has been removed." });
        } catch (error) {
            console.error("Failed to clear local storage:", error);
            toast({
                title: "Error Clearing Data",
                description: "Could not remove report data from storage.",
                variant: "destructive",
            });
        }
    };


  return (
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
         <div>
            <CardTitle>Statistical Reports</CardTitle>
            <CardDescription>Your browsing energy consumption overview.</CardDescription>
         </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-center">Total Visits</TableHead>
                <TableHead className="text-center">Avg. Score</TableHead>
                <TableHead>Highest Score Site</TableHead>
                 <TableHead>Lowest Score Site</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aggregatedReports.map((report) => (
                <TableRow key={report.period}>
                  <TableCell className="font-medium">{report.period}</TableCell>
                  <TableCell className="text-center">{report.totalVisits}</TableCell>
                  <TableCell className="text-center">{report.averageScore.toFixed(1)}</TableCell>
                   <TableCell className="text-xs truncate max-w-[150px] sm:max-w-[200px]" title={report.highestScoreSite || 'N/A'}>{report.highestScoreSite}</TableCell>
                   <TableCell className="text-xs truncate max-w-[150px] sm:max-w-[200px]" title={report.lowestScoreSite || 'N/A'}>{report.lowestScoreSite}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <BarChart className="mx-auto h-12 w-12 mb-2" />
            <p>No report data available for the selected timeframe.</p>
            <p className="text-xs">Analyze websites to generate reports.</p>
          </div>
        )}
      </CardContent>
       <CardFooter className="flex justify-end">
            <AlertDialog>
                <AlertDialogTrigger asChild>
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
