import { X, User, Mail, Phone, Building2, Calendar, MapPin, FileText, CreditCard, Star, TrendingUp } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any>;
}

export default function DetailModal({ isOpen, onClose, title, data }: DetailModalProps) {
  if (!isOpen) return null;

  // Define field order priority
  const fieldOrder: Record<string, number> = {
    // Business & Identity (Priority 1-10)
    businessName: 1,
    name: 2,
    fullName: 3,
    customerName: 2,
    supplierBusinessName: 3,
    company: 4,
    gst: 4,
    customerGSTIN: 5,
    recipientGSTIN: 6,
    pan: 7,
    entityType: 8,

    // Contact Information (Priority 11-20)
    email: 11,
    customerEmail: 12,
    recipientEmail: 13,
    mobileNumber: 14,
    customerMobileNumber: 15,
    phone: 16,
    source: 19,

    // Trust Score & Breakdown (Priority 17-20)
    trustScore: 17,
    scoreBreakdown: 18,

    // Financial Information (Priority 21-30)
    amount: 21,
    invoiceNumber: 22,
    paymentDueDate: 23,
    paymentTerms: 24,

    // Status & Type (Priority 31-40)
    status: 31,
    type: 32,
    typeOfComplaint: 33,
    verified: 34,
    suspended: 35,
    onboardingCompleted: 36,
    read: 37,

    // Main Content (Priority 41-50)
    title: 41,
    message: 42,
    description: 43,
    complaintDescription: 44,

    // Location (Priority 51-60)
    address: 51,
    city: 52,
    state: 53,
    pincode: 54,
    country: 55,

    // Documents & Evidence (Priority 61-70)
    supportingDocuments: 61,
    evidenceDocuments: 62,
    invoiceDocument: 63,

    // IDs & References (Priority 71-80)
    reportId: 71,
    supplierId: 72,
    customerId: 73,

    // Timestamps (Priority 81-90)
    createdAt: 81,
    updatedAt: 82,
    verifiedAt: 83,
    suspendedAt: 84,
    resolvedAt: 85,

    // Other metadata (Priority 91+)
    verifiedBy: 91,
    updatedBy: 92,
    resolvedBy: 93,
  };

  const getFieldPriority = (key: string): number => {
    return fieldOrder[key] ?? 999; // Unknown fields go to the end
  };

  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      gst: 'GST Number',
      customerGSTIN: 'Customer GSTIN',
      recipientGSTIN: 'Recipient GSTIN',
      pan: 'PAN Number',
      mobileNumber: 'Mobile Number',
      customerMobileNumber: 'Customer Mobile',
      businessName: 'Business Name',
      name: 'Name',
      fullName: 'Full Name',
      company: 'Company',
      source: 'Source',
      customerName: 'Customer Name',
      supplierBusinessName: 'Supplier Business Name',
      entityType: 'Entity Type',
      onboardingCompleted: 'Onboarding Status',
      typeOfComplaint: 'Complaint Type',
      invoiceNumber: 'Invoice Number',
      paymentDueDate: 'Payment Due Date',
      paymentTerms: 'Payment Terms',
      complaintDescription: 'Complaint Description',
      reportId: 'Report ID',
      supplierId: 'Supplier ID',
      customerId: 'Customer ID',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      verifiedAt: 'Verified At',
      suspendedAt: 'Suspended At',
      resolvedAt: 'Resolved At',
      verifiedBy: 'Verified By',
      updatedBy: 'Updated By',
      resolvedBy: 'Resolved By',
      recipientEmail: 'Recipient Email',
      customerEmail: 'Customer Email',
      supportingDocuments: 'Supporting Documents',
      evidenceDocuments: 'Evidence Documents',
      invoiceDocument: 'Invoice Document',
      trustScore: 'Trust Score',
      scoreBreakdown: 'Score Breakdown',
    };

    return keyMap[key] || key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'N/A';

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    if (typeof value === 'object' && !Array.isArray(value)) {
      return JSON.stringify(value, null, 2);
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'N/A';
    }

    // Check if it's a date string
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
      try {
        return new Date(value).toLocaleString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return value;
      }
    }

    return String(value);
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50/60 border-green-200';
    if (score >= 60) return 'text-brand-800 bg-brand-50/60 border-brand-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50/60 border-yellow-200';
    return 'text-red-600 bg-red-50/60 border-red-200';
  };

  const renderTrustScore = (score: number) => {
    const percentage = Math.min(100, Math.max(0, score));
    return (
      <div className="space-y-3">
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${getTrustScoreColor(score)}`}>
          <Star className="w-6 h-6" fill="currentColor" />
          <div className="flex-1">
            <div className="text-3xl font-bold">{score}/100</div>
            <div className="text-xs font-semibold opacity-85">Overall Trust Score</div>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/40">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score >= 80 ? 'bg-green-500' :
              score >= 60 ? 'bg-brand-600' :
              score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const renderScoreBreakdown = (breakdown: any) => {
    if (!breakdown || typeof breakdown !== 'object') return <div className="text-slate-400 font-medium text-sm">No breakdown available</div>;

    const breakdownLabels: Record<string, string> = {
      paymentHistory: 'Payment History',
      disputeResolution: 'Dispute Resolution',
      businessCredibility: 'Business Credibility',
      transactionVolume: 'Transaction Volume',
      customerFeedback: 'Customer Feedback',
    };

    return (
      <div className="space-y-3">
        {Object.entries(breakdown).map(([key, value]) => {
          const score = typeof value === 'number' ? value : 0;
          const percentage = Math.min(100, Math.max(0, score));
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{breakdownLabels[key] || key}</span>
                <span className={`font-bold ${
                  score >= 80 ? 'text-green-600' :
                  score >= 60 ? 'text-brand-800' :
                  score >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>{score}/100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    score >= 80 ? 'bg-green-500' :
                    score >= 60 ? 'bg-brand-600' :
                    score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderField = (key: string, value: any) => {
    if (key === 'id') return null; // Skip rendering ID in the list

    // Custom rendering for trust score
    if (key === 'trustScore' && typeof value === 'number') {
      return (
        <div key={key} className="py-3 border-b border-slate-100 last:border-0 col-span-2">
          <dt className="text-sm font-semibold mb-3 text-brand-800">
            {formatKey(key)}
          </dt>
          <dd>{renderTrustScore(value)}</dd>
        </div>
      );
    }

    // Custom rendering for score breakdown
    if (key === 'scoreBreakdown') {
      return (
        <div key={key} className="py-3 border-b border-slate-100 last:border-0 col-span-2">
          <dt className="text-sm font-semibold mb-3 text-brand-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {formatKey(key)}
          </dt>
          <dd>{renderScoreBreakdown(value)}</dd>
        </div>
      );
    }

    const isLongText = typeof value === 'object' || (typeof value === 'string' && value.length > 100);
    const isImportant = getFieldPriority(key) <= 40;

    return (
      <div key={key} className={`py-3 border-b border-slate-100 last:border-0 ${isLongText ? 'col-span-2' : ''}`}>
        <dt className={`text-sm font-semibold mb-1 ${isImportant ? 'text-brand-800' : 'text-slate-500'}`}>
          {formatKey(key)}
        </dt>
        <dd className={`text-sm ${isImportant ? 'text-slate-900 font-medium' : 'text-slate-700'} ${isLongText ? 'whitespace-pre-wrap font-mono text-xs bg-slate-50 border border-slate-200/50 p-3 rounded-xl' : ''}`}>
          {formatValue(value)}
        </dd>
      </div>
    );
  };

  // Sort fields by priority
  const sortedEntries = Object.entries(data).sort((a, b) => {
    return getFieldPriority(a[0]) - getFieldPriority(b[0]);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-card border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {title}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">Complete Information Summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Business & Identity Section */}
          {sortedEntries.some(([key]) => getFieldPriority(key) >= 1 && getFieldPriority(key) <= 10) && (
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-4 pb-1.5 border-b-2 border-brand-500">
                Business & Identity
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedEntries
                  .filter(([key]) => getFieldPriority(key) >= 1 && getFieldPriority(key) <= 10)
                  .map(([key, value]) => renderField(key, value))}
              </dl>
            </div>
          )}

          {/* Contact Information Section */}
          {sortedEntries.some(([key]) => getFieldPriority(key) >= 11 && getFieldPriority(key) <= 20) && (
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-4 pb-1.5 border-b-2 border-emerald-500">
                Contact Information
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedEntries
                  .filter(([key]) => getFieldPriority(key) >= 11 && getFieldPriority(key) <= 20)
                  .map(([key, value]) => renderField(key, value))}
              </dl>
            </div>
          )}

          {/* Financial Information Section */}
          {sortedEntries.some(([key]) => getFieldPriority(key) >= 21 && getFieldPriority(key) <= 30) && (
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-4 pb-1.5 border-b-2 border-indigo-500">
                Financial Information
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedEntries
                  .filter(([key]) => getFieldPriority(key) >= 21 && getFieldPriority(key) <= 30)
                  .map(([key, value]) => renderField(key, value))}
              </dl>
            </div>
          )}

          {/* Status & Type Section */}
          {sortedEntries.some(([key]) => getFieldPriority(key) >= 31 && getFieldPriority(key) <= 40) && (
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-4 pb-1.5 border-b-2 border-amber-500">
                Status & Type
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedEntries
                  .filter(([key]) => getFieldPriority(key) >= 31 && getFieldPriority(key) <= 40)
                  .map(([key, value]) => renderField(key, value))}
              </dl>
            </div>
          )}

          {/* Main Content Section */}
          {sortedEntries.some(([key]) => getFieldPriority(key) >= 41 && getFieldPriority(key) <= 50) && (
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-4 pb-1.5 border-b-2 border-violet-500">
                Content & Description
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedEntries
                  .filter(([key]) => getFieldPriority(key) >= 41 && getFieldPriority(key) <= 50)
                  .map(([key, value]) => renderField(key, value))}
              </dl>
            </div>
          )}

          {/* Location Section */}
          {sortedEntries.some(([key]) => getFieldPriority(key) >= 51 && getFieldPriority(key) <= 60) && (
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-4 pb-1.5 border-b-2 border-teal-500">
                Location Details
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedEntries
                  .filter(([key]) => getFieldPriority(key) >= 51 && getFieldPriority(key) <= 60)
                  .map(([key, value]) => renderField(key, value))}
              </dl>
            </div>
          )}

          {/* Documents & Evidence Section */}
          {sortedEntries.some(([key]) => getFieldPriority(key) >= 61 && getFieldPriority(key) <= 70) && (
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-4 pb-1.5 border-b-2 border-pink-500">
                Documents & Evidence
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedEntries
                  .filter(([key]) => getFieldPriority(key) >= 61 && getFieldPriority(key) <= 70)
                  .map(([key, value]) => renderField(key, value))}
              </dl>
            </div>
          )}

          {/* References Section */}
          {sortedEntries.some(([key]) => getFieldPriority(key) >= 71 && getFieldPriority(key) <= 80) && (
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-4 pb-1.5 border-b-2 border-sky-500">
                IDs & References
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedEntries
                  .filter(([key]) => getFieldPriority(key) >= 71 && getFieldPriority(key) <= 80)
                  .map(([key, value]) => renderField(key, value))}
              </dl>
            </div>
          )}

          {/* Timestamps Section */}
          {sortedEntries.some(([key]) => getFieldPriority(key) >= 81 && getFieldPriority(key) <= 90) && (
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-4 pb-1.5 border-b-2 border-slate-400">
                Timestamps
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedEntries
                  .filter(([key]) => getFieldPriority(key) >= 81 && getFieldPriority(key) <= 90)
                  .map(([key, value]) => renderField(key, value))}
              </dl>
            </div>
          )}

          {/* Other Information Section */}
          {sortedEntries.some(([key]) => getFieldPriority(key) >= 91) && (
            <div className="mb-6">
              <h4 className="text-base font-bold text-slate-900 mb-4 pb-1.5 border-b-2 border-slate-350">
                Additional Information
              </h4>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {sortedEntries
                  .filter(([key]) => getFieldPriority(key) >= 91)
                  .map(([key, value]) => renderField(key, value))}
              </dl>
            </div>
          )}

          {/* ID displayed separately at the bottom */}
          {data.id && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl">
                <dt className="text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                  Document ID
                </dt>
                <dd className="text-sm font-mono text-slate-700 break-all select-all">
                  {data.id}
                </dd>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-brand-800 hover:bg-brand-700 text-white rounded-xl font-medium transition-all shadow-sm shadow-brand-200 min-w-32"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
