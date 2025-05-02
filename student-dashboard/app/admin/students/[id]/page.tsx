"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getStudentById, getResultsByStudentId, type Student, type Result } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, PencilLine, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [student, setStudent] = useState<Student | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const studentData = await getStudentById(params.id)
        setStudent(studentData)

        const resultsData = await getResultsByStudentId(params.id)
        setResults(resultsData)
      } catch (error) {
        console.error("Failed to fetch student data:", error)
        toast({
          title: "Error",
          description: "Failed to load student data. Please try again later.",
          variant: "destructive",
        })

        // For demo purposes, load mock data if API fails
        setStudent({
          id: params.id,
          name: "Michael Johnson",
          email: "michael.johnson@example.com",
          department: "Computer Science",
          year: 3,
          gpa: 3.75,
          status: "Active",
          createdAt: "2023-09-01",
          updatedAt: "2023-09-01",
        })

        setResults([
          {
            id: 1,
            studentId: params.id,
            semester: "Fall 2023",
            subjectCode: "CS201",
            subjectName: "Data Structures",
            marks: 87,
            grade: "A",
            status: "Pass",
            createdAt: "2023-12-15",
            updatedAt: "2023-12-15",
          },
          {
            id: 2,
            studentId: params.id,
            semester: "Fall 2023",
            subjectCode: "CS301",
            subjectName: "Database Systems",
            marks: 92,
            grade: "A+",
            status: "Pass",
            createdAt: "2023-12-15",
            updatedAt: "2023-12-15",
          },
          {
            id: 3,
            studentId: params.id,
            semester: "Fall 2023",
            subjectCode: "CS302",
            subjectName: "Computer Networks",
            marks: 78,
            grade: "B+",
            status: "Pass",
            createdAt: "2023-12-15",
            updatedAt: "2023-12-15",
          },
          {
            id: 4,
            studentId: params.id,
            semester: "Fall 2023",
            subjectCode: "CS401",
            subjectName: "Software Engineering",
            marks: 85,
            grade: "A",
            status: "Pass",
            createdAt: "2023-12-15",
            updatedAt: "2023-12-15",
          },
          {
            id: 5,
            studentId: params.id,
            semester: "Fall 2023",
            subjectCode: "CS501",
            subjectName: "Artificial Intelligence",
            marks: 76,
            grade: "B+",
            status: "Pass",
            createdAt: "2023-12-15",
            updatedAt: "2023-12-15",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  // Group results by semester
  const resultsBySemester = results.reduce(
    (acc, result) => {
      if (!acc[result.semester]) {
        acc[result.semester] = []
      }
      acc[result.semester].push(result)
      return acc
    },
    {} as Record<string, Result[]>,
  )

  // Sort semesters
  const semesters = Object.keys(resultsBySemester).sort().reverse()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mb-4"></div>
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested student could not be found.</p>
        <Button asChild>
          <Link href="/admin/students">Back to Students</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href="/admin/students">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Student Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Student personal details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={student.profileImage || "/placeholder.svg?height=96&width=96"} alt={student.name} />
              <AvatarFallback className="text-lg">{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">{student.name}</h3>
            <p className="text-muted-foreground">{student.email}</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                {student.department}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                Year {student.year}
              </Badge>
              <Badge
                variant="outline"
                className={
                  student.status === "Active"
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }
              >
                {student.status}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/admin/students/${student.id}/edit`}>
                <PencilLine className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Academic Summary</CardTitle>
                <CardDescription>Student's academic performance</CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/admin/results/new?studentId=${student.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Result
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current CGPA</p>
                <p className="text-2xl font-bold text-purple-600">{student.gpa}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {results.length > 0
                    ? `${Math.round((results.filter((r) => r.status === "Pass").length / results.length) * 100)}%`
                    : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Semesters</p>
                <p className="text-2xl font-bold">{semesters.length}</p>
              </div>
            </div>

            {semesters.length > 0 ? (
              <Tabs defaultValue={semesters[0]}>
                <TabsList className="w-full flex overflow-x-auto">
                  {semesters.map((semester) => (
                    <TabsTrigger key={semester} value={semester} className="flex-1">
                      {semester}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {semesters.map((semester) => (
                  <TabsContent key={semester} value={semester} className="mt-4">
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead className="text-right">Marks</TableHead>
                            <TableHead className="text-right">Grade</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resultsBySemester[semester].map((result) => (
                            <TableRow key={result.id}>
                              <TableCell className="font-medium">{result.subjectName}</TableCell>
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No results found for this student.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
