import { CheckCircle2, Clock, Star, ArrowLeft, Download, Pill, Activity, Loader2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetSummaryQuery, useApplyMedicationsMutation } from "@/apis/transcriptApi";
import { cn } from "@/lib/utils";

interface CallEndedScreenProps {
  callDuration: number;
  formatDuration: (s: number) => string;
  providerName?: string;
  callSessionId?: string | null;
  onGoBack?: () => void;
}

export function CallEndedScreen({
  callDuration,
  formatDuration,
  providerName = "Dr. Sarah Mitchell",
  callSessionId,
  onGoBack,
}: CallEndedScreenProps) {
  const { data: summary, isLoading: isLoadingSummary } = useGetSummaryQuery(callSessionId ?? "", {
    skip: !callSessionId,
    pollingInterval: summary?.summary ? 0 : 3000, // Poll until summary is generated
  });

  const [applyMedications, { isLoading: isApplying }] = useApplyMedicationsMutation();

  const handleApply = async () => {
    if (!callSessionId) return;
    try {
      await applyMedications(callSessionId).unwrap();
    } catch (err) {
      console.error("Failed to apply medications", err);
    }
  };

  return (
    <div className="consultation-bg min-h-screen flex items-center justify-center p-6 py-12">
      <div className="consultation-card max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="consultation-icon-ring consultation-icon-ring--success">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Consultation Complete</h1>
          <p className="text-slate-400">
            Your session with <span className="text-emerald-400 font-semibold">{providerName}</span> has ended successfully.
          </p>
        </div>

        {/* Stats & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="consultation-info-card flex flex-col justify-center items-center py-6">
            <Clock className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-2xl font-mono font-bold text-white">{formatDuration(callDuration)}</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Duration</p>
          </div>

          <div className="md:col-span-2 consultation-info-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Generated Insights
              </h3>
              {isLoadingSummary && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
            </div>

            {!summary && !isLoadingSummary ? (
              <p className="text-slate-500 text-sm italic">Processing transcript...</p>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-500/80 uppercase">Follow-up Instructions</p>
                  <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
                    {summary?.followUp || summary?.summary || "No specific instructions detected."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
                      <Pill className="w-3 h-3" /> Detected Medications
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {summary?.medications?.map((m, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                          {m}
                        </span>
                      )) || <span className="text-slate-600 text-[11px]">None detected</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Medication Application Action */}
        {summary?.medications && summary.medications.length > 0 && (
          <div className={cn(
            "p-4 rounded-2xl border transition-all duration-500 flex items-center justify-between gap-4",
            summary.isMedicationApplied 
              ? "bg-emerald-500/10 border-emerald-500/30" 
              : "bg-slate-800/50 border-slate-700 hover:border-emerald-500/50"
          )}>
            <div className="flex items-center gap-3 text-left">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                summary.isMedicationApplied ? "bg-emerald-500" : "bg-emerald-500/20"
              )}>
                {summary.isMedicationApplied ? <Check className="w-6 h-6 text-white" /> : <Pill className="w-6 h-6 text-emerald-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {summary.isMedicationApplied ? "Medications Applied" : "Apply Prescribed Medications"}
                </p>
                <p className="text-xs text-slate-400">
                  {summary.isMedicationApplied 
                    ? "These have been added to your medical records." 
                    : "Add the detected medications to your active treatment plan."}
                </p>
              </div>
            </div>
            {!summary.isMedicationApplied && (
              <Button 
                onClick={handleApply}
                disabled={isApplying}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 font-bold shadow-lg shadow-emerald-900/20"
              >
                {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Now"}
              </Button>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="space-y-3">
          <p className="text-sm text-slate-400">How was your experience today?</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                id={`rating-star-${star}`}
                className="text-slate-700 hover:text-amber-400 transition-colors focus:outline-none"
              >
                <Star className="w-7 h-7 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl w-full"
            id="download-summary-btn"
            onClick={() => {}}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            onClick={onGoBack}
            id="go-back-btn"
            className="bg-slate-200 hover:bg-white text-slate-900 rounded-xl w-full font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
