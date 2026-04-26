import { useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { WeekDay, WorkingHours, UpsertWorkingHoursRequest } from '../../types/availability.types';

const weekDays: WeekDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

interface WorkingHoursEditorProps {
  workingHours: WorkingHours[];
  onSave: (data: UpsertWorkingHoursRequest) => Promise<void>;
  onDelete: (day: WeekDay) => Promise<void>;
  loading?: boolean;
}

export default function WorkingHoursEditor({ workingHours, onSave, onDelete, loading }: WorkingHoursEditorProps) {
  const [savingDay, setSavingDay] = useState<WeekDay | null>(null);

  const getDayConfig = (day: WeekDay) => {
    return workingHours.find(wh => wh.day === day) || { startTime: '09:00', endTime: '17:00', isActive: false };
  };

  const handleToggleActive = async (day: WeekDay, currentActive: boolean) => {
    if (currentActive) {
      setSavingDay(day);
      await onDelete(day);
      setSavingDay(null);
    } else {
      setSavingDay(day);
      await onSave({ day, startTime: '09:00', endTime: '17:00' });
      setSavingDay(null);
    }
  };

  const handleTimeChange = async (day: WeekDay, field: 'startTime' | 'endTime', value: string) => {
    const current = getDayConfig(day);
    setSavingDay(day);
    await onSave({ 
      day, 
      startTime: field === 'startTime' ? value : current.startTime,
      endTime: field === 'endTime' ? value : current.endTime
    });
    setSavingDay(null);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock size={18} className="text-primary-600" />
          Weekly Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {weekDays.map((day) => {
            const config = workingHours.find(wh => wh.day === day);
            const isActive = !!config;
            const isSaving = savingDay === day || loading;

            return (
              <div key={day} className={`p-4 flex items-center justify-between transition-colors ${isActive ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4 w-1/3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isActive}
                      onChange={() => handleToggleActive(day, isActive)}
                      disabled={isSaving}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </span>
                </div>

                {isActive ? (
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <input
                      type="time"
                      value={config.startTime}
                      onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                      disabled={isSaving}
                      className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={config.endTime}
                      onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                      disabled={isSaving}
                      className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                    {isSaving && <Loader2 size={16} className="text-primary-600 animate-spin ml-2" />}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">Unavailable</div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
