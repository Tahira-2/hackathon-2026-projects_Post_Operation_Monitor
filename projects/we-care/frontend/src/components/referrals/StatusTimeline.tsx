import { History } from 'lucide-react'

export interface TimelineEvent {
  label: string
  timestamp: string
  completed: boolean
}

interface StatusTimelineProps {
  events: TimelineEvent[]
}

export function StatusTimeline({ events }: StatusTimelineProps) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <History size={16} className="text-muted" />
        <h3 className="font-semibold text-primary">Status Timeline</h3>
      </div>
      <div className="px-5 py-4">
        <ol className="space-y-0">
          {events.map((event, i) => (
            <li key={event.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'h-4 w-4 shrink-0 rounded-full border-2 mt-0.5',
                    event.completed
                      ? 'border-accent bg-accent'
                      : 'border-border bg-surface',
                  ].join(' ')}
                />
                {i < events.length - 1 && (
                  <div className="w-px flex-1 bg-border my-1" />
                )}
              </div>
              <div className="pb-4">
                <p className={`text-sm font-medium ${event.completed ? 'text-primary' : 'text-muted'}`}>
                  {event.label}
                </p>
                <p className="text-xs text-muted mt-0.5">{event.timestamp}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
