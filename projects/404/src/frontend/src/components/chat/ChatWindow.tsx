import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, MoreVertical, Send, Paperclip, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  conversation: any;
  messages: any[];
  onSendMessage: (text: string) => void;
}

export function ChatWindow({ conversation, messages, onSendMessage }: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      <div className="h-16 border-b flex items-center justify-between px-3 md:px-6 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 pl-8 md:pl-0">
          <Avatar className="h-9 w-9 md:h-10 md:w-10 border">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.avatar}`} />
            <AvatarFallback>{conversation.avatar}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-xs md:text-sm leading-tight truncate max-w-[100px] md:max-w-none">{conversation.name}</span>
            <span className="text-[9px] md:text-[10px] text-green-500 font-medium">{conversation.status === 'online' ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 md:gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-full text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            <Phone className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-full text-muted-foreground hover:text-primary transition-colors cursor-pointer">
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
        {messages.map((msg) => {
          const isMe = msg.sender === "doctor";
          return (
            <div 
              key={msg.id} 
              className={cn(
                "flex w-full mb-4",
                isMe ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "flex flex-col max-w-[85%] md:max-w-[70%]",
                isMe ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm shadow-sm",
                  isMe 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted text-foreground rounded-tl-none"
                )}>
                  {msg.text}
                </div>
                <span className="text-[9px] md:text-[10px] text-muted-foreground mt-1 px-1 font-medium italic">
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t shrink-0">
        <div className="flex items-center gap-2 md:gap-3 bg-muted/30 rounded-2xl px-3 py-1.5 border border-border/50">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0 focus-visible:ring-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input 
            className="border-none bg-transparent h-10 focus-visible:ring-0 text-sm shadow-none px-0"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <div className="flex items-center gap-1 shrink-0">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hidden md:flex cursor-pointer">
               <Smile className="h-4 w-4" />
             </Button>
             <Button 
                onClick={handleSend}
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
