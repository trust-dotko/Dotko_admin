'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Users, FileText, Bell, TrendingUp, Clock, CheckCircle, Shield, BarChart3, PieChart as PieChartIcon, UserPlus } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import Navbar from '@/components/Navbar';

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  publishedReports: number;
  rejectedReports: number;
  totalNotifications: number;
  unreadNotifications: number;
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  totalFcmTokens: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'report' | 'notification' | 'lead';
  message: string;
  timestamp: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const defaultStats: Stats = {
  totalUsers: 0,
  verifiedUsers: 0,
  totalReports: 0,
  pendingReports: 0,
  resolvedReports: 0,
  publishedReports: 0,
  rejectedReports: 0,
  totalNotifications: 0,
  unreadNotifications: 0,
  totalLeads: 0,
  leadsToday: 0,
  leadsThisWeek: 0,
  totalFcmTokens: 0,
};

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIso(value: any): string {
  const date = toDate(value);
  return date ? date.toISOString() : new Date(0).toISOString();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [reportStatusData, setReportStatusData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch each collection independently so one failure doesn't zero everything out
      const safeGet = async (col: string) => {
        try { return (await getDocs(collection(db, col))).docs.map(d => ({ id: d.id, ...d.data() })); }
        catch { return []; }
      };
      const safeQuery = async (col: string) => {
        try { return await getDocs(query(collection(db, col), orderBy('createdAt', 'desc'), limit(4))); }
        catch { return null; }
      };

      const [users, reports, notifications, leads] = await Promise.all([
        safeGet('users'),
        safeGet('reports'),
        safeGet('notifications'),
        safeGet('landing_signups'),
      ]);

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - 6);

      const totalUsers = users.length;
      const verifiedUsers = users.filter((u: any) => Boolean(u.verified)).length;

      const totalReports = reports.length;
      const pendingReports = reports.filter((r: any) => r.status === 'pending' || r.status === 'under_discussion').length;
      const resolvedReports = reports.filter((r: any) => r.status === 'resolved').length;
      const publishedReports = reports.filter((r: any) => r.status === 'published').length;
      const rejectedReports = reports.filter((r: any) => r.status === 'rejected').length;

      const totalNotifications = notifications.length;
      const unreadNotifications = notifications.filter((n: any) => !n.read).length;

      const totalLeads = leads.length;
      const leadsToday = leads.filter((lead: any) => {
        const createdAt = toDate(lead.createdAt);
        return createdAt ? createdAt >= startOfToday : false;
      }).length;
      const leadsThisWeek = leads.filter((lead: any) => {
        const createdAt = toDate(lead.createdAt);
        return createdAt ? createdAt >= startOfWeek : false;
      }).length;

      setStats({
        totalUsers, verifiedUsers, totalReports, pendingReports,
        resolvedReports, publishedReports, rejectedReports,
        totalNotifications, unreadNotifications,
        totalLeads, leadsToday, leadsThisWeek,
        totalFcmTokens: 0,
      });

      setReportStatusData(
        [
          { name: 'Pending', value: pendingReports, color: '#f59e0b' },
          { name: 'Resolved', value: resolvedReports, color: '#16a34a' },
          { name: 'Published', value: publishedReports, color: '#dc2626' },
          { name: 'Rejected', value: rejectedReports, color: '#64748b' },
        ].filter((item) => item.value > 0)
      );

      const activities: RecentActivity[] = [];

      const [recentUsersSnap, recentReportsSnap, recentLeadsSnap] = await Promise.all([
        safeQuery('users'),
        safeQuery('reports'),
        safeQuery('landing_signups'),
      ]);

      recentUsersSnap?.forEach((doc) => {
        const data = doc.data() as any;
        activities.push({
          id: doc.id, type: 'user',
          message: `User registered: ${data.businessName || data.email || 'Unknown'}`,
          timestamp: toIso(data.createdAt),
        });
      });

      recentReportsSnap?.forEach((doc) => {
        const data = doc.data() as any;
        activities.push({
          id: doc.id, type: 'report',
          message: `Report filed by ${data.customerName || 'Unknown'}`,
          timestamp: toIso(data.createdAt),
        });
      });

      recentLeadsSnap?.forEach((doc) => {
        const data = doc.data() as any;
        activities.push({
          id: doc.id, type: 'lead',
          message: `Website lead: ${data.name || data.fullName || data.email || 'Unknown'}`,
          timestamp: toIso(data.createdAt),
        });
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 12));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="admin-page flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-slate-700"></div>
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="admin-page">
        <Navbar />

        <header className="admin-header">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
                <p className="mt-1 text-slate-600">Operational and website funnel overview</p>
              </div>
              <span className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </header>

        <main className="admin-main space-y-8">
          <section>
            <div className="admin-panel p-4">
              <h2 className="mb-3 text-base font-semibold text-slate-800">User & Report Data</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <CompactStat title="Total Users" value={stats.totalUsers} link="/users" />
                <CompactStat title="Verified Users" value={stats.verifiedUsers} link="/users" />
                <CompactStat title="Total Reports" value={stats.totalReports} link="/reports" />
                <CompactStat title="Pending Reports" value={stats.pendingReports} link="/reports" />
                <CompactStat title="Resolved Reports" value={stats.resolvedReports} link="/reports" />
                <CompactStat title="Published Reports" value={stats.publishedReports} link="/reports" />
                <CompactStat title="Rejected Reports" value={stats.rejectedReports} link="/reports" />
                <CompactStat title="Unread Notifications" value={stats.unreadNotifications} link="/notifications" />
              </div>
            </div>
          </section>

          <section>
            <div className="admin-panel p-4">
              <h2 className="mb-3 text-base font-semibold text-slate-800">Website Leads & Engagement</h2>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <CompactStat title="Total Leads" value={stats.totalLeads} link="/leads" />
                <CompactStat title="Leads Today" value={stats.leadsToday} link="/leads" />
                <CompactStat title="Leads (7 Days)" value={stats.leadsThisWeek} link="/leads" />
                <CompactStat title="FCM Tokens" value={stats.totalFcmTokens} link="/notifications" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="admin-panel p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Report Status Distribution</h3>
                <PieChartIcon className="h-5 w-5 text-slate-400" />
              </div>
              {reportStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={reportStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      dataKey="value"
                    >
                      {reportStatusData.map((entry, index) => (
                        <Cell key={`status-pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-60 items-center justify-center text-sm text-slate-500">No report data available</div>
              )}
            </div>

            <div className="admin-panel p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Report Status Counts</h3>
                <BarChart3 className="h-5 w-5 text-slate-400" />
              </div>
              {reportStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={reportStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {reportStatusData.map((entry, index) => (
                        <Cell key={`status-bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-60 items-center justify-center text-sm text-slate-500">No report data available</div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <QuickLink href="/users" title="Users" description="Verification, suspension, profile details" icon={<Users className="h-5 w-5 text-blue-600" />} />
            <QuickLink href="/reports" title="Reports" description="Status workflow and issue tracking" icon={<FileText className="h-5 w-5 text-violet-600" />} />
            <QuickLink href="/notifications" title="Notifications" description="System alerts and recipient logs" icon={<Bell className="h-5 w-5 text-emerald-600" />} />
            <QuickLink href="/leads" title="Website Leads" description="Landing signup funnel and contact list" icon={<UserPlus className="h-5 w-5 text-indigo-600" />} />
          </section>

          <section className="admin-panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={activity.id + index} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className={`rounded-lg p-2 ${
                      activity.type === 'user'
                        ? 'bg-blue-100'
                        : activity.type === 'report'
                        ? 'bg-violet-100'
                        : activity.type === 'lead'
                        ? 'bg-indigo-100'
                        : 'bg-emerald-100'
                    }`}>
                      {activity.type === 'user' && <Users className="h-4 w-4 text-blue-700" />}
                      {activity.type === 'report' && <FileText className="h-4 w-4 text-violet-700" />}
                      {activity.type === 'lead' && <UserPlus className="h-4 w-4 text-indigo-700" />}
                      {activity.type === 'notification' && <Bell className="h-4 w-4 text-emerald-700" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function QuickLink({ href, title, description, icon }: { href: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <div className="admin-panel h-full p-5 transition-colors hover:bg-slate-50">
        <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-2">{icon}</div>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="mt-1 text-xs text-slate-600">{description}</p>
      </div>
    </Link>
  );
}

function CompactStat({ title, value, link }: { title: string; value: number; link: string }) {
  return (
    <Link href={link}>
      <div className="h-full min-h-[108px] rounded-lg border border-slate-200 bg-white px-3 py-3 text-center transition-colors hover:bg-slate-50">
        <p className="line-clamp-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-3 text-2xl font-semibold leading-none text-slate-900">{value}</p>
      </div>
    </Link>
  );
}
