"use client"; // Needs to be a client component for state and effects

import { useEffect, useState, useMemo } from "react"; // Import useMemo
import Link from "next/link";
// Import functions and types from api-service
import {
  getResultsBySemester,
  getStudents, // <-- Import getStudents
  type Result,
  type Student // <-- Import Student type
} from "@/lib/api-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function ResultsPage() {
  // State for results, students, loading, error, filters
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]); // <-- State for students
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("Fall 2023"); // Default or fetch available semesters
  const { toast } = useToast();

  // --- Fetch both results and students ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch both concurrently
        const [resultsData, studentsData] = await Promise.all([
          getResultsBySemester(selectedSemester), // Fetch results for the semester
          getStudents() // Fetch all students
        ]);
        setResults(resultsData);
        setStudents(studentsData); // Store student data
      } catch (err: any) {
        console.error("Failed to fetch results or students:", err);
        const errorMessage = err.message || "Could not load data. Please try again later.";
        setError(errorMessage);
        toast({
          title: "Error Loading Data",
          description: errorMessage,
          variant: "destructive",
        });
        setResults([]);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedSemester, toast]); // Re-fetch when semester changes

  // --- Create the student name map ---
  // useMemo avoids recalculating the map on every render unless students state changes
  const studentNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    students.forEach(student => {
      map[student.id] = student.name;
    });
    return map;
  }, [students]); // Dependency is the students array

  // Filter results based on search term AND the mapped student name
  const filteredResults = results.filter(
    (result) => {
        const studentName = studentNameMap[result.studentId] || ''; // Get name from map
        return (
            result.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            studentName.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by name
            result.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
  );

   // --- Conditional Rendering Logic ---
   const renderContent = () => {
     if (loading) {
         // ... loading indicator JSX ...
         return (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-2"></div>
                  <span className="text-muted-foreground">Loading results...</span>
                </div>
              </TableCell>
            </TableRow>
         )
     }
     if (error) {
        // ... error display JSX ...
        return (
             <TableRow>
                 <TableCell colSpan={8} className="text-center py-8 text-red-600">
                      <div className="flex flex-col items-center justify-center">
                          <AlertTriangle className="w-8 h-8 mb-2" />
                          <span>Error loading data.</span>
                      </div>
                 </TableCell>
             </TableRow>
        )
     }
     if (filteredResults.length === 0) {
         // ... no results JSX ...
         return (
             <TableRow>
               <TableCell colSpan={8} className="text-center py-8">
                 <span className="text-muted-foreground">No results found{searchTerm ? ' matching your search' : ''}.</span>
               </TableCell>
             </TableRow>
         )
     }

     // Map over filtered results
     return filteredResults.map((result) => (
        <TableRow key={result.id}>
          <TableCell className="font-medium">
            <Link href={`/admin/students/${result.studentId}`} className="hover:underline text-purple-600">
              {result.studentId}
            </Link>
          </TableCell>
          {/* Use the dynamic map here */}
          <TableCell>{studentNameMap[result.studentId] || "Unknown Student"}</TableCell>
          <TableCell>{result.subjectName}</TableCell>
          <TableCell>{result.subjectCode}</TableCell>
          <TableCell className="text-right">{result.marks}</TableCell>
          <TableCell className="text-right font-semibold">{result.grade}</TableCell>
          <TableCell className="text-right">
            <Badge
              variant="outline"
              className={
                result.status === "Pass"
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }
            >
              {result.status}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="sm" asChild>
              {/* Assuming edit link uses result ID */}
              <Link href={`/admin/results/${result.id}/edit`}>Edit</Link>
            </Button>
          </TableCell>
        </TableRow>
     ));
   }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Results</h2>
          <p className="text-muted-foreground">Manage student results and grades</p>
        </div>
        <Button asChild>
          <Link href="/admin/results/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Result
          </Link>
        </Button>
      </div>

       {/* Error display */}
       {error && !loading && (
           <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md flex items-center gap-2">
               <AlertTriangle className="w-5 h-5" />
               <span>{error}</span>
           </div>
        )}

      <Card>
        {/* Card Header with filters */}
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Results</CardTitle>
              <CardDescription>View and manage student results</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select defaultValue={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Populate semesters dynamically if possible */}
                  <SelectItem value="Fall 2023">Fall 2023</SelectItem>
                  <SelectItem value="Spring 2023">Spring 2023</SelectItem>
                  <SelectItem value="Fall 2022">Fall 2022</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search results..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Marks</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderContent()}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}