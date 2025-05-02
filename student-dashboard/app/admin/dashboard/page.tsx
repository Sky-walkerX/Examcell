import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminStats } from "@/components/admin-stats"
import { RecentUploads } from "@/components/recent-uploads"
import { StudentList } from "@/components/student-list"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <AdminStats />

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="students">Recent Students</TabsTrigger>
          <TabsTrigger value="uploads">Recent Uploads</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="mt-4">
          <StudentList />
        </TabsContent>
        <TabsContent value="uploads" className="mt-4">
          <RecentUploads />
        </TabsContent>
        <TabsContent value="actions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-4 border border-purple-200 hover:border-purple-400 cursor-pointer transition-colors">
                <div className="font-medium">Upload Results</div>
                <p className="text-sm text-muted-foreground mt-1">Upload new semester results</p>
              </Card>
              <Card className="p-4 border border-blue-200 hover:border-blue-400 cursor-pointer transition-colors">
                <div className="font-medium">Add Student</div>
                <p className="text-sm text-muted-foreground mt-1">Register a new student</p>
              </Card>
              <Card className="p-4 border border-green-200 hover:border-green-400 cursor-pointer transition-colors">
                <div className="font-medium">Create Subject</div>
                <p className="text-sm text-muted-foreground mt-1">Add a new course subject</p>
              </Card>
              <Card className="p-4 border border-amber-200 hover:border-amber-400 cursor-pointer transition-colors">
                <div className="font-medium">Generate Reports</div>
                <p className="text-sm text-muted-foreground mt-1">Create performance reports</p>
              </Card>
              <Card className="p-4 border border-red-200 hover:border-red-400 cursor-pointer transition-colors">
                <div className="font-medium">Manage Exams</div>
                <p className="text-sm text-muted-foreground mt-1">Schedule and manage exams</p>
              </Card>
              <Card className="p-4 border border-indigo-200 hover:border-indigo-400 cursor-pointer transition-colors">
                <div className="font-medium">System Settings</div>
                <p className="text-sm text-muted-foreground mt-1">Configure system parameters</p>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
