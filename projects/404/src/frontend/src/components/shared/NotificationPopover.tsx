import { useState } from "react"
import { Bell, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { useGetNotificationsQuery, useMarkAsReadMutation } from "@/apis/notificationApi"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface NotificationPopoverProps {
  isTransparentActive?: boolean;
}

export function NotificationPopover({ isTransparentActive = false }: NotificationPopoverProps) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useGetNotificationsQuery()
  const [markAsRead] = useMarkAsReadMutation()

  const notifications = data?.data || []
  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await markAsRead(id).unwrap()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const unreadNotifications = notifications.filter(n => !n.isRead)
    for (const notification of unreadNotifications) {
      try {
        await markAsRead(notification.id).unwrap()
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative rounded-full transition-colors",
            isTransparentActive 
              ? "text-white/80 hover:text-white hover:bg-white/10" 
              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white border-2",
              isTransparentActive ? "border-transparent" : "border-background"
            )}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-2xl border-emerald-900/10 shadow-xl shadow-emerald-900/5">
        <div className="flex items-center justify-between p-4 border-b border-emerald-900/5 bg-slate-50/50 rounded-t-2xl">
          <h3 className="font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto px-2 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-[350px] overflow-y-auto p-2">
          {isLoading ? (
            <div className="text-center p-4 text-sm text-slate-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-6 text-sm text-slate-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              No notifications yet
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "relative flex items-start gap-3 p-3 rounded-xl transition-colors",
                    !notification.isRead ? "bg-emerald-50/50" : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "text-sm font-medium",
                      !notification.isRead ? "text-slate-900" : "text-slate-700"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-emerald-100 text-emerald-600 shrink-0"
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      title="Mark as read"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
