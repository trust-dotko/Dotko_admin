'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Trash2, Edit, Eye, MessageCircle, MessagesSquare } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import InputModal from '@/components/InputModal';
import Toast from '@/components/Toast';
import Navbar from '@/components/Navbar';
import DetailModal from '@/components/DetailModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChatViewer from '@/components/ChatViewer';

interface Report {
  id: string;
  customerName: string;
  customerEmail: string;
  customerGSTIN: string;
  customerWhatsapp?: string;
  supplierBusinessName: string;
  amount: number;
  invoiceNumber: string;
  status: string;
  typeOfComplaint: string;
  createdAt: string;
  whatsappMessageSent?: boolean;
  whatsappMessageSentAt?: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    reportId: string;
    currentStatus: string;
  }>({
    isOpen: false,
    reportId: '',
    currentStatus: ''
  });

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
    report: Report | null;
  }>({
    isOpen: false,
    report: null
  });

  const [chatViewer, setChatViewer] = useState<{
    isOpen: boolean;
    reportId: string;
    reportDetails: {
      customerName: string;
      supplierBusinessName: string;
    };
  }>({
    isOpen: false,
    reportId: '',
    reportDetails: {
      customerName: '',
      supplierBusinessName: ''
    }
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(report =>
        report.customerName?.toLowerCase().includes(query) ||
        report.supplierBusinessName?.toLowerCase().includes(query) ||
        report.invoiceNumber?.toLowerCase().includes(query) ||
        report.customerGSTIN?.toLowerCase().includes(query)
      );
    }

    setFilteredReports(filtered);
  }, [searchQuery, statusFilter, reports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsQuery = query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(reportsQuery);
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Report));
      setReports(reportsData);
      setFilteredReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (reportId: string, currentStatus: string) => {
    setInputModal({
      isOpen: true,
      reportId,
      currentStatus
    });
  };

  const handleStatusUpdate = async (newStatus: string) => {
    const statusOptions = ['pending', 'under_discussion', 'resolved', 'published', 'rejected'];

    if (!newStatus || !statusOptions.includes(newStatus)) {
      setToast({
        isOpen: true,
        message: 'Invalid status selected.',
        type: 'error'
      });
      return;
    }

    try {
      await updateDoc(doc(db, 'reports', inputModal.reportId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: 'admin',
      });
      await fetchReports();
      setToast({
        isOpen: true,
        message: 'Report status updated successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating report:', error);
      setToast({
        isOpen: true,
        message: 'Failed to update report status.',
        type: 'error'
      });
    }
  };

  const handleDeleteReport = (reportId: string, customerName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Report',
      message: `Are you sure you want to permanently delete the report from ${customerName}? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'reports', reportId));
          await fetchReports();
          setToast({
            isOpen: true,
            message: 'Report deleted successfully!',
            type: 'success'
          });
        } catch (error) {
          console.error('Error deleting report:', error);
          setToast({
            isOpen: true,
            message: 'Failed to delete report.',
            type: 'error'
          });
        }
      }
    });
  };

  const generateWhatsAppMessage = (report: Report): string => {
    const message = `Dear ${report.customerName},

This is an official notice from DOTKO.IN regarding a payment dispute filed against your company.

*Report Details:*
• Supplier: ${report.supplierBusinessName || 'N/A'}
• Amount Due: ₹${report.amount?.toLocaleString('en-IN')}
• Invoice Number: ${report.invoiceNumber}
• Type: ${report.typeOfComplaint || 'Payment Issue'}
• Status: ${report.status.toUpperCase()}

*Action Required:*
Please review this matter urgently and contact the supplier to resolve the outstanding payment. Unresolved disputes may affect your credit rating and business reputation.

For more details, visit: https://dotko.in

Regards,
DOTKO.IN Team`;

    return message;
  };

  const handleViewChats = (report: Report) => {
    setChatViewer({
      isOpen: true,
      reportId: report.id,
      reportDetails: {
        customerName: report.customerName,
        supplierBusinessName: report.supplierBusinessName || 'N/A'
      }
    });
  };

  const handleSendWhatsApp = async (report: Report) => {
    // Generate message
    const message = generateWhatsAppMessage(report);

    // Get phone number (remove any formatting)
    let phone = report.customerWhatsapp || '';
    phone = phone.replace(/\D/g, ''); // Remove non-digits

    // If phone doesn't start with country code, assume India (+91)
    if (phone.length === 10) {
      phone = '91' + phone;
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Open WhatsApp with pre-filled message
    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    // Open in new window
    window.open(whatsappUrl, '_blank');

    // Mark as sent in Firestore
    try {
      await updateDoc(doc(db, 'reports', report.id), {
        whatsappMessageSent: true,
        whatsappMessageSentAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await fetchReports();
      setToast({
        isOpen: true,
        message: 'WhatsApp opened! Message marked as sent.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error marking WhatsApp message as sent:', error);
      setToast({
        isOpen: true,
        message: 'Failed to mark message as sent.',
        type: 'error'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'under_discussion':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'published':
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending' || r.status === 'under_discussion').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    published: reports.filter(r => r.status === 'published').length,
  };

  return (
    <ProtectedRoute>
      <div className="admin-page">
        <Navbar />

      {/* Page Header */}
      <header className="admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Reports Management</h1>
            <p className="mt-1 text-slate-600">Monitor and manage all filed reports</p>
          </div>
        </div>
      </header>

      <main className="admin-main space-y-6">
        {/* Stats */}
        <section className="admin-panel p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="admin-metric">
              <p className="admin-metric-label">Total Reports</p>
              <p className="admin-metric-value">{stats.total}</p>
            </div>
            <div className="admin-metric">
              <p className="admin-metric-label">Pending</p>
              <p className="admin-metric-value">{stats.pending}</p>
            </div>
            <div className="admin-metric">
              <p className="admin-metric-label">Resolved</p>
              <p className="admin-metric-value">{stats.resolved}</p>
            </div>
            <div className="admin-metric">
              <p className="admin-metric-label">Published</p>
              <p className="admin-metric-value">{stats.published}</p>
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
                placeholder="Search by customer, supplier, invoice, or GST..."
                className="admin-input pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_discussion">Under Discussion</option>
              <option value="resolved">Resolved</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        <div className="admin-panel overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-sky-600"></div>
              <p className="mt-4 text-slate-600">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-slate-300" />
              <p className="text-slate-600">No reports found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Filed Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{report.customerName}</p>
                          <p className="text-sm text-gray-500 font-mono">{report.customerGSTIN || 'No GST'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{report.supplierBusinessName || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          ₹{report.amount?.toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 font-mono">{report.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">{report.typeOfComplaint || 'Payment Issue'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString('en-IN')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setDetailModal({ isOpen: true, report })}
                            className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewChats(report)}
                            className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition-colors"
                            title="View Chat History"
                          >
                            <MessagesSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendWhatsApp(report)}
                            className={`p-2 rounded-lg transition-colors ${
                              report.whatsappMessageSent
                                ? 'bg-green-100 hover:bg-green-200 text-green-600'
                                : 'bg-red-100 hover:bg-red-200 text-red-600'
                            }`}
                            title={report.whatsappMessageSent ? 'WhatsApp sent - Click to resend' : 'Send WhatsApp message'}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report.id, report.status)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id, report.customerName)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Delete Report"
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
      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal({ ...inputModal, isOpen: false })}
        onConfirm={handleStatusUpdate}
        title="Update Report Status"
        message={`Current status: ${inputModal.currentStatus}\n\nSelect new status:`}
        defaultValue={inputModal.currentStatus}
        options={['pending', 'under_discussion', 'resolved', 'published', 'rejected']}
      />

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
        onClose={() => setDetailModal({ isOpen: false, report: null })}
        title={`Report Details: ${detailModal.report?.customerName || ''}`}
        data={detailModal.report || {}}
      />

      <ChatViewer
        isOpen={chatViewer.isOpen}
        onClose={() => setChatViewer({ ...chatViewer, isOpen: false })}
        reportId={chatViewer.reportId}
        reportDetails={chatViewer.reportDetails}
      />
      </div>
    </ProtectedRoute>
  );
}
