import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight, Trophy, Activity, CheckCircle2 } from 'lucide-react';

export default function SessionReport({ results, bodyEvaluation, onSubmit }) {
  // Sort data so the chart renders properly (descending)
  const data = bodyEvaluation?.body_part_scores?.map(item => ({
    name: item.part.charAt(0).toUpperCase() + item.part.slice(1),
    score: item.score
  })) || [];

  // Define colors based on score using theme tokens
  const getColor = (score) => {
    if (score >= 90) return '#4CAF50'; // var(--color-success)
    if (score >= 75) return '#1E88E5'; // var(--color-primary)
    if (score >= 60) return '#FFA000'; // var(--color-warning)
    return '#D32F2F'; // var(--color-danger)
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-700">
      <div className="elevated-card bg-white p-10 shadow-2xl relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-6">
            <Trophy className="h-10 w-10 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-4xl font-extrabold text-[var(--color-secondary)] tracking-tight mb-3">Session Complete!</h2>
          <p className="text-[var(--color-text-muted)] text-lg font-medium">Excellent progress. Your recovery data is analyzed and ready.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10 mb-10">
          {/* Left Col: Exercise Summary */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-[var(--color-primary)]" />
              <h3 className="text-lg font-bold text-[var(--color-secondary)]">Exercise Performance</h3>
            </div>
            <div className="space-y-4">
              {results.map((r, idx) => (
                <div key={idx} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]"></div>
                    <span className="font-bold text-[var(--color-text)]">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-[var(--color-text-muted)] tracking-widest">Reps</p>
                      <p className="text-lg font-black text-[var(--color-primary)]">{r.reps}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-[var(--color-text-muted)] tracking-widest">Accuracy</p>
                      <p className="text-lg font-black text-[var(--color-success)]">{r.accuracy}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Body Evaluation Chart */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--color-primary)]" />
              <h3 className="text-lg font-bold text-[var(--color-secondary)]">Movement Analysis</h3>
            </div>
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col h-full min-h-[300px]">
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#607D8B', fontSize: 12, fontWeight: 700 }} 
                      width={80}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(30, 136, 229, 0.05)'}} 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #ECEFF1', 
                        borderRadius: '1rem',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={24}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-[10px] font-black text-[var(--color-text-muted)] mt-6 uppercase tracking-widest">Biomechanical Stability Score</p>
            </div>
          </div>
        </div>

        <button
          onClick={onSubmit}
          className="btn-primary w-full py-5 rounded-2xl text-xl shadow-xl shadow-blue-200 flex items-center justify-center gap-4 transition-all hover:scale-[1.01]"
        >
          <span>Share Results with Doctor</span>
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}

