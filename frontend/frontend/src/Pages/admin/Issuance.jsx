import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  Filter,
  Loader2,
  Package,
  Send,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';

const API_BASE = 'http://localhost:8080';
const BORROW_REQUESTS_API = `${API_BASE}/api/borrow-requests`;
const ISSUANCES_API = `${API_BASE}/api/issuances`;

const borrowRequestFilters = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

const defaultIssuanceForm = {
  issuanceId: '',
  issueDate: '',
  returnDueDate: '',
  conditionAtIssue: 'Working',
  qtyIssued: '1',
  status: 'Issued',
  equipmentId: '',
  equipmentName: '',
  userId: '',
  userName: '',
  roleDept: '',
  contact: '',
  remarks: '',
};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function makeIssuanceId(seed) {
  const safeSeed = String(seed || Date.now()).replace(/\D/g, '').slice(-6) || String(Date.now()).slice(-6);
  return `ISS-${safeSeed}`;
}

function normalizeBorrowRequest(request, fallbackIndex = 0) {
  const rawId = request.id ?? request.requestId ?? request.borrowRequestId ?? request.borrowRequestCode;
  return {
    id: rawId ?? `request-${fallbackIndex}`,
    requestId: request.requestCode ?? request.requestId ?? `BR-${String(rawId ?? fallbackIndex + 1).padStart(4, '0')}`,
    userName: request.userName ?? request.applicantName ?? request.name ?? 'Unknown user',
    userId: request.userId ?? request.registrationNumber ?? request.registrationOrStaffId ?? request.staffId ?? 'N/A',
    equipmentName: request.equipmentName ?? request.itemName ?? 'Unknown equipment',
    equipmentId: request.equipmentId ?? null,
    laboratoryName: request.laboratoryName ?? request.laboratory ?? request.labName ?? 'N/A',
    model: request.model ?? 'N/A',
    serialNumber: request.serialNumber ?? 'N/A',
    requestDate: request.requestDate ?? request.createdAt ?? request.createdDate ?? '',
    borrowStartDate: request.borrowStartDate ?? request.startDate ?? '',
    borrowEndDate: request.borrowEndDate ?? request.endDate ?? '',
    status: String(request.status ?? 'PENDING').toUpperCase(),
    purpose: request.purpose ?? request.reason ?? '',
    email: request.email ?? request.userEmail ?? '',
    contactNumber: request.contactNumber ?? request.contact ?? '',
    department: request.department ?? request.roleDept ?? '',
    returnDueDate: request.borrowEndDate ?? request.endDate ?? '',
    raw: request,
  };
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  console.debug('Admin API auth token:', token ? `${token.slice(0, 12)}...` : 'missing');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function statusBadgeClasses(status) {
  switch (String(status).toUpperCase()) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'REJECTED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

function getFilterStats(requests) {
  return {
    total: requests.length,
    pending: requests.filter((item) => item.status === 'PENDING').length,
    approved: requests.filter((item) => item.status === 'APPROVED').length,
    rejected: requests.filter((item) => item.status === 'REJECTED').length,
  };
}

function Button({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function Field({ label, children, helpText }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      {children}
      {helpText ? <p className="text-[11px] text-gray-500">{helpText}</p> : null}
    </div>
  );
}

function Input(props) {
  return <input {...props} className={`h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 ${props.className || ''}`} />;
}

function Select(props) {
  return <select {...props} className={`h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 ${props.className || ''}`} />;
}

function Textarea(props) {
  return <textarea {...props} className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 ${props.className || ''}`} />;
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-sm font-medium text-gray-800">{value || 'N/A'}</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-2 text-yellow-700">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function RequestDetailsModal({ request, onClose, onApprove, onReject, actionLoading }) {
  if (!request) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Borrow Request Details</h3>
            <p className="text-sm text-gray-500">{request.requestId}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard icon={UserRound} label="Requester" value={`${request.userName} / ${request.userId}`} />
            <InfoCard icon={Package} label="Equipment" value={request.equipmentName} />
            <InfoCard icon={CalendarDays} label="Borrow Period" value={`${request.borrowStartDate || 'N/A'} - ${request.borrowEndDate || 'N/A'}`} />
            <InfoCard icon={ShieldCheck} label="Status" value={request.status} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard icon={ClipboardList} label="Laboratory" value={request.laboratoryName} />
            <InfoCard icon={ArrowRight} label="Department" value={request.department || 'N/A'} />
            <InfoCard icon={Package} label="Model" value={request.model} />
            <InfoCard icon={Package} label="Serial Number" value={request.serialNumber} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Purpose</p>
            <p className="mt-2 text-sm text-gray-700">{request.purpose || 'N/A'}</p>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
            <Button onClick={onClose} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-100">
              Close
            </Button>
            <Button
              onClick={() => onReject(request)}
              disabled={actionLoading === request.id || request.status !== 'PENDING'}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              <XCircle size={16} />
              Reject
            </Button>
            <Button
              onClick={() => onApprove(request)}
              disabled={actionLoading === request.id || request.status !== 'PENDING'}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <CheckCircle2 size={16} />
              Approve / Issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BorrowRequestTable({ requests, filter, onFilterChange, onViewDetails, onApprove, onReject, actionLoading }) {
  const stats = getFilterStats(requests);

  const visibleRequests = useMemo(() => {
    if (filter === 'ALL') {
      return requests;
    }
    return requests.filter((request) => request.status === filter);
  }, [filter, requests]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-900">
              <ClipboardList size={20} className="text-yellow-600" />
              <h2 className="text-xl font-bold">Borrow Request Management</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">Review requests before creating an issuance record.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {borrowRequestFilters.map((item) => (
              <button
                key={item.value}
                onClick={() => onFilterChange(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === item.value ? 'bg-yellow-500 text-black' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                {item.label}
                <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">{item.value === 'ALL' ? stats.total : stats[item.value.toLowerCase()]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>Request ID</Th>
              <Th>User Name / ID</Th>
              <Th>Equipment Name</Th>
              <Th>Request Date / Borrow Period</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {visibleRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">
                  No borrow requests found for the selected filter.
                </td>
              </tr>
            ) : (
              visibleRequests.map((request) => (
                <tr key={request.id} className="align-top hover:bg-gray-50/70">
                  <Td className="font-semibold text-gray-900">{request.requestId}</Td>
                  <Td>
                    <div className="font-medium text-gray-900">{request.userName}</div>
                    <div className="text-xs text-gray-500">{request.userId}</div>
                  </Td>
                  <Td>
                    <div className="font-medium text-gray-900">{request.equipmentName}</div>
                    <div className="text-xs text-gray-500">{request.laboratoryName}</div>
                  </Td>
                  <Td>
                    <div className="text-sm text-gray-900">{request.requestDate || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{request.borrowStartDate || 'N/A'} - {request.borrowEndDate || 'N/A'}</div>
                  </Td>
                  <Td>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClasses(request.status)}`}>
                      {request.status}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button onClick={() => onViewDetails(request)} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-100">
                        <Eye size={16} />
                        View Details
                      </Button>
                      <Button
                        onClick={() => onApprove(request)}
                        disabled={actionLoading === request.id || request.status !== 'PENDING'}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        {actionLoading === request.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        Approve / Issue
                      </Button>
                      <Button
                        onClick={() => onReject(request)}
                        disabled={actionLoading === request.id || request.status !== 'PENDING'}
                        className="bg-rose-600 text-white hover:bg-rose-700"
                      >
                        <XCircle size={16} />
                        Reject
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({ children, className = '' }) {
  return <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 ${className}`}>{children}</th>;
}

function Td({ children, className = '' }) {
  return <td className={`px-6 py-4 text-sm text-gray-700 ${className}`}>{children}</td>;
}

function IssuanceForm({ form, setForm, selectedRequest, onReset, onSubmit, submitting, message, error }) {
  const formRef = useRef(null);

  useEffect(() => {
    if (selectedRequest && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedRequest]);

  return (
    <section ref={formRef} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b px-6 py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-900">
              <ShieldCheck size={20} className="text-yellow-600" />
              <h2 className="text-xl font-bold">Issuance Form</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">Use a pending request to prefill the issuance record, or create one manually.</p>
          </div>

          {selectedRequest ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
              Loaded from request <span className="font-semibold">{selectedRequest.requestId}</span>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Manual issuance mode
            </div>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 px-6 py-6">
        {selectedRequest ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard icon={Package} label="Equipment" value={`${form.equipmentName} (${form.equipmentId || 'N/A'})`} />
            <InfoCard icon={UserRound} label="Requester" value={`${form.userName} (${form.userId || 'N/A'})`} />
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Issuance ID" helpText="Auto-generated when empty.">
            <Input
              value={form.issuanceId}
              onChange={(event) => setForm((prev) => ({ ...prev, issuanceId: event.target.value }))}
              placeholder="ISS-000123"
            />
          </Field>
          <Field label="Issue Date">
            <Input
              type="date"
              value={form.issueDate}
              onChange={(event) => setForm((prev) => ({ ...prev, issueDate: event.target.value }))}
            />
          </Field>
          <Field label="Return Due Date">
            <Input
              type="date"
              value={form.returnDueDate}
              onChange={(event) => setForm((prev) => ({ ...prev, returnDueDate: event.target.value }))}
            />
          </Field>
          <Field label="Condition at Issue">
            <Select
              value={form.conditionAtIssue}
              onChange={(event) => setForm((prev) => ({ ...prev, conditionAtIssue: event.target.value }))}
            >
              <option value="Working">Working</option>
              <option value="Broken">Broken</option>
              <option value="Under Repair">Under Repair</option>
            </Select>
          </Field>
          <Field label="Quantity Issued">
            <Input
              type="number"
              min="1"
              value={form.qtyIssued}
              onChange={(event) => setForm((prev) => ({ ...prev, qtyIssued: event.target.value }))}
            />
          </Field>
          <Field label="Status">
            <Input value="Issued" readOnly className="bg-gray-100 text-gray-600" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Equipment ID">
            <Input
              value={form.equipmentId}
              onChange={(event) => setForm((prev) => ({ ...prev, equipmentId: event.target.value }))}
              readOnly={Boolean(selectedRequest?.equipmentId)}
              className={selectedRequest?.equipmentId ? 'bg-gray-100 text-gray-600' : ''}
            />
          </Field>
          <Field label="Equipment Name">
            <Input
              value={form.equipmentName}
              onChange={(event) => setForm((prev) => ({ ...prev, equipmentName: event.target.value }))}
              readOnly={Boolean(selectedRequest?.equipmentName)}
              className={selectedRequest?.equipmentName ? 'bg-gray-100 text-gray-600' : ''}
            />
          </Field>
          <Field label="User ID">
            <Input
              value={form.userId}
              onChange={(event) => setForm((prev) => ({ ...prev, userId: event.target.value }))}
              readOnly={Boolean(selectedRequest?.userId && selectedRequest.userId !== 'N/A')}
              className={selectedRequest?.userId && selectedRequest.userId !== 'N/A' ? 'bg-gray-100 text-gray-600' : ''}
            />
          </Field>
          <Field label="User Name">
            <Input
              value={form.userName}
              onChange={(event) => setForm((prev) => ({ ...prev, userName: event.target.value }))}
              readOnly={Boolean(selectedRequest?.userName)}
              className={selectedRequest?.userName ? 'bg-gray-100 text-gray-600' : ''}
            />
          </Field>
          <Field label="Department / Role">
            <Input
              value={form.roleDept}
              onChange={(event) => setForm((prev) => ({ ...prev, roleDept: event.target.value }))}
              placeholder="Student / Staff"
            />
          </Field>
          <Field label="Contact">
            <Input
              value={form.contact}
              onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
              placeholder="Phone number"
            />
          </Field>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Remarks</label>
          <Textarea
            rows={3}
            value={form.remarks}
            onChange={(event) => setForm((prev) => ({ ...prev, remarks: event.target.value }))}
            placeholder="Optional notes for this issuance."
          />
        </div>

        {message ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
          <Button type="button" onClick={onReset} className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-100">
            Reset Form
          </Button>
          <Button type="submit" disabled={submitting} className="bg-yellow-500 text-black hover:bg-yellow-400">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? 'Submitting...' : 'Create Issuance'}
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function Issuance() {
  const location = useLocation();
  const navigate = useNavigate();
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestsError, setRequestsError] = useState('');
  const [filter, setFilter] = useState('PENDING');
  const [detailsRequest, setDetailsRequest] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [form, setForm] = useState(defaultIssuanceForm);

  const incomingState = location.state;

  useEffect(() => {
    fetchBorrowRequests();
  }, []);

  useEffect(() => {
    if (incomingState && typeof incomingState === 'object') {
      const normalized = normalizeBorrowRequest(incomingState);
      preloadFromRequest(normalized);
    }
  }, [incomingState]);

  async function fetchBorrowRequests() {
    try {
      setLoadingRequests(true);
      setRequestsError('');
      console.debug('Fetching borrow requests with Authorization header');
      const response = await axios.get(BORROW_REQUESTS_API, {
        headers: getAuthHeaders(),
      });
      const normalized = Array.isArray(response.data)
        ? response.data.map((item, index) => normalizeBorrowRequest(item, index))
        : [];
      setBorrowRequests(normalized);
      if (!selectedRequest && normalized.length > 0 && filter === 'PENDING') {
        // keep the page useful even when the API returns mixed data
        setFormMessage('Borrow requests loaded successfully.');
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setRequestsError('Session expired or unauthorized. Please login again.');
        return;
      }

      setRequestsError(
        error.response?.data?.message ||
          error.response?.data ||
          'Failed to load borrow requests. Check backend /api/borrow-requests.'
      );
    } finally {
      setLoadingRequests(false);
    }
  }

  function resetForm() {
    setForm(defaultIssuanceForm);
    setSelectedRequest(null);
    setFormError('');
    setFormMessage('');
  }

  function preloadFromRequest(request) {
    setSelectedRequest(request);
    setForm((prev) => ({
      ...prev,
      issuanceId: makeIssuanceId(request.id),
      issueDate: todayValue(),
      returnDueDate: request.borrowEndDate || '',
      conditionAtIssue: 'Working',
      qtyIssued: '1',
      status: 'Issued',
      equipmentId: request.equipmentId ? String(request.equipmentId) : '',
      equipmentName: request.equipmentName,
      userId: request.userId && request.userId !== 'N/A' ? String(request.userId) : '',
      userName: request.userName,
      roleDept: request.department || '',
      contact: request.contactNumber || '',
      remarks: request.purpose ? `Borrow request purpose: ${request.purpose}` : '',
    }));
    setFormError('');
    setFormMessage('Selected request loaded into the issuance form.');
  }

  function handleApprove(request) {
    if (request.status !== 'PENDING') {
      setFormError('Only pending requests can be issued.');
      return;
    }
    navigate('/issuance', { state: request.raw });
  }

  async function updateBorrowRequestStatus(request, status) {
    const requestId = request.raw?.id ?? request.raw?.requestId ?? request.id;
    if (!requestId) {
      throw new Error('Borrow request ID is missing.');
    }

    const response = await axios.patch(
      `${BORROW_REQUESTS_API}/${requestId}`,
      { status },
      { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
    );
    return response.data;
  }

  async function handleReject(request) {
    const confirmed = window.confirm(`Reject borrow request ${request.requestId}?`);
    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(request.id);
      setFormMessage('');
      setFormError('');
      await updateBorrowRequestStatus(request, 'REJECTED');
      await fetchBorrowRequests();
      if (selectedRequest?.id === request.id) {
        setSelectedRequest(null);
        setForm(defaultIssuanceForm);
      }
      if (detailsRequest?.id === request.id) {
        setDetailsRequest(null);
      }
      setFormMessage(`Borrow request ${request.requestId} rejected.`);
    } catch (error) {
      setFormError(error.response?.data?.message || error.response?.data || 'Failed to reject borrow request.');
    } finally {
      setActionLoadingId(null);
    }
  }

  function validateIssuanceForm() {
    const nextErrors = {};
    if (!form.issuanceId.trim()) {
      nextErrors.issuanceId = 'Issuance ID is required.';
    }
    if (!form.issueDate) {
      nextErrors.issueDate = 'Issue date is required.';
    }
    if (!form.returnDueDate) {
      nextErrors.returnDueDate = 'Return due date is required.';
    }
    if (form.issueDate && form.returnDueDate) {
      const issueDate = new Date(form.issueDate);
      const dueDate = new Date(form.returnDueDate);
      if (dueDate <= issueDate) {
        nextErrors.returnDueDate = 'Return due date must be after issue date.';
      }
    }
    if (!form.conditionAtIssue.trim()) {
      nextErrors.conditionAtIssue = 'Condition at issue is required.';
    }
    if (!form.equipmentId.trim()) {
      nextErrors.equipmentId = 'Equipment ID is required.';
    } else if (Number.isNaN(Number(form.equipmentId))) {
      nextErrors.equipmentId = 'Equipment ID must be numeric for issuance creation.';
    }
    if (!form.equipmentName.trim()) {
      nextErrors.equipmentName = 'Equipment name is required.';
    }
    if (!form.userId.trim()) {
      nextErrors.userId = 'User ID is required.';
    } else if (Number.isNaN(Number(form.userId))) {
      nextErrors.userId = 'User ID must be numeric for issuance creation.';
    }
    if (!form.userName.trim()) {
      nextErrors.userName = 'User name is required.';
    }
    if (!form.qtyIssued.trim() || Number(form.qtyIssued) <= 0) {
      nextErrors.qtyIssued = 'Quantity issued must be a positive number.';
    }

    return nextErrors;
  }

  async function handleCreateIssuance(event) {
    event.preventDefault();
    const nextErrors = validateIssuanceForm();
    if (Object.keys(nextErrors).length > 0) {
      setFormError(Object.values(nextErrors)[0]);
      return;
    }

    const confirmed = window.confirm('Create this issuance record now?');
    if (!confirmed) {
      return;
    }

    const payload = {
      issuanceId: form.issuanceId.trim() || makeIssuanceId(selectedRequest?.id),
      issueDate: form.issueDate,
      returnDueDate: form.returnDueDate,
      status: 'Issued',
      equipmentId: Number(form.equipmentId),
      qtyIssued: Number(form.qtyIssued),
      conditionAtIssue: form.conditionAtIssue,
      userId: Number(form.userId),
      roleDept: form.roleDept || null,
      contact: form.contact || null,
      returnDate: null,
      conditionOnReturn: null,
      remarks: form.remarks || null,
    };

    try {
      setFormSubmitting(true);
      setFormError('');
      setFormMessage('');

      await axios.post(ISSUANCES_API, payload, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      });

      if (selectedRequest) {
        await updateBorrowRequestStatus(selectedRequest, 'APPROVED');
        await fetchBorrowRequests();
      }

      setFormMessage('Issuance created successfully. Borrow request updated to Approved.');
      setSelectedRequest(null);
      setDetailsRequest(null);
      setForm(defaultIssuanceForm);
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          error.response?.data ||
          'Failed to create issuance record.'
      );
    } finally {
      setFormSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 p-6 text-black shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList size={22} />
              <h1 className="text-2xl font-bold">Borrow Requests and Issuance</h1>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-black/75">
              Review pending requests, approve them into issuance records, and keep the workflow connected from request to return tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={fetchBorrowRequests} className="bg-black text-white hover:bg-gray-800">
              <Filter size={16} />
              Refresh Requests
            </Button>
            <Button onClick={resetForm} className="border border-black/20 bg-white/70 text-black hover:bg-white">
              Clear Issuance Form
            </Button>
          </div>
        </div>
      </div>

      {requestsError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {requestsError}
        </div>
      ) : null}

      {formMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {formMessage}
        </div>
      ) : null}

      {loadingRequests ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 shadow-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="animate-spin" size={18} />
            Loading borrow requests...
          </div>
        </div>
      ) : (
        <BorrowRequestTable
          requests={borrowRequests}
          filter={filter}
          onFilterChange={setFilter}
          onViewDetails={setDetailsRequest}
          onApprove={handleApprove}
          onReject={handleReject}
          actionLoading={actionLoadingId}
        />
      )}

      <IssuanceForm
        form={form}
        setForm={setForm}
        selectedRequest={selectedRequest}
        onReset={resetForm}
        onSubmit={handleCreateIssuance}
        submitting={formSubmitting}
        message={formMessage}
        error={formError}
      />

      {detailsRequest ? (
        <RequestDetailsModal
          request={detailsRequest}
          onClose={() => setDetailsRequest(null)}
          onApprove={(request) => handleApprove(request)}
          onReject={(request) => handleReject(request)}
          actionLoading={actionLoadingId}
        />
      ) : null}
    </div>
  );
}
