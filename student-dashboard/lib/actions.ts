"use server" // Keep directive if called from Server Components/Forms

import { revalidatePath } from "next/cache";
// REMOVE: import { executeQuery } from "@/lib/db";
// REMOVE: import type { Result, Subject } from "@/lib/db";

// Import API service functions and DTO types
import {
    createStudent as apiCreateStudent,
    updateStudent as apiUpdateStudent,
    createResult as apiCreateResult,
    updateResult as apiUpdateResult,
    createSubject as apiCreateSubject,
    // deleteStudent, deleteResult, deleteSubject, // Import if needed
    type CreateStudentDto,
    type UpdateStudentDto,
    type CreateResultDto,
    type UpdateResultDto,
    type CreateSubjectDto,
    // type UpdateSubjectDto,
} from "@/lib/api-service";

// Note: These actions will now implicitly use the logged-in user's token
// because api-service calls will include it. However, they run on the server,
// so accessing the session might require `auth()` from next-auth if used here directly.
// Calling api-service functions which internally use getSession() might not work reliably
// in Server Actions without extra setup. Consider if these should be client-side calls instead
// or if api-service needs adapting for server-side token retrieval.
// **For now, assuming api-service works server-side or calls are made client-side.**

// Student actions
export async function createStudentAction(formData: FormData) {
    // Extract data and build the DTO expected by the API service
    const studentData: CreateStudentDto = {
        id: formData.get("id") as string, // Assuming form provides ID
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        department: formData.get("department") as string,
        year: Number.parseInt(formData.get("year") as string),
        profileImage: formData.get("profileImage") as string | undefined, // Handle optional
    };

    // Validate data if needed before sending
    if (!studentData.id || !studentData.name || !studentData.email || !studentData.department || isNaN(studentData.year)) {
        return { success: false, error: "Missing required student fields." };
    }

    try {
        await apiCreateStudent(studentData); // Call the API service function

        revalidatePath("/admin/students"); // Revalidate cache after success
        return { success: true };
    } catch (error: any) {
        console.error("Error creating student via API:", error);
        return { success: false, error: error.message || "Failed to create student" };
    }
}

export async function updateStudentAction(formData: FormData) {
    const id = formData.get("id") as string;
    if (!id) {
        return { success: false, error: "Student ID is missing for update." };
    }

    // Build the update DTO - only include fields that might change
    const studentUpdateData: UpdateStudentDto = {
        name: formData.get("name") as string | undefined,
        email: formData.get("email") as string | undefined,
        department: formData.get("department") as string | undefined,
        year: formData.has("year") ? Number.parseInt(formData.get("year") as string) : undefined,
        status: formData.get("status") as string | undefined,
        profileImage: formData.has("profileImage") ? formData.get("profileImage") as string : undefined,
    };

    // Clean undefined values if necessary, depending on how backend handles nulls
    Object.keys(studentUpdateData).forEach(key => studentUpdateData[key as keyof UpdateStudentDto] === undefined && delete studentUpdateData[key as keyof UpdateStudentDto]);

    if (Object.keys(studentUpdateData).length === 0) {
         return { success: true, message: "No changes detected." }; // Nothing to update
    }


    try {
        await apiUpdateStudent(id, studentUpdateData); // Call the API service function

        revalidatePath("/admin/students");
        revalidatePath(`/admin/students/${id}`); // Revalidate specific student page
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating student ${id} via API:`, error);
        return { success: false, error: error.message || "Failed to update student" };
    }
}

// Result actions
export async function createResultAction(formData: FormData) {
    const resultData: CreateResultDto = {
        studentId: formData.get("studentId") as string,
        semester: formData.get("semester") as string,
        subjectCode: formData.get("subjectCode") as string,
        subjectName: formData.get("subjectName") as string, // Backend might ignore this
        marks: Number.parseFloat(formData.get("marks") as string),
        grade: formData.get("grade") as string,
    };

     // Basic validation
     if (!resultData.studentId || !resultData.semester || !resultData.subjectCode || isNaN(resultData.marks) || !resultData.grade) {
        return { success: false, error: "Missing required result fields." };
     }


    try {
        await apiCreateResult(resultData); // Call API

        revalidatePath("/admin/results");
        revalidatePath(`/admin/students/${resultData.studentId}`); // Revalidate student detail page
        return { success: true };
    } catch (error: any) {
        console.error("Error creating result via API:", error);
        return { success: false, error: error.message || "Failed to create result" };
    }
}

export async function updateResultAction(formData: FormData) {
    const id = Number.parseInt(formData.get("id") as string);
    if (isNaN(id)) {
        return { success: false, error: "Result ID is missing or invalid for update." };
    }
    const studentId = formData.get("studentId") as string; // Needed for revalidation

    const resultUpdateData: UpdateResultDto = {
        marks: Number.parseFloat(formData.get("marks") as string),
        grade: formData.get("grade") as string,
    };

     if (isNaN(resultUpdateData.marks) || !resultUpdateData.grade) {
        return { success: false, error: "Missing required fields for result update (marks, grade)." };
     }

    try {
        await apiUpdateResult(id, resultUpdateData); // Call API

        revalidatePath("/admin/results");
        if (studentId) {
             revalidatePath(`/admin/students/${studentId}`); // Revalidate student detail page
        }
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating result ${id} via API:`, error);
        return { success: false, error: error.message || "Failed to update result" };
    }
}

// Remove updateStudentGPA helper - it's now done in Spring Boot

// Subject actions
export async function createSubjectAction(formData: FormData) {
     const subjectData: CreateSubjectDto = {
        code: formData.get("code") as string,
        name: formData.get("name") as string,
        department: formData.get("department") as string,
        credits: Number.parseInt(formData.get("credits") as string),
     };

     if (!subjectData.code || !subjectData.name || !subjectData.department || isNaN(subjectData.credits)) {
        return { success: false, error: "Missing required subject fields." };
     }

    try {
        await apiCreateSubject(subjectData); // Call API

        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating subject via API:", error);
        return { success: false, error: error.message || "Failed to create subject" };
    }
}

// --- REMOVE Upload Actions ---
// createUpload is now handled implicitly by the backend during CSV processing
// uploadResultsFromCSV logic is ENTIRELY handled by the backend /api/uploads/results/csv endpoint.
// The frontend just needs to call uploadResultsCSV from api-service.ts with the FormData.
// export async function createUpload(formData: FormData) { ... REMOVE ... }
// export async function uploadResultsFromCSV(formData: FormData) { ... REMOVE ... }