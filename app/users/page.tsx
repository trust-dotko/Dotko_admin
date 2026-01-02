'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { ArrowLeft, Search, Users as UsersIcon, Building2, Mail, Phone, Calendar, CheckCircle, XCircle, Trash2, Shield, Eye, Star } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import Navbar from '@/components/Navbar';
import DetailModal from '@/components/DetailModal';

interface User {
  id: string;
  businessName: string;
  email: string;
  mobileNumber: string;
  gst: string;
  pan: string;
  entityType: string;
  createdAt: string;
  onboardingCompleted: boolean;
  verified?: boolean;
  suspended?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  trustScore?: number;
  scoreBreakdown?: {
    paymentHistory?: number;
    disputeResolution?: number;
    businessCredibility?: number;
    transactionVolume?: number;
    customerFeedback?: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'success' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.businessName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.gst?.toLowerCase().includes(query) ||
        user.mobileNumber?.includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = (userId: string, currentStatus: boolean) => {
    setConfirmModal({
      isOpen: true,
      title: `${currentStatus ? 'Unverify' : 'Verify'} User`,
      message: `Are you sure you want to ${currentStatus ? 'unverify' : 'verify'} this user?`,
      type: currentStatus ? 'warning' : 'success',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, 'users', userId), {
            verified: !currentStatus,
            verifiedAt: !currentStatus ? new Date().toISOString() : null,
            verifiedBy: !currentStatus ? 'admin' : null,
          });
          await fetchUsers();
          setToast({
            isOpen: true,
            message: `User ${!currentStatus ? 'verified' : 'unverified'} successfully!`,
            type: 'success'
          });
        } catch (error) {
          console.error('Error updating user:', error);
          setToast({
            isOpen: true,
            message: 'Failed to update user verification status.',
            type: 'error'
          });
        }
      }
    });
  };

  const handleSuspendUser = (userId: string, currentStatus: boolean) => {
    setConfirmModal({
      isOpen: true,
      title: `${currentStatus ? 'Unsuspend' : 'Suspend'} User`,
      message: `Are you sure you want to ${currentStatus ? 'unsuspend' : 'suspend'} this user?`,
      type: currentStatus ? 'info' : 'warning',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, 'users', userId), {
            suspended: !currentStatus,
            suspendedAt: !currentStatus ? new Date().toISOString() : null,
          });
          await fetchUsers();
          setToast({
            isOpen: true,
            message: `User ${!currentStatus ? 'suspended' : 'unsuspended'} successfully!`,
            type: 'success'
          });
        } catch (error) {
          console.error('Error updating user:', error);
          setToast({
            isOpen: true,
            message: 'Failed to update user suspension status.',
            type: 'error'
          });
        }
      }
    });
  };

  const handleDeleteUser = (userId: string, businessName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to permanently delete ${businessName}? This action cannot be undone and will remove all user data.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'users', userId));
          await fetchUsers();
          setToast({
            isOpen: true,
            message: 'User deleted successfully!',
            type: 'success'
          });
        } catch (error) {
          console.error('Error deleting user:', error);
          setToast({
            isOpen: true,
            message: 'Failed to delete user.',
            type: 'error'
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">View and manage all registered users</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2">{users.length}</p>
              </div>
              <UsersIcon className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Verified Users</p>
                <p className="text-3xl font-bold mt-2">
                  {users.filter(u => u.verified).length}
                </p>
              </div>
              <Shield className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed Onboarding</p>
                <p className="text-3xl font-bold mt-2">
                  {users.filter(u => u.onboardingCompleted).length}
                </p>
              </div>
              <Building2 className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Suspended Users</p>
                <p className="text-3xl font-bold mt-2">
                  {users.filter(u => u.suspended).length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by business name, email, GST, or mobile..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Business Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      GST/PAN
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Trust Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.suspended ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{user.businessName || 'N/A'}</p>
                              {user.verified && (
                                <Shield className="w-4 h-4 text-green-500" />
                              )}
                              {user.suspended && (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{user.entityType || 'Not specified'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {user.mobileNumber || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-900 font-mono">{user.gst || 'N/A'}</p>
                          <p className="text-gray-600 font-mono">{user.pan || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.trustScore !== undefined && user.trustScore !== null ? (
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                              user.trustScore >= 80 ? 'bg-green-100 text-green-700' :
                              user.trustScore >= 60 ? 'bg-blue-100 text-blue-700' :
                              user.trustScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              <Star className="w-4 h-4" fill="currentColor" />
                              <span>{user.trustScore}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.onboardingCompleted
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {user.onboardingCompleted ? 'Active' : 'Pending'}
                          </span>
                          {user.verified && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Verified
                            </span>
                          )}
                          {user.suspended && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Suspended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setDetailModal({ isOpen: true, user })}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleVerifyUser(user.id, user.verified || false)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.verified
                                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                : 'bg-green-100 hover:bg-green-200 text-green-600'
                            }`}
                            title={user.verified ? 'Unverify User' : 'Verify User'}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSuspendUser(user.id, user.suspended || false)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.suspended
                                ? 'bg-green-100 hover:bg-green-200 text-green-600'
                                : 'bg-orange-100 hover:bg-orange-200 text-orange-600'
                            }`}
                            title={user.suspended ? 'Unsuspend User' : 'Suspend User'}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.businessName)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />

      <DetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, user: null })}
        title={`User Details: ${detailModal.user?.businessName || ''}`}
        data={detailModal.user || {}}
      />
    </div>
  );
}
