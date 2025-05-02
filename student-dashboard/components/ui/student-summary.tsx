import { Student, Result } from "@/lib/api-service"; // Adjust path as needed
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Define the props interface
interface StudentSummaryProps {
  student: Student;
  results: Result[];
}

// Update the component to use the props interface
export function StudentSummary({ student, results }: StudentSummaryProps) {
  const totalResults = results.length;
  const averageScore =
    results.length > 0
      ? results.reduce((sum, result) => sum + (result.marks || 0), 0) / results.length
      : 0;

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium">Courses Taken</h3>
          <p className="text-2xl">{totalResults}</p>
        </div>
        <div>
          <h3 className="font-medium">Average Score</h3>
          <p className="text-2xl">{averageScore.toFixed(2)}</p>
        </div>
        <div>
          <h3 className="font-medium">Student Since</h3>
          <p className="text-2xl">
            {new Date(student.createdAt || Date.now()).getFullYear()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}