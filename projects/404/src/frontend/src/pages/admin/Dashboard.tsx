import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Overview</h2>
        <p className="text-muted-foreground">Manage your hospital units and system statistics.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,543</div>
            <p className="text-xs text-muted-foreground">+201 since last month</p>
          </CardContent>
        </Card>
        <Card className="transition-all border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Physicians</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">+3 since last month</p>
          </CardContent>
        </Card>
        <Card className="transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">482</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card className="transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">99.9%</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of recent platform actions</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t bg-muted/10">
            <p className="text-muted-foreground">Activity chart placeholder</p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>2 unread notifications</CardDescription>
          </CardHeader>
          <CardContent className="border-t pt-4">
             <div className="space-y-4">
               <div className="flex flex-col border-l-2 border-destructive pl-4 text-sm">
                 <span className="font-semibold text-foreground">Server Load High</span>
                 <span className="text-muted-foreground">Node cluster 4 is experiencing high traffic.</span>
                 <span className="text-xs text-muted-foreground mt-1">10 min ago</span>
               </div>
               <div className="flex flex-col border-l-2 border-primary pl-4 text-sm">
                 <span className="font-semibold text-foreground">New Application Update</span>
                 <span className="text-muted-foreground">Version 4.2 has been deployed successfully.</span>
                 <span className="text-xs text-muted-foreground mt-1">2 hours ago</span>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
