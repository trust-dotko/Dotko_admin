'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import {
  Users,
  FileText,
  AlertTriangle,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import Navbar from '@/components/Navbar';

interface Stats {
  totalUsers: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  totalNotifications: number;
  verifiedUsers: number;
  publishedReports: number;
  rejectedReports: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'report' | 'notification';
  message: string;
  timestamp: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalNotifications: 0,
    verifiedUsers: 0,
    publishedReports: 0,
    rejectedReports: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [reportStatusData, setReportStatusData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const totalUsers = users.length;
      const verifiedUsers = users.filter((u: any) => u.verified).length;

      // Fetch reports
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const totalReports = reports.length;
      const pendingReports = reports.filter((r: any) =>
        r.status === 'pending' || r.status === 'under_discussion'
      ).length;
      const resolvedReports = reports.filter((r: any) =>
        r.status === 'resolved'
      ).length;
      const publishedReports = reports.filter((r: any) =>
        r.status === 'published'
      ).length;
      const rejectedReports = reports.filter((r: any) =>
        r.status === 'rejected'
      ).length;

      // Fetch notifications
      const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
      const totalNotifications = notificationsSnapshot.size;

      setStats({
        totalUsers,
        totalReports,
        pendingReports,
        resolvedReports,
        totalNotifications,
        verifiedUsers,
        publishedReports,
        rejectedReports,
      });

      // Prepare chart data
      const statusData: ChartData[] = [
        { name: 'Pending', value: pendingReports, color: '#F59E0B' },
        { name: 'Resolved', value: resolvedReports, color: '#22C55E' },
        { name: 'Published', value: publishedReports, color: '#EF4444' },
        { name: 'Rejected', value: rejectedReports, color: '#6B7280' },
      ].filter(item => item.value > 0);

      setReportStatusData(statusData);

      // Build recent activity
      const activities: RecentActivity[] = [];

      // Recent users
      const recentUsersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentUsers = await getDocs(recentUsersQuery);
      recentUsers.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'user',
          message: `New user registered: ${data.businessName}`,
          timestamp: data.createdAt || new Date().toISOString(),
        });
      });

      // Recent reports
      const recentReportsQuery = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentReportsSnap = await getDocs(recentReportsQuery);
      recentReportsSnap.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'report',
          message: `Report filed: ${data.customerName} - ₹${data.amount?.toLocaleString('en-IN')}`,
          timestamp: data.createdAt || new Date().toISOString(),
        });
      });

      // Sort by timestamp
      activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setRecentActivity(activities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, link }: any) => (
    <Link href={link}>
      <div className={`bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 ${color} cursor-pointer`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
            <Icon className={`w-8 h-8 ${color.replace('border-', 'text-')}`} />
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Overview of your DOTKO.IN platform</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="border-blue-500"
            link="/users"
          />
          <StatCard
            title="Verified Users"
            value={stats.verifiedUsers}
            icon={Shield}
            color="border-green-500"
            link="/users"
          />
          <StatCard
            title="Total Reports"
            value={stats.totalReports}
            icon={FileText}
            color="border-purple-500"
            link="/reports"
          />
          <StatCard
            title="Pending Reports"
            value={stats.pendingReports}
            icon={Clock}
            color="border-orange-500"
            link="/reports"
          />
          <StatCard
            title="Resolved Reports"
            value={stats.resolvedReports}
            icon={CheckCircle}
            color="border-teal-500"
            link="/reports"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Report Status Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Report Status Distribution</h2>
              <PieChartIcon className="w-6 h-6 text-gray-400" />
            </div>
            {reportStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No report data available
              </div>
            )}
          </div>

          {/* Report Statistics Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Report Statistics</h2>
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            {reportStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {reportStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No report data available
              </div>
            )}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/users">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-blue-500">
              <Users className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">User Management</h3>
              <p className="text-gray-600">View and manage all registered users</p>
            </div>
          </Link>

          <Link href="/reports">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-purple-500">
              <FileText className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reports Management</h3>
              <p className="text-gray-600">Monitor and manage all filed reports</p>
            </div>
          </Link>

          <Link href="/notifications">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-green-500">
              <Bell className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Notifications</h3>
              <p className="text-gray-600">View all system notifications</p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div
                  key={activity.id + index}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-100' :
                    activity.type === 'report' ? 'bg-purple-100' :
                    'bg-green-100'
                  }`}>
                    {activity.type === 'user' && <Users className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'report' && <FileText className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'notification' && <Bell className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
