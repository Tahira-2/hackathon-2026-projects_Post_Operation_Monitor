import { useState } from 'react';
import CareProgressCard from '../../components/patient/CareProgressCard';
import TaskItem from '../../components/patient/TaskItem';
import MedicationItem from '../../components/patient/MedicationItem';
import { Card, CardContent } from '../../components/ui/Card';
import { AlertCircle } from 'lucide-react';

export default function PatientHomePage() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Check blood pressure', category: 'lifestyle' as const, completed: false, desc: 'Record your morning reading' },
    { id: '2', title: 'Schedule follow-up', category: 'follow-up' as const, completed: false, desc: 'Book appointment with Dr. Smith' },
    { id: '3', title: 'Drink 2L water', category: 'lifestyle' as const, completed: true },
  ]);

  const completedCount = tasks.filter(t => t.completed).length;

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Good morning.</h1>
        <p className="text-gray-500 mt-1">Here is what you need to focus on today.</p>
      </div>

      <CareProgressCard 
        completedTasks={completedCount} 
        totalTasks={tasks.length} 
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Next up tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Action Items
            </h2>
          </div>
          
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                title={task.title}
                description={task.desc}
                category={task.category}
                completed={task.completed}
                onToggle={() => toggleTask(task.id)}
              />
            ))}
          </div>
        </div>

        {/* Medications & Reminders */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Next Medications</h2>
          
          <div className="space-y-3">
            <MedicationItem
              name="Lisinopril"
              dosage="10mg"
              timing="8:00 AM"
              status="taken"
            />
            <MedicationItem
              name="Metformin"
              dosage="500mg"
              timing="1:00 PM"
              instructions="Take with food to prevent upset stomach."
              status="due"
            />
          </div>

          <Card className="bg-orange-50 border-orange-100 mt-6">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900">Lab Results Available</h4>
                <p className="text-sm text-orange-800 mt-1">Your recent blood panel results have been reviewed by Dr. Smith. Please schedule a follow-up.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
