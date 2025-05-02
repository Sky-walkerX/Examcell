import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerformanceChart } from "@/components/performance-chart"

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Performance Analytics</h2>
      </div>

      <Tabs defaultValue="gpa" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="gpa">GPA Trend</TabsTrigger>
          <TabsTrigger value="subjects">Subject Distribution</TabsTrigger>
        </TabsList>
        <TabsContent value="gpa" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>GPA Trend Analysis</CardTitle>
              <CardDescription>Your GPA progression across semesters</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart type="line" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="subjects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance Distribution</CardTitle>
              <CardDescription>Your performance across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart type="pie" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
