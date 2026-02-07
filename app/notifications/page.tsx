'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, Bell, AlertCircle, Info, CheckCircle2, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DetailModal from '@/components/DetailModal';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Notification {
  id: string;
  recipientEmail: string;
  recipientGSTIN?: string;
  customerName: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  reportId?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    notification: Notification | null;
  }>({
    isOpen: false,
    notification: null
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    let filtered = notifications;

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notif => notif.type === typeFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(notif =>
        notif.customerName?.toLowerCase().includes(query) ||
        notif.recipientEmail?.toLowerCase().includes(query) ||
        notif.title?.toLowerCase().includes(query) ||
        notif.message?.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(filtered);
  }, [searchQuery, typeFilter, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(notificationsQuery);
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      setNotifications(notificationsData);
      setFilteredNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'report_filed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'report_update':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'report_resolved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    reportFiled: notifications.filter(n => n.type === 'report_filed').length,
  };

  return (
    <ProtectedRoute>
      <div className="admin-page">
        <Navbar />

      {/* Page Header */}
      <header className="admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Notifications</h1>
            <p className="mt-1 text-slate-600">View all system notifications</p>
          </div>
        </div>
      </header>

      <main className="admin-main space-y-6">
        {/* Stats */}
        <section className="admin-panel p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="admin-metric">
              <p className="admin-metric-label">Total Notifications</p>
              <p className="admin-metric-value">{stats.total}</p>
            </div>
            <div className="admin-metric">
              <p className="admin-metric-label">Unread</p>
              <p className="admin-metric-value">{stats.unread}</p>
            </div>
            <div className="admin-metric">
              <p className="admin-metric-label">Report Alerts</p>
              <p className="admin-metric-value">{stats.reportFiled}</p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="admin-panel p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="admin-input pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="admin-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="report_filed">Report Filed</option>
              <option value="report_update">Report Update</option>
              <option value="report_resolved">Report Resolved</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="admin-panel">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-sky-600"></div>
              <p className="mt-4 text-slate-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="mx-auto mb-4 h-16 w-16 text-slate-300" />
              <p className="text-slate-600">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 transition-colors hover:bg-slate-50 ${
                    !notification.read ? 'bg-sky-50/70' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      notification.type === 'report_filed' ? 'bg-red-100' :
                      notification.type === 'report_update' ? 'bg-blue-100' :
                      notification.type === 'report_resolved' ? 'bg-green-100' :
                      'bg-slate-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                          <button
                            onClick={() => setDetailModal({ isOpen: true, notification })}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mb-3 text-slate-700">{notification.message}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="font-semibold">Recipient:</span>
                          <span className="truncate">{notification.recipientEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="font-semibold">Related to:</span>
                          <span>{notification.customerName}</span>
                        </div>
                        {notification.recipientGSTIN && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="font-semibold">GSTIN:</span>
                            <span className="font-mono">{notification.recipientGSTIN}</span>
                          </div>
                        )}
                        {notification.reportId && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="font-semibold">Report:</span>
                            <span className="font-mono text-xs truncate">{notification.reportId}</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        <span className="font-semibold">Sent: </span>
                        {new Date(notification.createdAt).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <DetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, notification: null })}
        title={`Notification Details: ${detailModal.notification?.title || ''}`}
        data={detailModal.notification || {}}
      />
      </div>
    </ProtectedRoute>
  );
}
