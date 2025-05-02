import { Student } from "@/lib/api-service"; // Adjust path as needed
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Define the props interface
interface StudentProfileProps {
  student: Student;
}

// Update the component to use the props interface
export function StudentProfile({ student }: StudentProfileProps) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <img
          src={student.profileImage || "https://github.com/shadcn.png"} // Use profileImage as per Student interface
          alt="Student Avatar"
          className="w-24 h-24 rounded-full mb-4"
        />
        <h2 className="text-xl font-semibold">{student.name}</h2>
        <p className="text-muted-foreground">{student.email}</p>
        <p className="text-muted-foreground">ID: {student.id}</p>
      </CardContent>
    </Card>
  );
}