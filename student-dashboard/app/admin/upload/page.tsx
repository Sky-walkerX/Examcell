"use client";

import React, { useState } from "react";
import {
  uploadResultsCSV,
  createResult as apiCreateResult,
  type CreateResultDto,
  type UploadResponse,
} from "@/lib/api-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileUp, Check, AlertCircle, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubjectResultRow {
  id: number;
  subjectCode: string;
  subjectName: string;
  marks: string;
  grade: string;
}

export default function UploadPage() {
  const { toast } = useToast();

  // --- State for CSV Upload Tab ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvUploadType, setCsvUploadType] = useState<string>("semester-results");
  const [csvSemester, setCsvSemester] = useState<string>("Fall 2023");
  const [csvLoading, setCsvLoading] = useState<boolean>(false);
  const [csvUploadSuccess, setCsvUploadSuccess] = useState<boolean>(false);
  const [csvRecordsProcessed, setCsvRecordsProcessed] = useState<number>(0);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvPreviewContent, setCsvPreviewContent] = useState<string>("");

  // --- State for Manual Entry Tab ---
  const [manualStudentId, setManualStudentId] = useState<string>("");
  const [manualSemester, setManualSemester] = useState<string>("Fall 2023");
  const [manualLoading, setManualLoading] = useState<boolean>(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [subjectResultRows, setSubjectResultRows] = useState<SubjectResultRow[]>([
    { id: Date.now(), subjectCode: "", subjectName: "", marks: "", grade: "" },
  ]);

  // --- CSV Upload Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError(null);
    setCsvUploadSuccess(false);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.includes("csv") && !file.name.toLowerCase().endsWith(".csv")) {
        toast({
          title: "Invalid File Type",
          description: "Please select a .csv file.",
          variant: "destructive",
        });
        e.target.value = "";
        setSelectedFile(null);
        setCsvPreviewContent("");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 10MB.",
          variant: "destructive",
        });
        e.target.value = "";
        setSelectedFile(null);
        setCsvPreviewContent("");
        return;
      }
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (event) =>
        setCsvPreviewContent(event.target?.result as string);
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: "Could not read the selected file.",
          variant: "destructive",
        });
        setCsvPreviewContent("");
      };
      reader.readAsText(file);
    } else {
      setSelectedFile(null);
      setCsvPreviewContent("");
    }
  };

  const handleCsvUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }
    setCsvLoading(true);
    setCsvUploadSuccess(false);
    setCsvError(null);
    try {
      const formData = new FormData();
      formData.append("semester", csvSemester);
      formData.append("file", selectedFile);
      formData.append("type", csvUploadType);

      const result: UploadResponse = await uploadResultsCSV(formData);

      if (result.success) {
        setCsvUploadSuccess(true);
        setCsvRecordsProcessed(result.recordsProcessed || 0);
        toast({
          title: "Upload Successful",
          description: `Successfully processed ${
            result.recordsProcessed || 0
          } records from ${selectedFile.name}.`,
        });
        setSelectedFile(null);
        setCsvPreviewContent("");
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
      } else {
        throw new Error(
          result.message || "Backend reported failure but provided no specific message."
        );
      }
    } catch (error: any) {
      console.error("CSV Upload error:", error);
      const errorMessage =
        error.message ||
        "Failed to process the CSV file. Please check format/content and try again.";
      setCsvError(errorMessage);
      toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setCsvLoading(false);
    }
  };

  // --- Manual Entry Handlers ---
  const addSubjectRow = () => {
    setSubjectResultRows([
      ...subjectResultRows,
      { id: Date.now(), subjectCode: "", subjectName: "", marks: "", grade: "" },
    ]);
  };

  const removeSubjectRow = (idToRemove: number) => {
    if (subjectResultRows.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one subject row is required.",
        variant: "destructive",
      });
      return;
    }
    setSubjectResultRows(subjectResultRows.filter((result) => result.id !== idToRemove));
  };

  const updateSubjectRow = (
    idToUpdate: number,
    field: keyof Omit<SubjectResultRow, "id">,
    value: string
  ) => {
    setSubjectResultRows((prevRows) =>
      prevRows.map((row) =>
        row.id === idToUpdate ? { ...row, [field]: value } : row
      )
    );
  };

  const handleManualSubmit = async () => {
    setManualLoading(true);
    setManualError(null);
    let errorsEncountered: string[] = [];
    let successCount = 0;

    if (!manualStudentId.trim()) {
      setManualError("Student ID cannot be empty.");
      setManualLoading(false);
      return;
    }
    if (!manualSemester.trim()) {
      setManualError("Semester cannot be empty.");
      setManualLoading(false);
      return;
    }

    const validRowsToSubmit = subjectResultRows.filter(
      (r) => r.subjectCode.trim() && r.marks.trim() && r.grade.trim()
    );

    if (validRowsToSubmit.length === 0) {
      setManualError(
        "Please enter complete data (Subject Code, Marks, Grade) for at least one row."
      );
      setManualLoading(false);
      return;
    }

    console.log(
      `[Manual Entry] Attempting to submit ${validRowsToSubmit.length} result(s) for student ${manualStudentId}, semester ${manualSemester}`
    );

    for (const resultRow of validRowsToSubmit) {
      const marksNum = Number.parseFloat(resultRow.marks);
      if (isNaN(marksNum)) {
        errorsEncountered.push(
          `Row for Subject Code '${resultRow.subjectCode}': Marks must be a valid number.`
        );
        continue;
      }
      if (marksNum < 0 || marksNum > 100) {
        errorsEncountered.push(
          `Row for Subject Code '${resultRow.subjectCode}': Marks must be between 0 and 100.`
        );
        continue;
      }

      const payload: CreateResultDto = {
        studentId: manualStudentId.trim(),
        semester: manualSemester.trim(),
        subjectCode: resultRow.subjectCode.trim(),
        subjectName: resultRow.subjectName.trim() || resultRow.subjectCode.trim(),
        marks: marksNum,
        grade: resultRow.grade.trim(),
      };

      try {
        console.log("[Manual Entry] Calling apiCreateResult with payload:", payload);
        await apiCreateResult(payload);
        successCount++;
      } catch (error: any) {
        console.error(`[Manual Entry] API Error for ${resultRow.subjectCode}:`, error);
        errorsEncountered.push(
          `Subject ${resultRow.subjectCode}: ${error.message || "Failed to submit"}`
        );
      }
    }

    setManualLoading(false);

    if (errorsEncountered.length > 0) {
      const errorSummary = `Encountered ${errorsEncountered.length} error(s). First error: ${errorsEncountered[0]}`;
      setManualError(errorSummary);
      toast({
        title: `Manual Entry Submitted with Issues (${successCount}/${validRowsToSubmit.length} Saved)`,
        description:
          errorSummary.substring(0, 150) + (errorSummary.length > 150 ? "..." : ""),
        variant: "destructive",
        duration: 7000,
      });
    } else if (successCount > 0) {
      toast({
        title: "Manual Entry Successful",
        description: `Successfully submitted ${successCount} result(s) for student ${manualStudentId}.`,
      });
      setManualStudentId("");
      setSubjectResultRows([
        { id: Date.now(), subjectCode: "", subjectName: "", marks: "", grade: "" },
      ]);
      setManualError(null);
    } else {
      setManualError("Submission failed for all entries. Please check logs or try again.");
      toast({
        title: "Submission Failed",
        description: "No results were saved.",
        variant: "destructive",
      });
    }
  };

  // --- JSX ---
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Upload Data</h2>
      </div>

      <Tabs defaultValue="csv" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Results CSV</CardTitle>
              <CardDescription>Upload student results in CSV format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {csvUploadSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Upload Successful</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Successfully processed {csvRecordsProcessed} records.
                  </AlertDescription>
                </Alert>
              )}
              {csvError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Failed</AlertTitle>
                  <AlertDescription>{csvError}</AlertDescription>
                </Alert>
              )}
              <div className="grid w-full gap-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-upload-type">Upload Type</Label>
                  <Select
                    value={csvUploadType}
                    onValueChange={setCsvUploadType}
                    disabled={csvLoading}
                  >
                    <SelectTrigger id="csv-upload-type">
                      <SelectValue placeholder="Select upload type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semester-results">Semester Results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="csv-semester">Semester</Label>
                  <Select
                    value={csvSemester}
                    onValueChange={setCsvSemester}
                    disabled={csvLoading}
                  >
                    <SelectTrigger id="csv-semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fall 2023">Fall 2023</SelectItem>
                      <SelectItem value="Spring 2024">Spring 2024</SelectItem>
                      <SelectItem value="Summer 2024">Summer 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file-upload">CSV File *</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-full">
                      <label
                        htmlFor="file-upload"
                        className={`flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer ${
                          csvLoading
                            ? "opacity-50 cursor-not-allowed"
                            : "border-gray-300 hover:border-purple-400 focus:outline-none"
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2 text-center">
                          <FileUp className="w-6 h-6 text-gray-500" />
                          <span className="font-medium text-gray-600">
                            {selectedFile
                              ? selectedFile.name
                              : "Drop file here or click to upload"}
                          </span>
                          <span className="text-xs text-gray-500">
                            .csv files only (MAX 10MB)
                          </span>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".csv,text/csv"
                          onChange={handleFileChange}
                          disabled={csvLoading}
                        />
                      </label>
                    </div>
                    <Button
                      type="button"
                      disabled={!selectedFile || csvLoading}
                      onClick={handleCsvUpload}
                      className="sm:self-stretch"
                    >
                      {csvLoading ? (
                        "Processing..."
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" /> Upload File
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expected CSV Format</Label>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <code className="text-xs block whitespace-pre-wrap">
                      student_id,subject_code,marks,grade,status{"\n"}
                      STU2023001,CS201,87,A,Pass{"\n"}
                      STU2023001,MA101,92,A+,Pass{"\n"}...
                    </code>
                  </CardContent>
                </Card>
              </div>
              {csvPreviewContent && (
                <div className="space-y-2">
                  <Label>File Preview (First 5 rows)</Label>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Result Entry</CardTitle>
              <CardDescription>
                Enter results for one student across multiple subjects for a single
                semester.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {manualError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Submission Error</AlertTitle>
                  <AlertDescription>{manualError}</AlertDescription>
                </Alert>
              )}
              <div className="grid w-full gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-student-id">Student ID *</Label>
                    <Input
                      id="manual-student-id"
                      placeholder="e.g. STU2024055"
                      value={manualStudentId}
                      onChange={(e) => setManualStudentId(e.target.value)}
                      required
                      disabled={manualLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-semester">Semester *</Label>
                    <Select
                      value={manualSemester}
                      onValueChange={setManualSemester}
                      required
                      disabled={manualLoading}
                    >
                      <SelectTrigger id="manual-semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall 2023">Fall 2023</SelectItem>
                        <SelectItem value="Spring 2024">Spring 2024</SelectItem>
                        <SelectItem value="Summer 2024">Summer 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject Results *</Label>
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Subject Code *</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead className="w-[100px]">Marks *</TableHead>
                          <TableHead className="w-[120px]">Grade *</TableHead>
                          <TableHead className="w-[50px]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjectResultRows.map((resultRow) => (
                          <TableRow key={resultRow.id}>
                            <TableCell>
                              <Input
                                placeholder="e.g. CS201"
                                value={resultRow.subjectCode}
                                onChange={(e) =>
                                  updateSubjectRow(
                                    resultRow.id,
                                    "subjectCode",
                                    e.target.value
                                  )
                                }
                                required
                                disabled={manualLoading}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="e.g. Data Structures"
                                value={resultRow.subjectName}
                                onChange={(e) =>
                                  updateSubjectRow(
                                    resultRow.id,
                                    "subjectName",
                                    e.target.value
                                  )
                                }
                                disabled={manualLoading}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="0-100"
                                value={resultRow.marks}
                                onChange={(e) =>
                                  updateSubjectRow(resultRow.id, "marks", e.target.value)
                                }
                                required
                                disabled={manualLoading}
                                step="1"
                                min="0"
                                max="100"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="e.g. A+"
                                value={resultRow.grade}
                                onChange={(e) =>
                                  updateSubjectRow(
                                    resultRow.id,
                                    "grade",
                                    e.target.value.toUpperCase()
                                  )
                                }
                                required
                                disabled={manualLoading}
                                maxLength={2}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSubjectRow(resultRow.id)}
                                disabled={manualLoading || subjectResultRows.length <= 1}
                                aria-label="Remove row"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubjectRow}
                    className="mt-2"
                    disabled={manualLoading}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Subject Row
                  </Button>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={manualLoading}
                >
                  {manualLoading ? "Submitting..." : "Submit Manual Results"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}