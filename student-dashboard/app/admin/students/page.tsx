"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getStudents, type Student } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true)
        const data = await getStudents()
        setStudents(data)
      } catch (error) {
        console.error("Failed to fetch students:", error)
        toast({
          title: "Error",
          description: "Failed to load students. Please try again later.",
          variant: "destructive",
        })
        // For demo purposes, load mock data if API fails
        setStudents([
          {
            id: "STU2023001",
            name: "Michael Johnson",
            email: "michael.johnson@example.com",
            department: "Computer Science",
            year: 3,
            gpa: 3.75,
            status: "Active",
            createdAt: "2023-09-01",
            updatedAt: "2023-09-01",
          },
          {
            id: "STU2023045",
            name: "Sarah Williams",
            email: "sarah.williams@example.com",
            department: "Electrical Engineering",
            year: 2,
            gpa: 3.92,
            status: "Active",
            createdAt: "2023-09-01",
            updatedAt: "2023-09-01",
          },
          {
            id: "STU2022078",
            name: "David Chen",
            email: "david.chen@example.com",
            department: "Computer Science",
            year: 4,
            gpa: 3.68,
            status: "Active",
            createdAt: "2023-09-01",
            updatedAt: "2023-09-01",
          },
          {
            id: "STU2023112",
            name: "Emily Rodriguez",
            email: "emily.rodriguez@example.com",
            department: "Mechanical Engineering",
            year: 1,
            gpa: 3.45,
            status: "Active",
            createdAt: "2023-09-01",
            updatedAt: "2023-09-01",
          },
          {
            id: "STU2021034",
            name: "James Wilson",
            email: "james.wilson@example.com",
            department: "Information Technology",
            year: 3,
            gpa: 3.81,
            status: "Active",
            createdAt: "2023-09-01",
            updatedAt: "2023-09-01",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [toast])

  // Filter students based on search term
  const filteredStudents = students.filter(
    (student) =>
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage student records and information</p>
        </div>
        <Button asChild>
          <Link href="/admin/students/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Students</CardTitle>
              <CardDescription>A list of all students in the system</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden md:table-cell">Year</TableHead>
                  <TableHead className="text-right">GPA</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-2"></div>
                        <span className="text-muted-foreground">Loading students...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-muted-foreground">No students found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={student.profileImage || "/placeholder.svg?height=32&width=32"}
                              alt={student.name}
                            />
                            <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span>{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{student.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{student.department}</TableCell>
                      <TableCell className="hidden md:table-cell">{student.year}</TableCell>
                      <TableCell className="text-right font-semibold">{student.gpa}</TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/students/${student.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
