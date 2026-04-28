import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

interface NewReferralStep1Props {
  onExtract: (note: string) => void;
  loading: boolean;
}

export function NewReferralStep1({
  onExtract,
  loading,
}: NewReferralStep1Props) {
  const [note, setNote] = useState("");

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold text-primary">Clinical Notes</h3>
        <p className="text-sm text-muted mt-0.5">
          Provide detailed patient condition context to help AI extract relevant
          entities.
        </p>
      </div>

      <div className="p-6">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe the patient condition, relevant medical history, and reason for referral..."
          rows={10}
          className="w-full resize-none rounded-lg border border-border bg-base px-4 py-3 text-sm text-primary placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
        />
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
        <Button variant="ghost" size="md" disabled={loading}>
          Save Draft
        </Button>
        <Button
          size="md"
          disabled={!note.trim()}
          loading={loading}
          onClick={() => onExtract(note)}
          className="bg-ai hover:bg-purple-700"
        >
          <Sparkles size={15} />
          Extract with AI
        </Button>
      </div>
    </div>
  );
}
