import { FileText } from 'lucide-react'

interface ClinicalNoteCardProps {
  note: string
}

export function ClinicalNoteCard({ note }: ClinicalNoteCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <FileText size={16} className="text-muted" />
        <h3 className="font-semibold text-primary">Original Clinical Note</h3>
      </div>
      <div className="p-5">
        <pre className="whitespace-pre-wrap rounded-lg bg-base border border-border px-4 py-3 text-xs text-muted font-sans leading-relaxed">
          {note}
        </pre>
      </div>
    </div>
  )
}
