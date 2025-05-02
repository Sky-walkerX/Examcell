"use client"

import type React from "react" // Keep type import

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "next-auth/react" // Import signIn from NextAuth

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [userType, setUserType] = useState("admin") // Default to admin or student as appropriate
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null) // State to hold login errors

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // Call NextAuth's signIn function with the 'credentials' provider
      // Pass the email, password, and role (userType)
      const result = await signIn('credentials', {
        redirect: false, // Handle redirection manually based on the result
        email: email,
        password: password,
        role: userType, // Send the selected userType as 'role'
      });

      // Check the result from signIn
      if (result?.error) {
        // If there's an error message from the authorize function or NextAuth
        console.error("SignIn Error:", result.error);
        throw new Error(result.error);
      }

      if (result?.ok && !result?.error) {
        // Login successful
        toast({
          title: "Login Successful",
          description: `Welcome back! Redirecting to your dashboard...`,
        });

        // Redirect based on user type AFTER successful login
        // (The role should ideally be confirmed by the token/session later,
        // but redirecting based on form selection is okay for now)
        if (userType === "student") {
          router.push("/student/dashboard"); // Adjust path if needed
        } else {
          router.push("/admin/dashboard"); // Adjust path if needed
        }
        // Optional: Refresh the page/router state if session data needs updating immediately
        // router.refresh();

      } else {
        // Handle unexpected cases where result is ok=false but no specific error
        throw new Error("Login failed. Please check your credentials.");
      }

    } catch (err: any) {
        // Catch errors thrown from signIn or within the try block
        const errorMessage = err.message || "An unknown error occurred during login.";
        console.error("Login Submit Error:", errorMessage);
        setError(errorMessage); // Set error state to display message
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
    } finally {
      // Always stop loading indicator
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        {/* Header content remains the same */}
        <div className="flex items-center justify-center mb-2">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center font-bold">Welcome Back</CardTitle>
        <CardDescription className="text-center">Sign in to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit}> {/* Ensure form calls handleSubmit */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="admin@example.com" // Update placeholder if needed
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                disabled={loading} // Disable input while loading
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                required
                type="password"
                value={password}
                placeholder="••••••••" // Add placeholder
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                disabled={loading} // Disable input while loading
              />
            </div>
            <div className="space-y-2">
              <Label>Login as</Label>
              <RadioGroup
                defaultValue={userType} // Use state for defaultValue
                className="flex space-x-4"
                onValueChange={(value) => !loading && setUserType(value)} // Prevent change while loading
                value={userType}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" disabled={loading}/>
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" disabled={loading}/>
                  <Label htmlFor="admin">Admin</Label>
                </div>
              </RadioGroup>
            </div>
             {/* Display error message below inputs */}
             {error && (
                <p className="text-sm font-medium text-destructive text-center">
                    {error}
                </p>
             )}
            <Button
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              type="submit"
              disabled={loading} // Disable button while loading
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" className="text-sm text-muted-foreground">
          Forgot your password?
        </Button>
      </CardFooter>
    </Card>
  )
}