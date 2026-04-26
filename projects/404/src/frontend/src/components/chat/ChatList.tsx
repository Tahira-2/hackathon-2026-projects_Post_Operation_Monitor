import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ChatListProps {
  conversations: any[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ChatList({ conversations, selectedId, onSelect }: ChatListProps) {
  return (
    <div className="flex flex-col h-full border-r bg-card/50">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 h-10 bg-background"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 transition-colors hover:bg-accent border-b border-border/50 text-left outline-none",
              selectedId === conv.id ? "bg-accent border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
            )}
          >
            <div className="relative shrink-0">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.avatar}`} />
                <AvatarFallback>{conv.avatar}</AvatarFallback>
              </Avatar>
              <span className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                conv.status === "online" ? "bg-green-500" : "bg-muted-foreground"
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-sm truncate">{conv.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground truncate pr-2">
                  {conv.lastMessage}
                </p>
                {conv.unread > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
