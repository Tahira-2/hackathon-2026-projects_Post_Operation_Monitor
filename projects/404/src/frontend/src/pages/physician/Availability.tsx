import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useGetWorkingHoursQuery, 
  useUpsertWorkingHoursMutation,
  useDeleteWorkingHoursMutation,
  useGetBusyBlocksQuery,
  useCreateBusyBlockMutation,
  useDeleteBusyBlockMutation
} from "@/apis/availabilityApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Clock, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

export function Availability() {
  const { user } = useAuth();
  const doctorId = user?.doctor?.id;

  const { data: workingHours, isLoading: loadingHours } = useGetWorkingHoursQuery(
    { doctorId },
    { skip: !doctorId }
  );
  
  const { data: busyBlocks, isLoading: loadingBlocks, refetch: refetchBlocks } = useGetBusyBlocksQuery(
    { doctorId },
    { skip: !doctorId }
  );

  const [upsertWorkingHours] = useUpsertWorkingHoursMutation();
  const [deleteWorkingHours] = useDeleteWorkingHoursMutation();
  const [createBusyBlock, { isLoading: isCreatingBlock }] = useCreateBusyBlockMutation();
  const [deleteBusyBlock] = useDeleteBusyBlockMutation();

  const [busyBlockForm, setBusyBlockForm] = useState({
    startTime: "",
    endTime: "",
    type: "BREAK",
    reason: "",
  });

  const handleToggleDay = async (day: string, checked: boolean) => {
    if (!doctorId) return;
    try {
      if (checked) {
        // Default 9-5 for new working hours
        await upsertWorkingHours({ 
          doctorId, 
          day, 
          startTime: "09:00", 
          endTime: "17:00" 
        }).unwrap();
        toast.success(`Working hours added for ${day}`);
      } else {
        await deleteWorkingHours({ day, doctorId }).unwrap();
        toast.success(`Working hours removed for ${day}`);
      }
    } catch (err) {
      toast.error("Failed to update working hours");
    }
  };

  const handleTimeChange = async (day: string, type: "startTime" | "endTime", value: string) => {
    if (!doctorId) return;
    const existing = workingHours?.find((h: any) => h.day === day);
    if (!existing) return;

    try {
      await upsertWorkingHours({
        doctorId,
        day,
        startTime: type === "startTime" ? value : existing.startTime,
        endTime: type === "endTime" ? value : existing.endTime,
      }).unwrap();
      toast.success("Time updated");
    } catch (err) {
      toast.error("Failed to update time");
    }
  };

  const handleCreateBusyBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) return;

    // Validate that the block is within working hours
    const startObj = new Date(busyBlockForm.startTime);
    const endObj = new Date(busyBlockForm.endTime);
    const dayName = DAYS[startObj.getDay() === 0 ? 6 : startObj.getDay() - 1]; // Convert JS 0-6 to MONDAY-SUNDAY index
    const workingHour = workingHours?.find((h: any) => h.day === dayName);

    if (!workingHour) {
      toast.error(`You are off duty on ${dayName.toLowerCase()}. Cannot schedule blocks.`);
      return;
    }

    const startStr = format(startObj, "HH:mm");
    const endStr = format(endObj, "HH:mm");
    // Check for duplicate blocks using timestamps for robustness
    const formStart = startObj.getTime();
    const formEnd = endObj.getTime();
    
    const isDuplicate = busyBlocks?.some((b: any) => {
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return bStart === formStart && bEnd === formEnd;
    });

    if (isDuplicate) {
      toast.error("A block with the exact same time already exists.");
      return;
    }

    if (startStr < workingHour.startTime || endStr > workingHour.endTime) {
      toast.error(`Block must be between your working hours (${workingHour.startTime} - ${workingHour.endTime}) for ${dayName.toLowerCase()}.`);
      return;
    }
    
    try {
      await createBusyBlock({
        doctorId,
        ...busyBlockForm,
      }).unwrap();
      toast.success("Break block scheduled");
      setBusyBlockForm({ startTime: "", endTime: "", type: "BREAK", reason: "" });
      refetchBlocks();
    } catch (err) {
      toast.error("Failed to schedule break block");
    }
  };

  const handleDeleteBusyBlock = async (id: string) => {
    try {
      await deleteBusyBlock(id).unwrap();
      toast.success("Block removed");
      refetchBlocks();
    } catch (err) {
      toast.error("Failed to remove block");
    }
  };

  const handleQuickAddBlock = (index: number) => {
    const jsDay = index === 6 ? 0 : index + 1; // 0 is Sunday, 1 is Monday ... 6 is Saturday
    const today = new Date();
    const resultDate = new Date(today);
    
    // Calculate days until next occurrence
    const currentDay = today.getDay();
    const daysToAdd = (jsDay + 7 - currentDay) % 7;
    
    resultDate.setDate(today.getDate() + (daysToAdd === 0 ? 7 : daysToAdd)); // If it's today, pick next week
    resultDate.setHours(12, 0, 0, 0); // Default to noon
    
    const endResultDate = new Date(resultDate);
    endResultDate.setHours(13, 0, 0, 0); // Default 1 hour block

    setBusyBlockForm({
      startTime: format(resultDate, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(endResultDate, "yyyy-MM-dd'T'HH:mm"),
      type: "BREAK",
      reason: "Break",
    });

    toast.info("Scheduling form pre-filled for this day.");
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (loadingHours || loadingBlocks) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Availability & Schedule</h2>
        <p className="text-muted-foreground text-sm">Configure your weekly working hours and schedule break blocks.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Working Hours */}
        <Card className="flex flex-col border shadow-none bg-background pb-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <CardTitle>Standard Weekly Hours</CardTitle>
            </div>
            <CardDescription>Toggle weekdays to set your default consulting hours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DAYS.map((day, index) => {
              const hour = workingHours?.find((h: any) => h.day === day);
              const isActive = !!hour;

              // Filter blocks for this specific day of the week
              const jsDay = index === 6 ? 0 : index + 1; // Convert MONDAY-SUNDAY index to JS 0-6
              const blocksForDay = busyBlocks?.filter((b: any) => new Date(b.startTime).getDay() === jsDay);

              return (
                <div key={day} className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-4">
                      <Switch 
                        checked={isActive}
                        onCheckedChange={(checked) => handleToggleDay(day, checked)}
                      />
                      <div className="flex items-center gap-2">
                       <span className="text-sm font-medium w-24 capitalize">{day.toLowerCase()}</span>
                       {isActive && (
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-7 w-7 rounded-full text-primary hover:bg-primary/10"
                           onClick={() => handleQuickAddBlock(index)}
                           title={`Add block for ${day.toLowerCase()}`}
                         >
                           <Plus className="h-3.5 w-3.5" />
                         </Button>
                       )}
                    </div>
                  </div>
                    
                    {isActive && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          className="w-[120px] h-9"
                          value={hour.startTime}
                          onChange={(e) => handleTimeChange(day, "startTime", e.target.value)}
                        />
                        <span className="text-muted-foreground text-xs font-bold px-1">to</span>
                        <Input
                          type="time"
                          className="w-[120px] h-9"
                          value={hour.endTime}
                          onChange={(e) => handleTimeChange(day, "endTime", e.target.value)}
                        />
                      </div>
                    )}
                    
                    {!isActive && (
                      <span className="text-xs text-muted-foreground italic">Off Duty</span>
                    )}
                  </div>
                  
                  {/* Daily Blocks List */}
                  {isActive && (
                    <div className="pl-14">
                      {blocksForDay && blocksForDay.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {blocksForDay.map((block: any) => (
                            <div key={block.id} className="flex items-center gap-2 px-2 py-1 bg-destructive/5 border border-destructive/20 rounded-md">
                              <span className="text-[10px] font-medium text-destructive truncate max-w-[100px]">{block.reason}</span>
                              <span className="text-[10px] text-muted-foreground">{format(new Date(block.startTime), "HH:mm")}</span>
                              <button 
                                onClick={() => handleDeleteBusyBlock(block.id)}
                                className="text-destructive hover:scale-110 transition-transform"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic">No blocks for {day.toLowerCase()}s</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Busy Blocks / Breaks */}
        <div className="space-y-6">
          <Card className="border shadow-none bg-background">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <CardTitle>Schedule Block</CardTitle>
              </div>
              <CardDescription>Manually block off specific date ranges for breaks or tasks.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBusyBlock} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Start Date & Time</Label>
                    <Input 
                      type="datetime-local" 
                      required
                      value={busyBlockForm.startTime}
                      onChange={e => setBusyBlockForm(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End Date & Time</Label>
                    <Input 
                      type="datetime-local" 
                      required
                      value={busyBlockForm.endTime}
                      onChange={e => setBusyBlockForm(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Reason (Required)</Label>
                  <Input 
                    placeholder="Lunch break, Personal task, etc." 
                    required
                    value={busyBlockForm.reason}
                    onChange={e => setBusyBlockForm(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreatingBlock}>
                  {isCreatingBlock ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Block
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border shadow-none bg-background">
            <CardHeader>
              <CardTitle className="text-md">Active Blocks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y border-t h-[300px] overflow-y-auto">
                {busyBlocks?.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground italic">
                    No active blocks or breaks scheduled.
                  </div>
                ) : (
                  busyBlocks?.map((block: any) => (
                    <div key={block.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{block.reason}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          {format(new Date(block.startTime), "PPp")} - {format(new Date(block.endTime), "p")}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteBusyBlock(block.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
