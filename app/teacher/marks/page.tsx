"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Plus, Edit, Trash2, Search } from "lucide-react"
import {
  teacherApiClient,
  type TeacherMark,
  type TeacherSubject,
  type CreateMarkRequest,
  type UpdateMarkRequest,
} from "@/lib/teacher-api"
import { useToast } from "@/hooks/use-toast"

export default function TeacherMarksPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [subjects, setSubjects] = useState<TeacherSubject[]>([])
  const [marks, setMarks] = useState<TeacherMark[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<TeacherSubject | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMark, setEditingMark] = useState<TeacherMark | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  // Form state for add/edit mark
  const [formData, setFormData] = useState<CreateMarkRequest>({
    studentId: 0,
    subjectId: 0,
    marks: 0,
    examType: "Regular",
    academicYear: "2024-25",
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    const subjectId = searchParams.get("subject")
    if (subjectId && subjects.length > 0) {
      const subject = subjects.find((s) => s.id === Number.parseInt(subjectId))
      if (subject) {
        setSelectedSubject(subject)
        fetchMarks(subject.id)
      }
    } else if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0])
      fetchMarks(subjects[0].id)
    }
  }, [subjects, searchParams])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const teacherId = user.teacherId || user.id || 1

      const dashboard = await teacherApiClient.getTeacherDashboard(teacherId)
      setSubjects(dashboard.assignedSubjects)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMarks = async (subjectId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const teacherId = user.teacherId || user.id || 1

      const marksData = await teacherApiClient.getSubjectMarks(teacherId, subjectId)
      setMarks(marksData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load marks",
        variant: "destructive",
      })
    }
  }

  const handleSubjectChange = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === Number.parseInt(subjectId))
    if (subject) {
      setSelectedSubject(subject)
      fetchMarks(subject.id)
    }
  }

  const handleAddMark = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const teacherId = user.teacherId || user.id || 1

      await teacherApiClient.createMark(teacherId, formData)

      toast({
        title: "Success",
        description: "Mark added successfully",
      })

      setIsAddDialogOpen(false)
      resetForm()
      if (selectedSubject) {
        fetchMarks(selectedSubject.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add mark",
        variant: "destructive",
      })
    }
  }

  const handleEditMark = async () => {
    if (!editingMark) return

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const teacherId = user.teacherId || user.id || 1

      const updateData: UpdateMarkRequest = {
        marks: formData.marks,
        examType: formData.examType,
        academicYear: formData.academicYear,
      }

      await teacherApiClient.updateMark(teacherId, editingMark.id, updateData)

      toast({
        title: "Success",
        description: "Mark updated successfully",
      })

      setIsEditDialogOpen(false)
      setEditingMark(null)
      resetForm()
      if (selectedSubject) {
        fetchMarks(selectedSubject.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update mark",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMark = async (markId: number) => {
    if (!confirm("Are you sure you want to delete this mark?")) return

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const teacherId = user.teacherId || user.id || 1

      await teacherApiClient.deleteMark(teacherId, markId)

      toast({
        title: "Success",
        description: "Mark deleted successfully",
      })

      if (selectedSubject) {
        fetchMarks(selectedSubject.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete mark",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile || !selectedSubject) return

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const teacherId = user.teacherId || user.id || 1

      await teacherApiClient.uploadMarks(teacherId, uploadFile, selectedSubject.id, selectedSubject.semester)

      toast({
        title: "Success",
        description: "Marks uploaded successfully",
      })

      setUploadFile(null)
      fetchMarks(selectedSubject.id)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload marks",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: 0,
      subjectId: selectedSubject?.id || 0,
      marks: 0,
      examType: "Regular",
      academicYear: "2024-25",
    })
  }

  const openEditDialog = (mark: TeacherMark) => {
    setEditingMark(mark)
    setFormData({
      studentId: mark.studentId,
      subjectId: mark.subjectId,
      marks: mark.marks,
      examType: mark.examType,
      academicYear: mark.academicYear,
    })
    setIsEditDialogOpen(true)
  }

  const filteredMarks = marks.filter((mark) => {
    const matchesSearch =
      mark.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.studentRollNo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Marks</h1>
          <p className="text-gray-600">Loading marks data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Manage Marks</h1>
          <p className="text-gray-600">Add, edit, and manage student marks by subject</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!selectedSubject}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Marks via Excel</DialogTitle>
                <DialogDescription>
                  Upload an Excel file with student marks for {selectedSubject?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="excel-file">Excel File</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleFileUpload} disabled={!uploadFile}>
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedSubject}>
                <Plus className="h-4 w-4 mr-2" />
                Add Mark
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Mark</DialogTitle>
                <DialogDescription>Add marks for {selectedSubject?.name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    type="number"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    max="100"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="examType">Exam Type</Label>
                  <Select
                    value={formData.examType}
                    onValueChange={(value) => setFormData({ ...formData, examType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Supplementary">Supplementary</SelectItem>
                      <SelectItem value="Revaluation">Revaluation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMark} disabled={!formData.studentId || !selectedSubject}>
                  Add Mark
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Subject</CardTitle>
          <CardDescription>Choose a subject to manage marks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={selectedSubject?.id.toString() || ""} onValueChange={handleSubjectChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name} ({subject.code}) - Sem {subject.semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSubject && (
              <div className="flex gap-2">
                <Badge variant="outline">Semester {selectedSubject.semester}</Badge>
                <Badge variant="outline">{selectedSubject.credits} Credits</Badge>
                <Badge variant="outline">{selectedSubject.department}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Marks Management */}
      {selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Marks for {selectedSubject.name}
                <Badge variant="outline" className="ml-2">
                  {filteredMarks.length} students
                </Badge>
              </span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarks.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell className="font-medium">{mark.studentName}</TableCell>
                    <TableCell>{mark.studentRollNo}</TableCell>
                    <TableCell className="font-medium">{mark.marks}</TableCell>
                    <TableCell>
                      <Badge variant={mark.grade === "F" ? "destructive" : "default"}>{mark.grade}</Badge>
                    </TableCell>
                    <TableCell>{mark.examType}</TableCell>
                    <TableCell>{mark.academicYear}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(mark)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteMark(mark.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredMarks.length === 0 && (
              <div className="text-center py-8 text-gray-500">No marks found for this subject</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Mark</DialogTitle>
            <DialogDescription>Update marks for {editingMark?.studentName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-marks">Marks</Label>
              <Input
                id="edit-marks"
                type="number"
                max="100"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: Number.parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="edit-examType">Exam Type</Label>
              <Select
                value={formData.examType}
                onValueChange={(value) => setFormData({ ...formData, examType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Supplementary">Supplementary</SelectItem>
                  <SelectItem value="Revaluation">Revaluation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-academicYear">Academic Year</Label>
              <Input
                id="edit-academicYear"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditMark}>Update Mark</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
