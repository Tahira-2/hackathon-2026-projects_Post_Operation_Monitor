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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Edit2, Mail, User as UserIcon } from "lucide-react";

export function Profile() {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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
      setIsEditDialogOpen(false);
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
    <div className="flex-1 space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account information and preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Personal Details Card (Read-only View) */}
        <Card className="border-none shadow-md shadow-slate-200/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
            <div>
              <CardTitle className="text-xl">Personal Details</CardTitle>
              <CardDescription>Your basic account information.</CardDescription>
            </div>
            <Button 
              onClick={() => setIsEditDialogOpen(true)}
              variant="outline" 
              className="rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 gap-2"
            >
              <Edit2 className="h-4 w-4" /> Edit Profile
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Full Name</p>
                  <p className="font-semibold text-slate-900">{profileData?.fullName || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="font-semibold text-slate-900">{profileData?.email || "Not set"}</p>
                </div>
              </div>

              {isDoctor && profileData?.doctor?.specialization && (
                <div className="flex items-start gap-4 md:col-span-2 pt-4 border-t border-slate-50">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Medical Specialization</p>
                    <p className="font-semibold text-slate-900">{profileData.doctor.specialization.name}</p>
                    {profileData.doctor.specialization.description && (
                      <p className="text-sm text-muted-foreground mt-1">{profileData.doctor.specialization.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-emerald-600 px-8 py-10 text-white relative">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                 <UserIcon className="h-28 w-28" />
               </div>
               <DialogHeader className="relative z-10">
                 <DialogTitle className="text-3xl font-bold tracking-tight">Edit Profile</DialogTitle>
                 <DialogDescription className="text-emerald-50 opacity-90 text-base mt-2">
                   Update your personal information and security credentials.
                 </DialogDescription>
               </DialogHeader>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 pt-10 pb-8 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="fullName" className="text-sm font-bold text-slate-700 ml-1">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    className="h-12 rounded-2xl border-slate-200 focus:ring-emerald-500/20 bg-slate-50/50 px-4"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="h-12 rounded-2xl border-slate-200 focus:ring-emerald-500/20 bg-slate-50/50 px-4"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">New Password (Optional)</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="h-12 rounded-2xl border-slate-200 focus:ring-emerald-500/20 bg-slate-50/50 px-4"
                    placeholder="Leave blank to keep unchanged"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-4">
                <DialogFooter className="gap-3 sm:gap-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="rounded-2xl h-12 px-6 font-semibold text-slate-600 hover:bg-slate-100"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 min-w-[160px] font-bold shadow-lg shadow-emerald-600/20" 
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>

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
