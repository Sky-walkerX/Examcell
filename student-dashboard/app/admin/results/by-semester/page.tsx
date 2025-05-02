"use client"; // Keep as client component

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Printer, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getSemesterReportHtml } from "@/lib/api-service";

export default function ResultsBySemesterPage() {
  const [selectedSemester, setSelectedSemester] = useState("Fall 2023");
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock data
  const semesters = ["Fall 2023", "Spring 2023", "Fall 2022", "Spring 2022"];
  const semesterStats = {
    "Fall 2023": {
      totalStudents: 245,
      passRate: 92,
      averageGPA: 3.42,
      gradeDistribution: [
        { name: "A+", value: 28 },
        { name: "A", value: 45 },
        { name: "B+", value: 62 },
        { name: "B", value: 58 },
        { name: "C+", value: 32 },
        { name: "C", value: 12 },
        { name: "D", value: 5 },
        { name: "F", value: 3 },
      ],
      departmentPerformance: [
        { name: "Computer Science", avgGPA: 3.65 },
        { name: "Electrical Engineering", avgGPA: 3.42 },
        { name: "Mechanical Engineering", avgGPA: 3.21 },
        { name: "Civil Engineering", avgGPA: 3.38 },
        { name: "Business Administration", avgGPA: 3.55 },
      ],
    },
    "Spring 2023": {
      totalStudents: 232,
      passRate: 89,
      averageGPA: 3.35,
      gradeDistribution: [
        { name: "A+", value: 22 },
        { name: "A", value: 40 },
        { name: "B+", value: 58 },
        { name: "B", value: 62 },
        { name: "C+", value: 30 },
        { name: "C", value: 14 },
        { name: "D", value: 4 },
        { name: "F", value: 2 },
      ],
      departmentPerformance: [
        { name: "Computer Science", avgGPA: 3.58 },
        { name: "Electrical Engineering", avgGPA: 3.36 },
        { name: "Mechanical Engineering", avgGPA: 3.18 },
        { name: "Civil Engineering", avgGPA: 3.32 },
        { name: "Business Administration", avgGPA: 3.48 },
      ],
    },
    "Fall 2022": {
      totalStudents: 228,
      passRate: 91,
      averageGPA: 3.38,
      gradeDistribution: [
        { name: "A+", value: 25 },
        { name: "A", value: 42 },
        { name: "B+", value: 60 },
        { name: "B", value: 55 },
        { name: "C+", value: 28 },
        { name: "C", value: 12 },
        { name: "D", value: 4 },
        { name: "F", value: 2 },
      ],
      departmentPerformance: [
        { name: "Computer Science", avgGPA: 3.62 },
        { name: "Electrical Engineering", avgGPA: 3.4 },
        { name: "Mechanical Engineering", avgGPA: 3.2 },
        { name: "Civil Engineering", avgGPA: 3.35 },
        { name: "Business Administration", avgGPA: 3.52 },
      ],
    },
    "Spring 2022": {
      totalStudents: 220,
      passRate: 88,
      averageGPA: 3.32,
      gradeDistribution: [
        { name: "A+", value: 20 },
        { name: "A", value: 38 },
        { name: "B+", value: 56 },
        { name: "B", value: 60 },
        { name: "C+", value: 28 },
        { name: "C", value: 12 },
        { name: "D", value: 4 },
        { name: "F", value: 2 },
      ],
      departmentPerformance: [
        { name: "Computer Science", avgGPA: 3.55 },
        { name: "Electrical Engineering", avgGPA: 3.32 },
        { name: "Mechanical Engineering", avgGPA: 3.15 },
        { name: "Civil Engineering", avgGPA: 3.3 },
        { name: "Business Administration", avgGPA: 3.45 },
      ],
    },
  };

  const currentStats = semesterStats[selectedSemester as keyof typeof semesterStats];

  const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658", "#ff8042"];

  // Handler for Print Report
  const handlePrintReport = async () => {
    setIsPrinting(true);
    setPrintError(null);
    console.log(`[Print Report] Requesting report for semester: ${selectedSemester}`);

    try {
      const reportHtml = await getSemesterReportHtml(selectedSemester);
      const reportWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");

      if (reportWindow) {
        reportWindow.document.open();
        reportWindow.document.write(reportHtml);
        reportWindow.document.close();
      } else {
        throw new Error("Could not open report window. Please check your browser's popup blocker settings.");
      }
    } catch (err: any) {
      console.error("[Print Report] Failed:", err);
      const errorMessage = err.message || "Failed to generate or display the report.";
      setPrintError(errorMessage);
      toast({
        title: "Print Report Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Results by Semester</h2>
          <p className="text-muted-foreground">Analyze and compare semester performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintReport}
            disabled={isPrinting}
          >
            {isPrinting ? (
              "Generating..."
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" disabled>
            <FileDown className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {printError && (
        <div className="text-red-600 bg-red-100 border border-red-400 p-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{printError}</span>
        </div>
      )}

      <Tabs defaultValue={selectedSemester} onValueChange={setSelectedSemester} className="w-full">
        <TabsList className="w-full flex overflow-x-auto">
          {semesters.map((semester) => (
            <TabsTrigger key={semester} value={semester} className="flex-1">
              {semester}
            </TabsTrigger>
          ))}
        </TabsList>

        {semesters.map((semester) => (
          <TabsContent key={semester} value={semester} className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {semesterStats[semester as keyof typeof semesterStats].totalStudents}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {semesterStats[semester as keyof typeof semesterStats].passRate}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Average GPA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {semesterStats[semester as keyof typeof semesterStats].averageGPA}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Distribution of grades across all subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={semesterStats[semester as keyof typeof semesterStats].gradeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {semesterStats[semester as keyof typeof semesterStats].gradeDistribution.map(
                            (entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Average GPA by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={semesterStats[semester as keyof typeof semesterStats].departmentPerformance}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 4]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgGPA" fill="#8884d8" name="Average GPA" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
                <CardDescription>Students with highest GPA this semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">GPA</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{i + 1}</TableCell>
                          <TableCell>STU2023{(i + 1).toString().padStart(3, "0")}</TableCell>
                          <TableCell>
                            {["Sarah Williams", "David Chen", "Emily Rodriguez", "James Wilson", "Michael Johnson"][i]}
                          </TableCell>
                          <TableCell>
                            {[
                              "Computer Science",
                              "Electrical Engineering",
                              "Business Administration",
                              "Computer Science",
                              "Mechanical Engineering",
                            ][i]}
                          </TableCell>
                          <TableCell className="text-right font-semibold">{(4.0 - i * 0.05).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                              Pass
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}