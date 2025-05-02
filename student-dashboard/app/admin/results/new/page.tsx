"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createResult } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Get studentId from query params if available
  const studentIdFromQuery = searchParams.get("studentId")

  const [formData, setFormData] = useState({
    studentId: studentIdFromQuery || "",
    semester: "Fall 2023",
    subjectCode: "",
    subjectName: "",
    marks: "",
    grade: "A",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-select grade based on marks
    if (name === "marks") {
      const marks = Number.parseFloat(value)
      let grade = "F"

      if (marks >= 90) grade = "A+"
      else if (marks >= 85) grade = "A"
      else if (marks >= 80) grade = "A-"
      else if (marks >= 75) grade = "B+"
      else if (marks >= 70) grade = "B"
      else if (marks >= 65) grade = "B-"
      else if (marks >= 60) grade = "C+"
      else if (marks >= 55) grade = "C"
      else if (marks >= 50) grade = "C-"
      else if (marks >= 45) grade = "D+"
      else if (marks >= 40) grade = "D"

      setFormData((prev) => ({ ...prev, grade }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call the API to create a new result
      await createResult({
        studentId: formData.studentId,
        semester: formData.semester,
        subjectCode: formData.subjectCode,
        subjectName: formData.subjectName,
        marks: Number.parseFloat(formData.marks),
        grade: formData.grade,
        status: Number.parseFloat(formData.marks) >= 40 ? "Pass" : "Fail",
      })

      toast({
        title: "Result Created",
        description: "The result has been successfully added to the system.",
      })

      // If we came from a student page, go back to that student
      if (studentIdFromQuery) {
        router.push(`/admin/students/${studentIdFromQuery}`)
      } else {
        router.push("/admin/results")
      }
    } catch (error) {
      console.error("Error creating result:", error)
      toast({
        title: "Error",
        description: "Failed to create result. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" asChild>
          <Link href={studentIdFromQuery ? `/admin/students/${studentIdFromQuery}` : "/admin/results"}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Add New Result</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Result Information</CardTitle>
          <CardDescription>Enter the details of the new result</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="e.g. STU2024001"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  disabled={!!studentIdFromQuery}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => handleSelectChange("semester", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall 2023">Fall 2023</SelectItem>
                    <SelectItem value="Spring 2023">Spring 2023</SelectItem>
                    <SelectItem value="Fall 2022">Fall 2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code</Label>
                <Input
                  id="subjectCode"
                  name="subjectCode"
                  placeholder="e.g. CS201"
                  value={formData.subjectCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input
                  id="subjectName"
                  name="subjectName"
                  placeholder="e.g. Data Structures"
                  value={formData.subjectName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  name="marks"
                  type="number"
                  placeholder="e.g. 85"
                  value={formData.marks}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={formData.grade} onValueChange={(value) => handleSelectChange("grade", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="C+">C+</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="C-">C-</SelectItem>
                    <SelectItem value="D+">D+</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                router.push(studentIdFromQuery ? `/admin/students/${studentIdFromQuery}` : "/admin/results")
              }
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Result"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
