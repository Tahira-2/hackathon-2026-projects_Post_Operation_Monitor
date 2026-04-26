import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'reminder',
      title: 'Vaccination Reminder',
      message: 'Your child is due for Measles Booster vaccination. Schedule an appointment today.',
      date: '2026-04-24',
      time: '10:30 AM',
      read: false,
      icon: Bell,
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      id: 2,
      type: 'success',
      title: 'Vaccination Completed',
      message: 'Pentavalent Dose 3 vaccination completed successfully at Norvic Hospital.',
      date: '2026-04-20',
      time: '2:15 PM',
      read: false,
      icon: CheckCircle,
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: 3,
      type: 'alert',
      title: 'Vaccine Appointment Alert',
      message: 'Appointment tomorrow at 10:00 AM. Please arrive 15 minutes early.',
      date: '2026-04-22',
      time: '3:45 PM',
      read: true,
      icon: AlertCircle,
      color: 'bg-red-500/20 text-red-400',
    },
    {
      id: 4,
      type: 'info',
      title: 'Program Notification',
      message: 'New Measles & Rubella elimination campaign starting June 1st in your area.',
      date: '2026-04-18',
      time: '9:20 AM',
      read: true,
      icon: Info,
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      id: 5,
      type: 'success',
      title: 'Health Certificate Issued',
      message: 'Digital vaccination certificate has been issued and is now available for download.',
      date: '2026-04-15',
      time: '11:00 AM',
      read: true,
      icon: CheckCircle,
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: 6,
      type: 'info',
      title: 'Vaccination Status Update',
      message: 'Your vaccination record has been updated by the healthcare provider.',
      date: '2026-04-12',
      time: '4:30 PM',
      read: true,
      icon: Info,
      color: 'bg-indigo-500/20 text-indigo-400',
    },
  ]);

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Notifications</h2>
          <p className="text-slate-300 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition w-fit border border-blue-400/30">
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/7 shadow-2xl shadow-black/30 p-12 text-center backdrop-blur-xl">
            <Bell size={48} className="mx-auto text-slate-500 mb-4" />
            <p className="text-slate-300 text-lg">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`rounded-2xl p-4 transition border ${
                  notification.read
                    ? 'bg-slate-800/30 border-white/5'
                    : 'bg-blue-500/10 border-blue-500/20 shadow-lg'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg flex-shrink-0 ${notification.color}`}>
                    <Icon size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="inline-block bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs px-2 py-0.5 rounded-full mt-1 font-semibold">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-400">{notification.date}</p>
                        <p className="text-xs text-slate-400">{notification.time}</p>
                      </div>
                    </div>

                    <p className="text-slate-300 mt-2">{notification.message}</p>

                    {/* Actions */}
                    <div className="flex gap-3 mt-3">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-sm text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Settings */}
      <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl border-t-4 border-t-blue-500/50">
        <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-800 border border-white/20 accent-blue-500" />
            <span className="text-slate-200">Vaccination reminders</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-800 border border-white/20 accent-blue-500" />
            <span className="text-slate-200">Appointment confirmations</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-800 border border-white/20 accent-blue-500" />
            <span className="text-slate-200">Program updates</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-800 border border-white/20 accent-blue-500" />
            <span className="text-slate-200">Health alerts</span>
          </label>
        </div>
        <button className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
