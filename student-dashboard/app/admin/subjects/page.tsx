"use client"; // <-- Add this directive to make it a Client Component

import Link from "next/link";
import { useState, useEffect } from "react"; // Import hooks
// REMOVE: import { getSubjects } from "@/lib/db"; // Remove old DB import
import { getSubjects as apiGetSubjects, type Subject } from "@/lib/api-service"; // Import from API service
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Search, AlertTriangle } from "lucide-react"; // Added AlertTriangle for errors
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"; // Import useToast for error feedback

// No longer an async function component
export default function SubjectsPage() {
  // State variables for subjects, loading status, and errors
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const { toast } = useToast();

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // Call the API service function
        const data = await apiGetSubjects();
        setSubjects(data);
      } catch (err: any) {
        console.error("Failed to fetch subjects:", err);
        const errorMessage = err.message || "Could not load subjects. Please try again later.";
        setError(errorMessage);
        toast({
          title: "Error Loading Subjects",
          description: errorMessage,
          variant: "destructive",
        });
         // Optionally set subjects to empty array on error
         setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [toast]); // Dependency array includes toast

  // --- Client-side Filtering Logic (Example) ---
  // You can implement filtering based on the searchTerm state here
  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // --- End Filtering Logic ---


  // --- Conditional Rendering ---
  const renderContent = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-2"></div>
              <span className="text-muted-foreground">Loading subjects...</span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
       // Already shown via fetchError block below, but could show inline too
       return (
            <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-red-600">
                     <div className="flex flex-col items-center justify-center">
                         <AlertTriangle className="w-8 h-8 mb-2" />
                         <span>Error loading data.</span>
                     </div>
                </TableCell>
            </TableRow>
       )
    }

    if (filteredSubjects.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-8">
            <span className="text-muted-foreground">No subjects found{searchTerm ? ' matching your search' : ''}.</span>
          </TableCell>
        </TableRow>
      );
    }

    return filteredSubjects.map((subject) => (
      <TableRow key={subject.code}>
        <TableCell className="font-medium">{subject.code}</TableCell>
        <TableCell>{subject.name}</TableCell>
        <TableCell className="hidden md:table-cell">{subject.department}</TableCell>
        <TableCell className="text-right">{subject.credits}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm" asChild>
            {/* Make sure edit link uses code */}
            <Link href={`/admin/subjects/${subject.code}`}>Edit</Link>
          </Button>
        </TableCell>
      </TableRow>
    ));
  };
  // --- End Conditional Rendering ---


  return (
    <div className="space-y-6">
      {/* Header section remains the same */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
          <p className="text-muted-foreground">Manage course subjects and information</p>
        </div>
        <Button asChild>
          <Link href="/admin/subjects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Subject
          </Link>
        </Button>
      </div>

        {/* Display fetch error prominently if it occurs */}
        {error && !loading && (
           <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md flex items-center gap-2">
               <AlertTriangle className="w-5 h-5" />
               <span>{error}</span>
           </div>
        )}

      <Card>
        <CardHeader className="pb-3">
          {/* Card header remains the same */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Subjects</CardTitle>
              <CardDescription>A list of all course subjects in the system</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search subjects..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Update search state
               />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                {/* Table header remains the same */}
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              {/* Use the renderContent function to display table body */}
              <TableBody>{renderContent()}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}