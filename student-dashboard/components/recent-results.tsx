import { Result } from "@/lib/api-service"; // Adjust path as needed
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Define the props interface
interface RecentResultsProps {
  results: Result[];
}

// Update the component to use the props interface
export function RecentResults({ results }: RecentResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Results</CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <p className="text-muted-foreground">No results available.</p>
        ) : (
          <ul className="space-y-2">
            {results.slice(0, 5).map((result) => (
              <li key={result.id} className="flex justify-between">
                <span>{result.subjectName || "Unknown Subject"}</span>
                <span>{result.marks}%</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}