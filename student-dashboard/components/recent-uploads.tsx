import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function RecentUploads() {
  const uploads = [
    {
      id: "UPL001",
      name: "Fall 2023 Results",
      type: "Semester Results",
      date: "Jan 15, 2024",
      status: "Completed",
      records: 245,
    },
    {
      id: "UPL002",
      name: "New Student Batch",
      type: "Student Records",
      date: "Jan 10, 2024",
      status: "Completed",
      records: 78,
    },
    {
      id: "UPL003",
      name: "Spring 2024 Subjects",
      type: "Course Data",
      date: "Jan 05, 2024",
      status: "Completed",
      records: 32,
    },
    {
      id: "UPL004",
      name: "Faculty Assignments",
      type: "Faculty Data",
      date: "Dec 28, 2023",
      status: "Completed",
      records: 18,
    },
    {
      id: "UPL005",
      name: "Mid-term Evaluations",
      type: "Exam Results",
      date: "Dec 15, 2023",
      status: "Completed",
      records: 245,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Recent Data Uploads</CardTitle>
        <CardDescription>History of data uploads to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Records</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-medium">{upload.id}</TableCell>
                  <TableCell>{upload.name}</TableCell>
                  <TableCell>{upload.type}</TableCell>
                  <TableCell>{upload.date}</TableCell>
                  <TableCell className="text-right">{upload.records}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        upload.status === "Completed"
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : upload.status === "Processing"
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                      }
                    >
                      {upload.status}
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
