"use client"; // Make it a Client Component

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentResults } from "@/components/recent-results"; // Assuming this component exists
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { AlertCircle } from "lucide-react"; // For error state
import { useToast } from "@/hooks/use-toast";
import { getResultsBySemester, type Result } from "@/lib/api-service"; // Import API function and type

// Define the semesters available (can be fetched dynamically later)
const AVAILABLE_SEMESTERS = ["Fall 2023", "Spring 2023", "Fall 2022"];

export default function ResultsPage() {
  const [selectedSemester, setSelectedSemester] = useState<string>(AVAILABLE_SEMESTERS[0]); // Default to the first semester
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch results when the selected semester changes
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`[ResultsPage] Fetching results for semester: ${selectedSemester}`);

      try {
        const data = await getResultsBySemester(selectedSemester);
        console.log(`[ResultsPage] Fetched ${data.length} results for ${selectedSemester}`);
        setResults(data);
      } catch (err: any) {
        console.error(`[ResultsPage] Error fetching results for ${selectedSemester}:`, err);
        const errorMessage = err.message || "Failed to load results for this semester.";
        setError(errorMessage);
        toast({
          title: `Error Loading Results`,
          description: errorMessage,
          variant: "destructive",
        });
        setResults([]); // Clear results on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [selectedSemester, toast]); // Re-run effect when selectedSemester changes


  // --- Render Content based on state ---
  const renderResultsContent = () => {
    if (isLoading) {
      return (
         <div className="space-y-4 mt-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-40 w-full" />
         </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-destructive mt-4 border rounded-md p-4">
           <AlertCircle className="w-8 h-8 mb-2" />
           <h3 className="font-semibold">Could not load results</h3>
           <p className="text-sm">{error}</p>
        </div>
      );
    }

    // Pass the fetched results to the RecentResults component
    // RecentResults should be updated to handle displaying these results or a "no results" message.
    return <RecentResults results={results} />;
  };

  return (
    <div className="space-y-6 p-4 md:p-6"> {/* Add padding */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Academic Results</h2>
        {/* Maybe Add Result button could go here if needed */}
      </div>

      {/* Tabs component now controls the selectedSemester state */}
      <Tabs
          value={selectedSemester} // Controlled component
          onValueChange={setSelectedSemester} // Update state when tab changes
          className="w-full"
       >
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          {/* Map over available semesters to create triggers */}
          {AVAILABLE_SEMESTERS.map((semester) => (
            <TabsTrigger key={semester} value={semester}>
              {semester}
            </TabsTrigger>
          ))}
        </TabsList>

         {/* We only need one TabsContent area that shows the dynamic content */}
         {/* The content inside will change based on the fetched data */}
         {/* Using TabsContent just to associate content with the Tabs structure, but rendering logic is outside */}
         <TabsContent value={selectedSemester} className="mt-4">
             {renderResultsContent()}
         </TabsContent>

         {/* Alternatively, place renderResultsContent directly below TabsList if preferred */}
         {/* {renderResultsContent()} */}

      </Tabs>
    </div>
  );
}