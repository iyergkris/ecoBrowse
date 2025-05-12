
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, BarChart, Trash2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
// Import types directly for type safety if needed, actual import will be dynamic
// import type jsPDF from 'jspdf'; 
// import type autoTable from 'jspdf-autotable';

// Define the structure of a single report entry
interface ReportEntry {
  timestamp: number; // Unix timestamp
  websiteUrl: string;
  carbonScore: number; // 0-1 scale (0=worst, 1=best -> higher is better)
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
  const [isClient, setIsClient] = useState(false); 

  const loadReportData = useCallback(() => {
     if (typeof window === 'undefined') return; 

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const data = storedData ? JSON.parse(storedData) : [];
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

   const handleStorageChange = useCallback((event: StorageEvent) => {
     if (event.key === STORAGE_KEY) {
        console.log("ReportsDashboard: Storage change detected, reloading data.");
        loadReportData(); 
     }
   }, [loadReportData]);


   useEffect(() => {
    setIsClient(true); 
    loadReportData(); 

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
   }, [loadReportData, handleStorageChange]);


  const aggregateData = useCallback((data: ReportEntry[], selectedTimeframe: 'weekly' | 'monthly' | 'annual'): AggregatedReport[] => {
    const aggregated: { [key: string]: { entries: ReportEntry[], totalScore: number } } = {};

    const getPeriodKey = (timestamp: number): string => {
      const date = new Date(timestamp);
      if (selectedTimeframe === 'weekly') {
        const dayOfWeek = date.getDay(); 
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        return `Week of ${startOfWeek.toISOString().split('T')[0]}`;
      } else if (selectedTimeframe === 'monthly') {
        return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      } else { 
        return `${date.getFullYear()}`;
      }
    };

    data.forEach(entry => {
       if (typeof entry.carbonScore === 'number' && !isNaN(entry.carbonScore)) {
            const key = getPeriodKey(entry.timestamp);
            if (!aggregated[key]) {
                aggregated[key] = { entries: [], totalScore: 0 };
            }
            aggregated[key].entries.push(entry);
            aggregated[key].totalScore += entry.carbonScore; 
       } else {
           console.warn("Skipping invalid report entry:", entry);
       }
    });

    return Object.entries(aggregated).map(([period, { entries, totalScore }]) => {
      const totalVisits = entries.length;
      const averageScore = totalVisits > 0 ? (totalScore / totalVisits) * 100 : 0;

       let bestScore = -1; 
       let worstScore = 2; 
       let bestScoreSite: string | null = null;
       let worstScoreSite: string | null = null;

        entries.forEach(e => {
            if(e.carbonScore > bestScore) {
                bestScore = e.carbonScore;
                bestScoreSite = e.websiteUrl;
            }
             if(e.carbonScore < worstScore) {
                worstScore = e.carbonScore;
                worstScoreSite = e.websiteUrl;
            }
        });

      return {
        period,
        totalVisits,
        averageScore,
        bestScoreSite: bestScoreSite ? `${bestScoreSite} (${(bestScore * 100).toFixed(0)})` : 'N/A',
        worstScoreSite: worstScoreSite ? `${worstScoreSite} (${(worstScore * 100).toFixed(0)})` : 'N/A' ,
      };
    }).sort((a, b) => {
      try {
         let dateA: Date, dateB: Date;
         if(a.period.startsWith('Week of')) {
             dateA = new Date(a.period.replace('Week of ', ''));
             dateB = new Date(b.period.replace('Week of ', ''));
         } else if (a.period.includes(' ')) { 
             dateA = new Date(a.period);
             dateB = new Date(b.period);
         } else { 
             dateA = new Date(parseInt(a.period), 0, 1); 
             dateB = new Date(parseInt(b.period), 0, 1);
         }

         if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
             return dateB.getTime() - dateA.getTime(); 
         }
      } catch (e) {
          console.warn("Could not parse dates for sorting:", a.period, b.period, e);
      }
      return b.period.localeCompare(a.period);
    });
  }, []);


  useEffect(() => {
    setAggregatedReports(aggregateData(reportData, timeframe));
  }, [reportData, timeframe, aggregateData]);

  const downloadPdfReport = async () => {
     if (aggregatedReports.length === 0) {
      toast({ title: "No Data", description: "Cannot download an empty report.", variant:"destructive" });
      return;
    }

    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const tableColumns = ["Period", "Total Visits", "Avg. Score", "Best Site (Score)", "Worst Site (Score)"];
      const tableRows = aggregatedReports.map(report => [
          report.period,
          report.totalVisits.toString(),
          report.averageScore.toFixed(0), 
          report.bestScoreSite || 'N/A',
          report.worstScoreSite || 'N/A'
      ]);

      doc.setFontSize(18);
      doc.text("EcoBrowse Eco-Efficiency Report", 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100); 
      doc.text(`Timeframe: ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);

      autoTable(doc, {
          startY: 45, 
          head: [tableColumns],
          body: tableRows,
          theme: 'striped', 
          headStyles: { fillColor: [77, 175, 100] }, 
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 35 }, 
            1: { cellWidth: 20, halign: 'center' }, 
            2: { cellWidth: 20, halign: 'center' }, 
            3: { cellWidth: 'auto' }, 
            4: { cellWidth: 'auto' }, 
          },
          didParseCell: function (data: any) { // Use any for data if specific type is complex
              // Example: if (data.column.index === 3 || data.column.index === 4) { }
          }
      });

      const finalY = (doc as any).lastAutoTable.finalY || 45; 
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("Note: Scores range from 0 (worst) to 100 (best). Higher scores indicate better eco-efficiency.", 14, finalY + 10);

      doc.save(`EcoBrowse_Report_${timeframe}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({ title: "Report Downloaded", description: `Your ${timeframe} report has been generated as PDF.` });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not generate the PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

   const clearAllData = () => {
        const oldReportData = reportData;
        setReportData([]);
        setAggregatedReports([]);

        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log("Cleared data from localStorage");
            window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: null, storageArea: localStorage }));
            toast({ title: "Data Cleared", description: "All historical report data has been removed." });
        } catch (error) {
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

    if (!isClient) {
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
                    <TableCell className="text-center font-semibold">{report.averageScore.toFixed(0)}</TableCell>
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

