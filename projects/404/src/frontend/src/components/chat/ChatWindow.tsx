import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, MoreVertical, Send, Paperclip, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ChatWindowProps {
  conversation: any;
  messages: any[];
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  typingIds?: Set<string>;
  isConnected?: boolean;
}

export function ChatWindow({ conversation, messages, onSendMessage, onTyping, typingIds, isConnected }: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingIds]);

  useEffect(() => {
    if (!onTyping) return;
    if (inputText.trim().length > 0) {
      onTyping(true);
      const timer = setTimeout(() => {
        onTyping(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      onTyping(false);
    }
  }, [inputText, onTyping]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/5">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
            <Send className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Your Messages</h3>
          <p className="text-muted-foreground text-sm max-w-[250px]">
            Select a conversation from the list to start messaging or view history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-emerald-100">
            <AvatarImage src={`https://api.dicebear.com/7.x/${conversation.name.includes("AI") ? 'bottts' : 'avataaars'}/svg?seed=${conversation.avatar}`} />
            <AvatarFallback>{conversation.avatar}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-900 leading-tight truncate">{conversation.name}</span>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                conversation.status === 'online' ? "bg-emerald-500" : "bg-muted-foreground"
              )} />
              <span className="text-[10px] text-muted-foreground font-medium">
                {conversation.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 md:gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-full text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            <Phone className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 md:h-10 md:w-10 rounded-full text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            onClick={() => navigate(`/physician/consultation/${conversation.id}`)}
          >
            <Video className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-full text-muted-foreground cursor-pointer">
            <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
      >
        {messages.map((msg: any) => {
          const isMe = msg.senderType === "USER";
          
          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex w-full mb-4",
                isMe ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "flex flex-col max-w-[85%] md:max-w-[70%] min-w-0",
                isMe ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm shadow-sm whitespace-pre-wrap break-all min-w-0 overflow-hidden",
                  isMe 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted text-foreground rounded-tl-none"
                )}>
                  {msg.text || msg.content}
                </div>
                <span className="text-[9px] md:text-[10px] text-muted-foreground mt-1 px-1 font-medium italic flex items-center gap-1 justify-end">
                  {msg.time || (msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                  {isMe && msg.status === 'sending' && (
                     <span className="ml-1 opacity-60">Sending...</span>
                  )}
                  {isMe && msg.status === 'sent' && (
                     <span className="ml-1 text-emerald-500 text-[11px] font-bold">✓✓</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}

        {typingIds && typingIds.size > 0 && (
           <div className="flex w-full mb-4 justify-start">
             <div className="flex flex-col items-start">
               <div className="bg-muted text-foreground px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-10">
                 <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
           </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t shrink-0">
        <div className="flex items-center gap-2 md:gap-3 bg-muted/30 rounded-2xl px-3 py-1.5 border border-border/50">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0 focus-visible:ring-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input 
            className="border-none bg-transparent h-10 focus-visible:ring-0 text-sm shadow-none px-0"
            placeholder={isConnected === false ? "Connecting to chat..." : "Type a message..."}
            value={inputText}
            disabled={isConnected === false}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <div className="flex items-center gap-1 shrink-0">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hidden md:flex cursor-pointer">
               <Smile className="h-4 w-4" />
             </Button>
             <Button 
                onClick={handleSend}
                disabled={isConnected === false}
                size="sm" 
                className="h-9 w-9 md:w-auto md:px-4 rounded-xl shadow-md cursor-pointer"
             >
               <Send className="h-4 w-4 md:mr-2" />
               <span className="hidden md:inline">Send</span>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
