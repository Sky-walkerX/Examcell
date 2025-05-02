/**
 * API Service for interacting with the Spring Boot backend.
 * Handles fetching data, sending data, and managing authentication tokens.
 */
import { getSession } from "next-auth/react";
import type { Session } from "next-auth";

// --- Configuration ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// --- Interfaces matching Backend Entities/Frontend Needs ---

export interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  year: number;
  gpa: number;
  status: string;
  profileImage?: string | null; // Nullable to match backend
  createdAt: string; // ISO string, e.g., "2023-01-15T00:00:00Z"
  updatedAt: string;
}

export interface Result {
  id: number; // Matches backend Long as number in JS
  studentId: string;
  semester: string; // e.g., "2023-Fall"
  subjectCode: string;
  subjectName: string;
  marks: number;
  grade: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  code: string;
  name: string;
  department: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Upload {
  id: string; // UUID string
  name: string;
  type: string; // e.g., "CSV"
  records: number;
  status: string; // e.g., "Completed", "Failed"
  createdAt: string;
  updatedAt: string;
}

// --- Backend Request DTO Shapes ---

export type CreateStudentDto = {
  id: string;
  name: string;
  email: string;
  department: string;
  year: number;
  profileImage?: string | null;
};

export type UpdateStudentDto = Partial<{
  name: string;
  email: string;
  department: string;
  year: number;
  status: string;
  profileImage?: string | null;
}>;

export type CreateResultDto = {
  studentId: string;
  semester: string;
  subjectCode: string;
  subjectName: string; // Optional if backend derives from subjectCode
  marks: number;
  grade: string;
};

export type UpdateResultDto = {
  marks: number;
  grade: string;
};

export type CreateSubjectDto = {
  code: string;
  name: string;
  department: string;
  credits: number;
};

export type UpdateSubjectDto = Partial<{
  name: string;
  department: string;
  credits: number;
}>;

export type UploadResponse = {
  success: boolean;
  recordsProcessed?: number | null;
  message?: string | null;
};

export interface AnalyticsStatsDto {
  totalStudents: number;
  activeStudents: number;
  totalSubjects: number;
  totalResultsEntered: number;
  studentsPerDepartment: Record<string, number>;
  averageGpaPerDepartment: Record<string, number>;
  resultsPerSemester: Record<string, number>;
  recentUploads: Upload[];
}

// --- Helper Functions ---

/**
 * Handles API responses, parsing JSON or returning text for HTML.
 * Throws detailed errors for non-ok responses.
 */
async function handleResponse<T>(response: Response): Promise<T | string> {
  if (!response.ok) {
    let errorPayload = { message: `API Error: ${response.status} ${response.statusText}` };
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const backendError = await response.json();
        errorPayload.message = backendError.message || backendError.error || errorPayload.message;
      } else {
        const textError = await response.text();
        errorPayload.message = textError
          ? `${errorPayload.message} - Response: ${textError.substring(0, 200)}...`
          : errorPayload.message;
      }
    } catch (e) {
      console.error("Could not parse error response:", e);
    }
    console.error("API Error Response Payload:", errorPayload);
    throw new Error(errorPayload.message);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("text/html")) {
    console.log("[handleResponse] Received text/html, returning text.");
    return response.text();
  }

  if (response.status === 204) {
    console.log("[handleResponse] Received 204 No Content.");
    return null as T;
  }

  try {
    return await response.json();
  } catch (e) {
    console.error("Could not parse successful response as JSON:", e);
    throw new Error("Received invalid JSON response from server.");
  }
}

// Custom options type for fetch
interface FetchApiOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | null | Record<string, any>;
}

/**
 * Generic fetch function for JSON endpoints.
 * Adds Authorization header with JWT token from session.
 * Returns JSON data of type T.
 */
async function fetchApi<T>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  let session: (Session & { accessToken?: string }) | null = null;

  try {
    session = await getSession();
  } catch (sessionError) {
    console.error("Error getting NextAuth session:", sessionError);
    throw new Error("Failed to retrieve authentication session.");
  }

  const token = session?.accessToken;
  const headers = new Headers(options.headers as HeadersInit);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else if (!endpoint.startsWith("/auth/login")) {
    console.warn(`[fetchApi] No access token for request to ${endpoint}`);
  }

  let body = options.body;
  if (body instanceof FormData) {
    headers.delete("Content-Type"); // Let browser set multipart/form-data boundary
  } else if (body && typeof body === "object" && headers.get("Content-Type") === "application/json") {
    try {
      body = JSON.stringify(body);
    } catch (stringifyError) {
      console.error("Failed to stringify request body:", stringifyError);
      throw new Error("Invalid request body provided.");
    }
  }

  console.log(`[fetchApi] Requesting ${options.method || "GET"} ${endpoint}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body: body as BodyInit | null | undefined,
    });
    return handleResponse<T>(response) as Promise<T>;
  } catch (error) {
    console.error(`[fetchApi] API call to ${endpoint} failed:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error) || "An unknown fetch error occurred.");
  }
}

/**
 * Fetch function for HTML endpoints (e.g., reports).
 * Requests text/html and returns string.
 */
async function fetchHtml(endpoint: string, options: FetchApiOptions = {}): Promise<string> {
  const headers = new Headers(options.headers as HeadersInit);
  headers.set("Accept", "text/html");

  const response = await fetchApi<string>(endpoint, {
    ...options,
    headers,
  });

  if (typeof response !== "string") {
    console.error("[fetchHtml] Expected string response, got:", typeof response);
    throw new Error("Failed to retrieve HTML content.");
  }

  return response;
}

// --- API Function Definitions ---

// Students
export async function getStudents(): Promise<Student[]> {
  return fetchApi<Student[]>("/students");
}

export async function getStudentById(id: string): Promise<Student> {
  return fetchApi<Student>(`/students/${id}`);
}

export async function createStudent(studentData: CreateStudentDto): Promise<Student> {
  return fetchApi<Student>("/students", { method: "POST", body: studentData });
}

export async function updateStudent(id: string, studentUpdateData: UpdateStudentDto): Promise<Student> {
  return fetchApi<Student>(`/students/${id}`, { method: "PUT", body: studentUpdateData });
}

export async function deleteStudent(id: string): Promise<void> {
  await fetchApi<null>(`/students/${id}`, { method: "DELETE" });
}

// Results
export async function getResults(): Promise<Result[]> {
  return fetchApi<Result[]>("/results");
}

export async function getResultsByStudentId(studentId: string): Promise<Result[]> {
  return fetchApi<Result[]>(`/results/student/${studentId}`);
}

export async function getResultsBySemester(semester: string): Promise<Result[]> {
  const encodedSemester = encodeURIComponent(semester); // Handle spaces, e.g., "2023-Fall"
  return fetchApi<Result[]>(`/results/semester/${encodedSemester}`);
}

export async function createResult(resultData: CreateResultDto): Promise<Result> {
  return fetchApi<Result>("/results", { method: "POST", body: resultData });
}

export async function updateResult(id: number, resultUpdateData: UpdateResultDto): Promise<Result> {
  return fetchApi<Result>(`/results/${id}`, { method: "PUT", body: resultUpdateData });
}

export async function deleteResult(id: number): Promise<void> {
  await fetchApi<null>(`/results/${id}`, { method: "DELETE" });
}

// Subjects
export async function getSubjects(): Promise<Subject[]> {
  return fetchApi<Subject[]>("/subjects");
}

export async function getSubjectByCode(code: string): Promise<Subject> {
  const encodedCode = encodeURIComponent(code); // Handle special characters
  return fetchApi<Subject>(`/subjects/${encodedCode}`);
}

export async function createSubject(subjectData: CreateSubjectDto): Promise<Subject> {
  return fetchApi<Subject>("/subjects", { method: "POST", body: subjectData });
}

export async function updateSubject(code: string, subjectUpdateData: UpdateSubjectDto): Promise<Subject> {
  const encodedCode = encodeURIComponent(code);
  return fetchApi<Subject>(`/subjects/${encodedCode}`, { method: "PUT", body: subjectUpdateData });
}

export async function deleteSubject(code: string): Promise<void> {
  const encodedCode = encodeURIComponent(code);
  await fetchApi<null>(`/subjects/${encodedCode}`, { method: "DELETE" });
}

// Uploads
export async function getRecentUploads(limit: number = 5): Promise<Upload[]> {
  return fetchApi<Upload[]>(`/uploads?limit=${limit}`);
}

export async function uploadResultsCSV(formData: FormData): Promise<UploadResponse> {
  return fetchApi<UploadResponse>("/uploads/results/csv", {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });
}

// Analytics
export async function getAnalyticsStats(): Promise<AnalyticsStatsDto> {
  return fetchApi<AnalyticsStatsDto>("/analytics/admin");
}

// Reports
export async function getSemesterReportHtml(semester: string): Promise<string> {
  const encodedSemester = encodeURIComponent(semester); // Handle spaces, e.g., "2023-Fall"
  return fetchHtml(`/reports/semester/${encodedSemester}`, { method: "GET" });
}

// --- Export Types ---
