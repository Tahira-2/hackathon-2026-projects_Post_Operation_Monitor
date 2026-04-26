import { useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import type { TimeSlot } from '../../types/availability.types';

interface SlotSelectorProps {
  slots: TimeSlot[];
  loading?: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlot: TimeSlot | null;
}

export default function SlotSelector({
  slots,
  loading = false,
  selectedDate,
  onDateChange,
  onSlotSelect,
  selectedSlot,
}: SlotSelectorProps) {
  // Generate next 14 days
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const changeDate = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    
    // Prevent going before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate >= today) {
      onDateChange(newDate);
    }
  };

  const isSameDate = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const isSelected = (slot: TimeSlot) => {
    return selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon size={18} className="text-primary-600" />
            Select a Date
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => changeDate(-1)}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm font-medium w-28 text-center">
              {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => changeDate(1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Date Strip */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
          {availableDates.map((date, i) => {
            const active = isSameDate(date, selectedDate);
            return (
              <button
                key={i}
                onClick={() => onDateChange(date)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-[60px] h-[72px] rounded-xl border transition-all ${
                  active 
                    ? 'border-primary-600 bg-primary-600 text-white shadow-md' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50'
                }`}
                style={{ scrollSnapAlign: 'start' }}
              >
                <span className={`text-xs font-medium mb-1 ${active ? 'text-primary-100' : 'text-gray-400'}`}>
                  {date.toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <span className={`text-lg font-bold ${active ? 'text-white' : 'text-gray-900'}`}>
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Clock size={18} className="text-primary-600" />
          Available Times
        </h3>
        
        {loading ? (
          <div className="py-8 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p>Loading availability...</p>
          </div>
        ) : slots.length === 0 ? (
          <Card className="bg-gray-50 border-dashed border-gray-200">
            <CardContent className="py-8 text-center">
              <p className="text-gray-500 text-sm">No available slots on this date.</p>
              <Button variant="ghost" className="mt-2 text-primary-600 h-auto p-0" onClick={() => changeDate(1)}>
                Check next available day →
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {slots.map((slot, i) => {
              const active = isSelected(slot);
              return (
                <button
                  key={i}
                  onClick={() => onSlotSelect(slot)}
                  className={`py-2.5 px-1 rounded-lg text-sm font-medium border transition-all ${
                    active
                      ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {formatTime(slot.start)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
