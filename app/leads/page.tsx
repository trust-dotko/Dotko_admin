'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, UserPlus, CalendarDays, Mail, Phone, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DetailModal from '@/components/DetailModal';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Lead {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  source?: string;
  createdAt?: any;
  [key: string]: any;
}

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; lead: Lead | null }>({
    isOpen: false,
    lead: null,
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let snapshot;

      try {
        snapshot = await getDocs(query(collection(db, 'landing_signups'), orderBy('createdAt', 'desc')));
      } catch {
        snapshot = await getDocs(collection(db, 'landing_signups'));
      }

      const leadsData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Lead))
        .sort((a, b) => {
          const aTime = toDate(a.createdAt)?.getTime() ?? 0;
          const bTime = toDate(b.createdAt)?.getTime() ?? 0;
          return bTime - aTime;
        });

      setLeads(leadsData);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const source = (lead.source || 'unknown').toLowerCase();
      const matchesSource = sourceFilter === 'all' || source === sourceFilter;

      if (!matchesSource) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(q) ||
        lead.fullName?.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q) ||
        lead.phone?.toLowerCase().includes(q) ||
        lead.mobile?.toLowerCase().includes(q) ||
        lead.company?.toLowerCase().includes(q)
      );
    });
  }, [leads, searchQuery, sourceFilter]);

  const sourceOptions = useMemo(() => {
    const uniqueSources = Array.from(new Set(leads.map((lead) => (lead.source || 'unknown').toLowerCase()))).sort();
    return uniqueSources;
  }, [leads]);

  const todayCount = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return leads.filter((lead) => {
      const createdAt = toDate(lead.createdAt);
      return createdAt ? createdAt >= startOfToday : false;
    }).length;
  }, [leads]);

  const weekCount = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    return leads.filter((lead) => {
      const createdAt = toDate(lead.createdAt);
      return createdAt ? createdAt >= start : false;
    }).length;
  }, [leads]);

  const monthCount = useMemo(() => {
    const now = new Date();
    return leads.filter((lead) => {
      const createdAt = toDate(lead.createdAt);
      return createdAt
        ? createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
        : false;
    }).length;
  }, [leads]);

  return (
    <ProtectedRoute>
      <div className="admin-page">
        <Navbar />

        <header className="admin-header">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-semibold text-slate-900">Website Leads</h1>
            <p className="mt-1 text-slate-600">Landing page signups from `landing_signups` collection</p>
          </div>
        </header>

        <main className="admin-main space-y-6">
          <section className="admin-panel p-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="admin-metric">
                <p className="admin-metric-label">Total Leads</p>
                <p className="admin-metric-value">{leads.length}</p>
              </div>
              <div className="admin-metric">
                <p className="admin-metric-label">Leads Today</p>
                <p className="admin-metric-value">{todayCount}</p>
              </div>
              <div className="admin-metric">
                <p className="admin-metric-label">Last 7 Days</p>
                <p className="admin-metric-value">{weekCount}</p>
              </div>
              <div className="admin-metric">
                <p className="admin-metric-label">This Month</p>
                <p className="admin-metric-value">{monthCount}</p>
              </div>
            </div>
          </section>

          <section className="admin-panel p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="admin-input pl-10"
                  value={searchQuery}
                  placeholder="Search by name, email, phone, company"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">All Sources</option>
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="admin-panel overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-slate-600">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center">
                <UserPlus className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="text-slate-600">No leads found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Lead</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Created</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredLeads.map((lead) => {
                      const createdAt = toDate(lead.createdAt);
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{lead.name || lead.fullName || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{lead.company || 'No company provided'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <div className="space-y-1">
                              <p className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                {lead.email || 'N/A'}
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {lead.phone || lead.mobile || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-slate-700">
                              {lead.source || 'unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <p className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-slate-400" />
                              {createdAt ? createdAt.toLocaleString('en-IN') : 'N/A'}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setDetailModal({ isOpen: true, lead })}
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
                              title="View lead details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>

        <DetailModal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal({ isOpen: false, lead: null })}
          title={`Lead Details: ${detailModal.lead?.name || detailModal.lead?.fullName || ''}`}
          data={detailModal.lead || {}}
        />
      </div>
    </ProtectedRoute>
  );
}
