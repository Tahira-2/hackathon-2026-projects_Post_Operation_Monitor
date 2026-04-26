import { useState } from "react";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { useGetConversationsQuery, useGetMessagesQuery, useSendMessageMutation } from "@/apis/chatApi";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatContainer() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  
  const { data: conversations, isLoading: loadingConvs } = useGetConversationsQuery();
  const { data: messages } = useGetMessagesQuery(selectedId, { skip: !selectedId });
  const [sendMessage] = useSendMessageMutation();

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsMobileListVisible(false); // Hide list on mobile when conversation selected
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
  };

  if (loadingConvs) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedConversation = conversations?.find((c: any) => c.id === selectedId);

  return (
    <div className="flex h-full border rounded-2xl overflow-hidden bg-background shadow-xl">
      {/* List Area */}
      <div className={`${isMobileListVisible ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 shrink-0`}>
        <ChatList 
          conversations={conversations || []} 
          selectedId={selectedId} 
          onSelect={handleSelect} 
        />
      </div>

      {/* Window Area */}
      <div className={`${!isMobileListVisible ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full relative`}>
        {/* Back Button for mobile */}
        {!isMobileListVisible && (
          <div className="md:hidden absolute left-2 top-3 z-10">
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
        )}
        
        <ChatWindow 
          conversation={selectedConversation} 
          messages={messages || []} 
          onSendMessage={(text) => sendMessage({ conversationId: selectedId, text })}
        />
      </div>
    </div>
  );
}
