import { ChatContainer } from "@/components/chat/ChatContainer";

export function Chat() {
  return (
    <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] w-full overflow-hidden">
      <div className="flex-1 min-h-0 pb-4">
        <ChatContainer />
      </div>
    </div>
  );
}
