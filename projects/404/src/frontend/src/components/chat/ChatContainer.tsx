import { useState, useEffect } from "react";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { useGetConversationsQuery, useGetMessagesQuery, useSendMessageMutation } from "@/apis/chatApi";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function ChatContainer() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [searchParams] = useSearchParams();
  const targetPatientId = searchParams.get("patientId");
  const patientName = searchParams.get("name");
  const action = searchParams.get("action");
  
  const { data: conversationsData, isLoading: loadingConvs } = useGetConversationsQuery();
  const conversations = conversationsData || [];
  const { data: messages } = useGetMessagesQuery(selectedId, { skip: !selectedId });
  const [sendMessage] = useSendMessageMutation();

  const isTemp = selectedId.startsWith("temp");
  
  // Find exists or generate temp
  const selectedConversation = conversations.find((c: any) => c.id === selectedId) || 
    (isTemp ? {
      id: selectedId,
      name: patientName || "Patient",
      lastMessage: "Consultation started",
      time: "Now",
      unread: 0,
      status: "online",
      avatar: (patientName || "P").substring(0, 2).toUpperCase()
    } : null);

  const allConversations = [...conversations];
  if (isTemp && !allConversations.find(c => c.id === selectedId)) {
    allConversations.unshift(selectedConversation);
  }

  useEffect(() => {
    if (!loadingConvs && !selectedId) {
      if (targetPatientId || patientName) {
        let found = conversations.find((c: any) => 
          (targetPatientId && (c.id === targetPatientId || c.patientId === targetPatientId)) ||
          (patientName && c.name.toLowerCase().includes(patientName.toLowerCase()))
        );

        if (found) {
          setSelectedId(found.id);
        } else {
          setSelectedId(targetPatientId ? `temp-${targetPatientId}` : "temp");
        }
        setIsMobileListVisible(false);
        
        if (action === "audio" || action === "video") {
          toast.info(`Initiating ${action} call...`, {
            description: `Connecting with ${found?.name || patientName || "patient"}...`
          });
        }
      }
    }
  }, [conversations, loadingConvs, targetPatientId, patientName, action, selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsMobileListVisible(false);
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
  };

  if (loadingConvs && !selectedId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full border rounded-2xl overflow-hidden bg-background shadow-xl">
      {/* List Area */}
      <div className={`${isMobileListVisible ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 shrink-0`}>
        <ChatList 
          conversations={allConversations} 
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
