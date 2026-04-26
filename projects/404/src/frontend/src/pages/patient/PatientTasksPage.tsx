import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import TaskItem from '../../components/patient/TaskItem';

export default function PatientTasksPage() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Check blood pressure', category: 'lifestyle' as const, completed: false, desc: 'Record your morning reading' },
    { id: '2', title: 'Schedule follow-up', category: 'follow-up' as const, completed: false, desc: 'Book appointment with Dr. Smith' },
    { id: '3', title: 'Drink 2L water', category: 'lifestyle' as const, completed: true },
    { id: '4', title: 'Review lab results', category: 'lab' as const, completed: false, desc: 'Check the portal for recent CBC results' },
  ]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Care Tasks</h1>
        <p className="text-gray-500 mt-1">Your prescribed health plan action items.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">To Do ({activeTasks.length})</h2>
          {activeTasks.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <CheckSquare size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium">All caught up!</p>
            </div>
          ) : (
            activeTasks.map(task => (
              <TaskItem
                key={task.id}
                title={task.title}
                description={task.desc}
                category={task.category}
                completed={task.completed}
                onToggle={() => toggleTask(task.id)}
              />
            ))
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 text-opacity-50">Completed</h2>
            <div className="opacity-75">
              {completedTasks.map(task => (
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
        )}
      </div>
    </div>
  );
}
