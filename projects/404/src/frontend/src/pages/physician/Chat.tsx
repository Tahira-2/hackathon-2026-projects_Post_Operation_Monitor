import { ChatContainer } from "@/components/chat/ChatContainer";

export function Chat() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-130px)] overflow-hidden gap-4 md:gap-6">
      <div className="flex flex-col gap-1 shrink-0 px-1 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground text-xs md:text-sm">Communicate with your patients and manage your consultations.</p>
      </div>

      <div className="flex-1 min-h-0">
        <ChatContainer />
      </div>
    </div>
  );
}
