"use client";

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Result } from "@/lib/api-service";
import { useMemo } from "react";

// Define the props interface - results can be null/undefined/empty
interface PerformanceChartProps {
  type: "pie" | "line";
  results: Result[] | null | undefined;
}

// --- Dummy Data Definitions ---
const dummyGpaData = [
    { name: 'Fall 2022', gpa: 3.25 },
    { name: 'Spring 2023', gpa: 3.48 },
    { name: 'Fall 2023', gpa: 3.61 },
    { name: 'Spring 2024', gpa: 3.75 }, // Example future/current
];

const dummyGradeDistributionData = [
    { name: 'A+', value: 2 },
    { name: 'A', value: 5 },
    { name: 'A-', value: 4 },
    { name: 'B+', value: 7 },
    { name: 'B', value: 6 },
    { name: 'Fail', value: 1 }, // Example: Grouping C/D/F as Fail for simplicity
];

// Define colors for charts
const COLORS_PIE = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57", "#ffaaa5"];
const GPA_LINE_COLOR = "#8884d8"; // Purple

export function PerformanceChart({ type, results }: PerformanceChartProps) {

  // Calculate real chart data, but fall back to dummy data if needed
  const chartData = useMemo(() => {
    let calculatedData: any[] = [];

    // --- Try calculating from REAL results first ---
    if (results && results.length > 0) {
      console.log(`[PerformanceChart] Calculating ${type} chart from ${results.length} real results.`);
      if (type === 'pie') {
        // Example: Aggregate grades
        const gradeCounts: Record<string, number> = {};
        results.forEach(result => {
          gradeCounts[result.grade] = (gradeCounts[result.grade] || 0) + 1;
        });
        calculatedData = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }));
      } else if (type === 'line') {
        // Example: Calculate average GPA per semester
        const semesterGpas: Record<string, { totalPoints: number; count: number }> = {};
        const gradePoints: Record<string, number> = {
            "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
            "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0
        };
        results.forEach(result => {
           if (!semesterGpas[result.semester]) {
              semesterGpas[result.semester] = { totalPoints: 0, count: 0 };
           }
           semesterGpas[result.semester].totalPoints += gradePoints[result.grade] || 0;
           semesterGpas[result.semester].count++;
        });
        const sortedSemesters = Object.keys(semesterGpas).sort(/* Add custom semester sort if needed */);
        calculatedData = sortedSemesters.map(semester => ({
           name: semester,
           // Ensure count is not zero before dividing
           gpa: semesterGpas[semester].count > 0 ? parseFloat((semesterGpas[semester].totalPoints / semesterGpas[semester].count).toFixed(2)) : 0,
        }));
      }
    }

    // --- Fallback to DUMMY data if real data is empty/null or calculation failed ---
    if (calculatedData.length === 0) {
      console.log(`[PerformanceChart] No real data for ${type} chart, using dummy data.`);
      if (type === 'pie') {
        calculatedData = dummyGradeDistributionData;
      } else if (type === 'line') {
        calculatedData = dummyGpaData;
      }
    }

    return calculatedData;

  }, [results, type]); // Recalculate when results or type change

  // --- Render the chart ---
  // Check if even after fallback, there's no data (shouldn't happen with dummy data)
  if (!chartData || chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
           No data available to display {type} chart.
        </div>
    );
  }

  // Render Pie Chart
  if (type === "pie") {
    return (
      <div className="h-72 w-full"> {/* Ensure container has dimensions */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8" // Default fill, overridden by Cells
              dataKey="value" // Key containing the numerical value
              nameKey="name" // Key containing the category name
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} subjects`} /> {/* Customize tooltip */}
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Render Line Chart (GPA Trend)
  if (type === "line") {
    return (
      <div className="h-48 w-full"> {/* Ensure container has dimensions */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}> {/* Adjust margins */}
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} /> {/* Semester name */}
            <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} /> {/* GPA scale 0-4 */}
            <Tooltip formatter={(value) => `GPA: ${value}`} /> {/* Customize tooltip */}
            <Legend />
            <Line type="monotone" dataKey="gpa" stroke={GPA_LINE_COLOR} activeDot={{ r: 6 }} name="GPA"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback for invalid type
  return <div className="flex items-center justify-center h-48 text-destructive">Invalid chart type specified.</div>;
}