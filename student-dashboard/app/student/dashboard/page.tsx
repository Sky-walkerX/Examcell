"use client"; // Must be the first line - makes this a Client Component

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentProfile } from "@/components/student-profile";
import { StudentSummary } from "@/components/student-summary";
import { RecentResults } from "@/components/recent-results";
import { PerformanceChart } from "@/components/performance-chart";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { AlertCircle } from "lucide-react"; // For error state
import { useToast } from "@/hooks/use-toast";

// Import API functions and types from your service file
import {
  getStudentById,
  getResultsByStudentId,
  type Student,
  type Result,
} from "@/lib/api-service"; // Adjust path if necessary

// Correct: No 'async' keyword on the default export for a Client Component
export default function StudentDashboard() {
  const { data: session, status: sessionStatus } = useSession(); // Get session status and data
  const { toast } = useToast();

  // State for fetched data
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  // State for loading and errors
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);

  // Get student ID from session safely
  const studentId = session?.user?.id;

  // Fetch data when session status changes or studentId becomes available
  useEffect(() => {
    // Check if the session is definitively loaded and authenticated, and we have an ID
    if (sessionStatus === "authenticated" && studentId) {
      const fetchData = async () => {
        setIsLoading(true); // Set loading true when fetch starts
        setError(null); // Clear previous errors
        console.log(`[StudentDashboard] Fetching data for student ID: ${studentId}`);

        try {
          // Fetch student details and results concurrently
          const [studentData, resultsData] = await Promise.all([
            getStudentById(studentId),
            getResultsByStudentId(studentId),
          ]);

          console.log("[StudentDashboard] Fetched Student Data:", studentData);
          console.log("[StudentDashboard] Fetched Results Data:", resultsData);

          setStudent(studentData);
          setResults(resultsData);

        } catch (err: any) {
          console.error("[StudentDashboard] Error fetching data:", err);
          const errorMessage = err.message || "Failed to load dashboard data.";
          setError(errorMessage);
          toast({
             title: "Error Loading Data",
             description: errorMessage,
             variant: "destructive"
          });
          // Clear data on error
          setStudent(null);
          setResults([]);
        } finally {
          setIsLoading(false); // Set loading false when fetch completes or fails
        }
      };

      fetchData(); // Call the async function

    } else if (sessionStatus === "loading") {
      // Session is still loading, show loading state (already set initially)
      setIsLoading(true);
      setError(null); // Clear any previous error
    } else {
      // Not authenticated or no studentId found after session loaded
      setIsLoading(false); // Stop loading
      setError("User not authenticated or student ID could not be determined.");
      console.warn("[StudentDashboard] Fetch skipped: Session status is not 'authenticated' or studentId is missing.", { sessionStatus, studentId });
    }
  }, [sessionStatus, studentId, toast]); // Dependencies for the effect


  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6"> {/* Add some padding */}
        <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1> {/* Add a title */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Skeleton for StudentProfile */}
          <Card className="flex-1">
            <CardHeader><Skeleton className="h-6 w-3/5" /></CardHeader>
            <CardContent className="flex flex-col items-center text-center space-y-3">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          {/* Skeleton for StudentSummary */}
           <Card className="flex-1">
             <CardHeader><Skeleton className="h-6 w-3/5" /></CardHeader>
             <CardContent className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-8 w-1/2" />
             </CardContent>
           </Card>
        </div>
        <Skeleton className="h-10 w-full md:w-1/2" /> {/* TabsList Skeleton */}
        <Card>
            <CardHeader><Skeleton className="h-6 w-2/5" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent> {/* Adjusted height */}
        </Card>
      </div>
    );
  }

  // --- Error State ---
   if (error) {
    return (
       <div className="flex flex-col items-center justify-center h-64 text-destructive p-4 md:p-6">
           <AlertCircle className="w-12 h-12 mb-4" />
           <h2 className="text-xl font-semibold mb-2 text-center">Error Loading Dashboard</h2>
           <p className="text-center">{error}</p>
           {/* Optional: Add a button to attempt reload or go home */}
           {/* <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button> */}
       </div>
    );
  }

  // --- No Student Data State ---
  // This could happen if the user is authenticated but fetching student data fails specifically
   if (!student) {
    return (
       <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-4 md:p-6">
           <AlertCircle className="w-12 h-12 mb-4" />
           <h2 className="text-xl font-semibold mb-2 text-center">Could Not Load Profile</h2>
           <p className="text-center">Student data could not be retrieved.</p>
       </div>
    );
  }

  // --- Render Dashboard with Data ---
  return (
    <div className="space-y-6 p-4 md:p-6"> {/* Add padding */}
     <h1 className="text-3xl font-bold tracking-tight mb-4">Student Dashboard</h1> {/* Add Title */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Pass fetched student data as props */}
        {/* Ensure StudentProfile expects a 'student' prop */}
        <StudentProfile student={student} />
        {/* Ensure StudentSummary expects 'student' and 'results' props */}
        <StudentSummary student={student} results={results} />
      </div>

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="results">Recent Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="gpa">GPA Trend</TabsTrigger>
        </TabsList>
        <TabsContent value="results" className="mt-4">
          {/* Ensure RecentResults expects 'results' prop */}
          <RecentResults results={results} />
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Your performance across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Ensure PerformanceChart expects 'results' prop */}
              <PerformanceChart type="pie" results={results} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gpa" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>GPA Trend</CardTitle>
              <CardDescription>Your GPA progression across semesters</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Ensure PerformanceChart expects 'results' prop */}
              <PerformanceChart type="line" results={results} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}