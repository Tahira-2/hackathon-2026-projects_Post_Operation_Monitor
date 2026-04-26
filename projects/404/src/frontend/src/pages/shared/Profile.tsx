import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetUserQuery, useUpdateUserMutation } from "@/apis/usersApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Clock, CalendarIcon } from "lucide-react";
import { useGetWorkingHoursQuery, useGetBusyBlocksQuery } from "@/apis/availabilityApi";
import { format } from "date-fns";

export function Profile() {
  const { user } = useAuth();
  
  // Only query if we have an active ID
  const { data: profileData, isLoading, refetch } = useGetUserQuery(user?.id ?? "", {
    skip: !user?.id,
  });

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const doctorId = profileData?.doctor?.id;
  const { data: workingHours } = useGetWorkingHoursQuery({ doctorId }, { skip: !doctorId });
  const { data: busyBlocks } = useGetBusyBlocksQuery({ doctorId }, { skip: !doctorId });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        password: "", // Never populate password
      });
    }
  }, [profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
      };

      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      await updateUser({ id: user.id, body: payload }).unwrap();
      
      // Clear password field after successful update
      if (payload.password) {
        setFormData(prev => ({ ...prev, password: "" }));
      }
      
      toast.success("Profile updated successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Failed to update profile details.");
    }
  };

  const isDoctor = profileData?.role === "DOCTOR";

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground text-sm">Manage your account information and preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>
              Update your basic profile information and security credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password (Optional)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {isDoctor && profileData?.doctor?.specialization && (
                <div className="pt-4 space-y-4 border-t">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Medical Focus</Label>
                    <div className="flex items-center gap-2">
                       <span className="font-semibold text-primary">{profileData.doctor.specialization.name}</span>
                    </div>
                    {profileData.doctor.specialization.description && (
                      <p className="text-sm text-muted-foreground">{profileData.doctor.specialization.description}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {isDoctor && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border shadow-none bg-background">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Standard Weekly Hours</CardTitle>
                </div>
                <CardDescription>Your default consulting hours for each weekday.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => {
                    const hour = workingHours?.find((h: any) => h.day === day);
                    return (
                      <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="text-sm font-medium capitalize">{day.toLowerCase()}</span>
                        {hour ? (
                          <span className="text-sm text-muted-foreground">{hour.startTime} - {hour.endTime}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Off Duty</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-none bg-background">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Active Blocks</CardTitle>
                </div>
                <CardDescription>Upcoming breaks or blocked time slots.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y border-t max-h-[350px] overflow-y-auto">
                  {!busyBlocks || busyBlocks.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground italic">
                      No active blocks scheduled.
                    </div>
                  ) : (
                    busyBlocks.map((block: any) => (
                      <div key={block.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <p className="text-sm font-semibold">{block.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(block.startTime), "PPp")} - {format(new Date(block.endTime), "p")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
