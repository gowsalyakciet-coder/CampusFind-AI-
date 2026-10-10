import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Calendar,
  ExternalLink,
  Info
} from 'lucide-react';
import { NotificationItem, User } from '../../types';
import { dbService } from '../../services/database';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  currentUser: User | null;
  onNavigateToMatches: () => void;
  onNavigateToReports: () => void;
  onSelectItem: (itemId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  currentUser,
  onNavigateToMatches,
  onNavigateToReports,
  onSelectItem
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleMarkAllRead = () => {
    if (currentUser) {
      dbService.markAllNotificationsRead(currentUser.id);
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    dbService.markNotificationAsRead(notif.id);
    if (notif.linkType === 'match') {
      onNavigateToMatches();
    } else if (notif.linkType === 'claim') {
      onNavigateToReports();
    } else if (notif.linkType === 'item' && notif.linkId) {
      onSelectItem(notif.linkId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Campus Alerts &amp; Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding potential item matches, claim verification decisions, and campus alerts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 text-xs font-bold">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            filter === 'unread'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Unread Only ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Notifications</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You are all caught up! New alerts regarding item matches or claim approvals will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !notif.read
                  ? 'bg-blue-50/50 border-blue-200 shadow-xs hover:border-blue-300'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.type === 'match'
                      ? 'bg-indigo-100 text-indigo-700'
                      : notif.type === 'claim_update'
                      ? 'bg-emerald-100 text-emerald-700'
                      : notif.type === 'admin_alert'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {notif.type === 'match' && <Sparkles className="w-5 h-5" />}
                  {notif.type === 'claim_update' && <ShieldCheck className="w-5 h-5" />}
                  {notif.type === 'admin_alert' && <Bell className="w-5 h-5" />}
                  {notif.type === 'item_update' && <Info className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-center">
                <span className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1">
                  <span>View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
