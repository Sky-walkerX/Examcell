import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function StudentList() {
  const students = [
    {
      id: "STU2023001",
      name: "Michael Johnson",
      department: "Computer Science",
      year: 3,
      gpa: 3.75,
      status: "Active",
    },
    {
      id: "STU2023045",
      name: "Sarah Williams",
      department: "Electrical Engineering",
      year: 2,
      gpa: 3.92,
      status: "Active",
    },
    {
      id: "STU2022078",
      name: "David Chen",
      department: "Computer Science",
      year: 4,
      gpa: 3.68,
      status: "Active",
    },
    {
      id: "STU2023112",
      name: "Emily Rodriguez",
      department: "Mechanical Engineering",
      year: 1,
      gpa: 3.45,
      status: "Active",
    },
    {
      id: "STU2021034",
      name: "James Wilson",
      department: "Information Technology",
      year: 3,
      gpa: 3.81,
      status: "Active",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Recent Students</CardTitle>
          <CardDescription>Manage student records</CardDescription>
        </div>
        <Button size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">GPA</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>{student.year}</TableCell>
                  <TableCell className="text-right font-semibold">{student.gpa}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                      {student.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
