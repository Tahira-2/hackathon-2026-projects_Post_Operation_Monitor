import { useEffect, useState } from 'react';
import { Bell, CheckCircle, Info, Trash2 } from 'lucide-react';
import { fetchUserNotifications } from '../../../api/notifications';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const response = await fetchUserNotifications();
        const results = response?.data?.results || [];
        const mapped = (Array.isArray(results) ? results : []).map((item) => {
          const isEnded = item?.event_status === 'ENDED';
          return {
            id: item?.id || `${item?.title || 'notification'}-${Math.random()}`,
            title: item?.title || 'Program Notification',
            message: item?.message || 'A new vaccination program is available in your area.',
            date: item?.date || 'N/A',
            time: item?.time || '',
            read: Boolean(item?.read),
            icon: isEnded ? CheckCircle : Info,
            color: isEnded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400',
          };
        });
        setNotifications(mapped);
      } catch (error) {
        const message =
          error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          'Could not load notifications.';
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const deleteNotification = (id) => {
    setNotifications((current) => current.filter((n) => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Notifications</h2>
          <p className="mt-1 text-slate-300">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="w-fit rounded-lg border border-blue-400/30 bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-400"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loadError && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {loadError}
          </div>
        )}

        {isLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/7 p-4 text-sm text-slate-300">
            Loading notifications...
          </div>
        )}

        {!isLoading && notifications.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/7 p-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <Bell size={48} className="mx-auto mb-4 text-slate-500" />
            <p className="text-lg text-slate-300">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`rounded-2xl border p-4 transition ${
                  notification.read
                    ? 'border-white/5 bg-slate-800/30'
                    : 'border-blue-500/20 bg-blue-500/10 shadow-lg'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 rounded-lg p-3 ${notification.color}`}>
                    <Icon size={24} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{notification.title}</h3>
                        {!notification.read && (
                          <span className="mt-1 inline-block rounded-full border border-blue-400/30 bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-slate-400">{notification.date}</p>
                        <p className="text-xs text-slate-400">{notification.time}</p>
                      </div>
                    </div>

                    <p className="mt-2 text-slate-300">{notification.message}</p>

                    <div className="mt-3 flex gap-3">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm font-semibold text-blue-400 hover:text-blue-300"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center gap-1 text-sm font-semibold text-red-400 hover:text-red-300"
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
    </div>
  );
}
