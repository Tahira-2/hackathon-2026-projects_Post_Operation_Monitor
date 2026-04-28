import { useState, useEffect, useMemo } from "react";
import { useChatSocket, formatMsg } from "@/hooks/useChatSocket";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";
import { useGetConversationsQuery, useGetMessagesQuery, useSendMessageMutation, useCreateConversationMutation } from "@/apis/chatApi";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export function ChatContainer() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [searchParams] = useSearchParams();
  const targetPatientId = searchParams.get("patientId");
  const patientName = searchParams.get("name");
  const action = searchParams.get("action");

  const user = useSelector((state: RootState) => (state as any).auth?.user);
  const userId = user?.id || user?.sub;

  const { data: conversationsData, isLoading: loadingConvs, refetch: refetchConversations } = useGetConversationsQuery();
  const conversations = conversationsData || [];
  const [createConversation] = useCreateConversationMutation();
  const [sendMessage] = useSendMessageMutation();

  const systemConvId = (conversations as any[]).find((c: any) => c.userIds?.includes("SYSTEM"))?.id || "";
  const effectiveSelectedId = selectedId === "SYSTEM" ? systemConvId : selectedId;

  const { data: rawMessages, refetch: refetchMessages } = useGetMessagesQuery(effectiveSelectedId, { skip: !effectiveSelectedId });

  const initialMsgs = useMemo(() => (rawMessages || []).map(formatMsg), [rawMessages]);
  const { 
    messages, 
    sendMessage: sendSocketMsg, 
    isConnected, 
    emitTyping, 
    typingIds 
  } = useChatSocket(effectiveSelectedId, userId, initialMsgs);

  const isTemp = selectedId.startsWith("temp");

  const selectedConversation = (conversations as any[]).find((c: any) => c.id === selectedId) ||
    (isTemp ? {
      id: selectedId,
      name: patientName || "Patient",
      lastMessage: "Consultation started",
      time: "Now",
      unread: 0,
      status: "online",
      avatar: (patientName || "P").substring(0, 2).toUpperCase()
    } : null);

  const systemAiConversation = {
    id: "SYSTEM",
    name: "HealthCore System AI",
    lastMessage: "Ask me anything about the system",
    time: "Always",
    unread: 0,
    status: "online",
    avatar: "AI"
  };

  const realConversations = (conversations as any[]).filter((c: any) => !c.userIds?.includes("SYSTEM") && !!c.name);
  const allConversations: any[] = [systemAiConversation, ...realConversations];

  if (isTemp && !allConversations.find(c => c.id === selectedId)) {
    allConversations.push(selectedConversation);
  }

  const activeConversation = selectedId === "SYSTEM"
    ? systemAiConversation
    : allConversations.find(c => c.id === selectedId) || null;

  useEffect(() => {
    if (!loadingConvs && !selectedId) {
      if (targetPatientId || patientName) {
        let found = (conversations as any[]).find((c: any) =>
          (targetPatientId && (c.id === targetPatientId || c.patientId === targetPatientId)) ||
          (patientName && c.name?.toLowerCase().includes(patientName.toLowerCase()))
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
      } else {
        setSelectedId("SYSTEM");
        setIsMobileListVisible(false);
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

  const handleSendMessage = async (text: string) => {
    if (!isConnected) {
       toast.error("Connecting to live chat, please wait...");
       return;
    }
    
    try {
      if (selectedId === "SYSTEM") {
        let convId = systemConvId;
        if (!convId) {
          if (!userId) { toast.error("Not authenticated"); return; }
          const result = await createConversation({ userIds: [userId, "SYSTEM"] }).unwrap();
          convId = result.id;
          await refetchConversations();
          // We can't rely on immediate socket reconnect to the new convId synchronously 
          // So we wait for next render cycle! But for immediate dispatch:
          await sendMessage({ conversationId: convId, content: text }).unwrap();
          refetchMessages();
          return;
        }
        sendSocketMsg(text);
        return;
      }
      sendSocketMsg(text);
    } catch (err: any) {
      toast.error("Failed to send message", {
        description: err?.data?.message || "Please try again"
      });
    }
  };

  if (loadingConvs && !selectedId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] border rounded-2xl overflow-hidden bg-background">
      <div className={`${isMobileListVisible ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 shrink-0`}>
        <ChatList
          conversations={allConversations}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      <div className={`${!isMobileListVisible ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full relative`}>
        {!isMobileListVisible && (
          <div className="md:hidden absolute left-2 top-3 z-10">
            <Button variant="ghost" size="icon" onClick={handleBackToList}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>
        )}

        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTyping={emitTyping}
          typingIds={typingIds}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
