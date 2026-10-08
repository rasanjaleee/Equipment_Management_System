import { useEffect, useMemo, useState } from 'react';
import { X, ClipboardList, CalendarDays, UserRound, Send } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../services/api';

const API_BASE = API_BASE_URL;

const initialForm = {
  applicantName: '',
  registrationOrStaffId: '',
  department: '',
  email: '',
  contactNumber: '',
  borrowStartDate: '',
  borrowEndDate: '',
  purpose: ''
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BorrowRequestForm({
  isOpen,
  onClose,
  equipmentList,
  preselectedEquipment,
  onSubmitted
}) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [availability, setAvailability] = useState({ checked: false, available: null, message: '' });
  const [calendarOpen, setCalendarOpen] = useState(false);
const [calendarDate, setCalendarDate] = useState(new Date());
const [blockedPeriods, setBlockedPeriods] = useState([]);
const [calendarLoading, setCalendarLoading] = useState(false);
const [calendarError, setCalendarError] = useState('');
const [calendarStartDate, setCalendarStartDate] = useState('');
const [calendarEndDate, setCalendarEndDate] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (preselectedEquipment?.id) {
      setSelectedEquipmentId(String(preselectedEquipment.id));
    } else {
      setSelectedEquipmentId('');
    }

    let loggedInEmail = '';

try {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  loggedInEmail = storedUser?.email || '';
} catch {
  loggedInEmail = '';
}

setFormData({
  ...initialForm,
  email: loggedInEmail
});
    setErrors({});
    setSubmitError('');
    setSuccessMessage('');
    setAvailability({ checked: false, available: null, message: '' });
  }, [isOpen, preselectedEquipment]);

  const selectedEquipment = useMemo(
    () => equipmentList.find((item) => String(item.id) === String(selectedEquipmentId)) || null,
    [equipmentList, selectedEquipmentId]
  );

  const updateField = (key) => (event) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    setSubmitError('');
    setAvailability((prev) => ({ ...prev, checked: false, message: '' }));
  };

  const checkAvailability = async () => {
    if (!selectedEquipmentId || !formData.borrowStartDate || !formData.borrowEndDate) {
      return { available: null, message: '' };
    }

    try {
      setAvailabilityChecking(true);
      const token = localStorage.getItem('token');
      console.debug('Borrow request availability token:', token ? `${token.slice(0, 12)}...` : 'missing');

      const response = await axios.get(`${API_BASE}/api/equipment/availability`, {
        params: {
          equipmentId: selectedEquipmentId,
          startDate: formData.borrowStartDate,
          endDate: formData.borrowEndDate
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const message = response.data?.message || 'Equipment is available for the selected date range.';
      setAvailability({ checked: true, available: true, message });
      return { available: true, message };
    } catch (error) {
      if (error.response?.status === 409) {
        const message = error.response?.data?.message || 'Equipment is not available for the selected date range.';
        setAvailability({ checked: true, available: false, message });
        return { available: false, message };
      }

      const message = error.response?.data?.message || 'Unable to verify availability. Please try again.';
      setAvailability({ checked: true, available: null, message });
      return { available: null, message };
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const loadCalendarAvailability = async (date = calendarDate) => {
  if (!selectedEquipmentId) {
    setCalendarError('Please select equipment first.');
    return;
  }

  try {
    setCalendarLoading(true);
    setCalendarError('');

    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const formatDate = (value) => {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const token = localStorage.getItem('token');

    const response = await axios.get(
      `${API_BASE}/api/equipment/${selectedEquipmentId}/availability-calendar`,
      {
        params: {
          startDate: formatDate(firstDay),
          endDate: formatDate(lastDay)
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );

    setBlockedPeriods(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error('Failed to load equipment calendar:', error);

    setBlockedPeriods([]);
    setCalendarError(
      error.response?.data?.message ||
        'Unable to load equipment availability calendar.'
    );
  } finally {
    setCalendarLoading(false);
  }
};

const openCalendar = async () => {
  if (!selectedEquipmentId) {
    setErrors((prev) => ({
      ...prev,
      selectedEquipmentId: 'Please select equipment first.'
    }));
    return;
  }

  const initialDate = formData.borrowStartDate
    ? new Date(`${formData.borrowStartDate}T00:00:00`)
    : new Date();

  setCalendarDate(initialDate);
  setCalendarStartDate(formData.borrowStartDate || '');
  setCalendarEndDate(formData.borrowEndDate || '');
  setCalendarError('');
  setCalendarOpen(true);

  await loadCalendarAvailability(initialDate);
};

const changeCalendarMonth = async (offset) => {
  const newDate = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + offset,
    1
  );

  setCalendarDate(newDate);
  setCalendarStartDate('');
  setCalendarEndDate('');

  await loadCalendarAvailability(newDate);
};

const isDateBlocked = (dateString) => {
  return blockedPeriods.some(
    (period) =>
      dateString >= period.startDate &&
      dateString <= period.endDate
  );
};

const handleCalendarDateClick = (dateString) => {
  if (isDateBlocked(dateString)) {
    return;
  }

  if (!calendarStartDate || calendarEndDate) {
    setCalendarStartDate(dateString);
    setCalendarEndDate('');
    return;
  }

  if (dateString <= calendarStartDate) {
    setCalendarStartDate(dateString);
    setCalendarEndDate('');
    return;
  }

  const selectedStart = new Date(`${calendarStartDate}T00:00:00`);
  const selectedEnd = new Date(`${dateString}T00:00:00`);

  const blockedInsideRange = blockedPeriods.some((period) => {
    const blockedStart = new Date(`${period.startDate}T00:00:00`);
    const blockedEnd = new Date(`${period.endDate}T00:00:00`);

    return blockedStart <= selectedEnd && blockedEnd >= selectedStart;
  });

  if (blockedInsideRange) {
    setCalendarError(
      'The selected range contains unavailable dates. Please choose another range.'
    );
    return;
  }

  setCalendarError('');
  setCalendarEndDate(dateString);
};

const useCalendarDates = () => {
  if (!calendarStartDate || !calendarEndDate) {
    setCalendarError('Please select both a start date and an end date.');
    return;
  }

  setFormData((prev) => ({
    ...prev,
    borrowStartDate: calendarStartDate,
    borrowEndDate: calendarEndDate
  }));

  setErrors((prev) => ({
    ...prev,
    borrowStartDate: '',
    borrowEndDate: ''
  }));

  setAvailability({
    checked: false,
    available: null,
    message: ''
  });

  setCalendarOpen(false);
};

  useEffect(() => {
    const runAvailabilityCheck = async () => {
      if (!selectedEquipmentId || !formData.borrowStartDate || !formData.borrowEndDate) {
        setAvailability({ checked: false, available: null, message: '' });
        return;
      }

      const start = new Date(formData.borrowStartDate);
      const end = new Date(formData.borrowEndDate);
      if (end <= start) {
        setAvailability({
          checked: true,
          available: false,
          message: 'Borrow end date must be after start date.'
        });
        return;
      }

      await checkAvailability();
    };

    runAvailabilityCheck();
  }, [selectedEquipmentId, formData.borrowStartDate, formData.borrowEndDate]);

  const validate = () => {
    const nextErrors = {};

    if (!selectedEquipment) {
      nextErrors.selectedEquipmentId = 'Please select equipment.';
    }

    if (!formData.applicantName.trim()) {
      nextErrors.applicantName = 'Name is required.';
    }

    if (!formData.registrationOrStaffId.trim()) {
      nextErrors.registrationOrStaffId = 'Registration number or staff ID is required.';
    }

    if (!formData.department.trim()) {
      nextErrors.department = 'Department is required.';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!formData.contactNumber.trim()) {
      nextErrors.contactNumber = 'Contact number is required.';
    }

    if (!formData.borrowStartDate) {
      nextErrors.borrowStartDate = 'Borrow start date is required.';
    }

    if (!formData.borrowEndDate) {
      nextErrors.borrowEndDate = 'Borrow end date is required.';
    }

    if (formData.borrowStartDate && formData.borrowEndDate) {
      const startDate = new Date(formData.borrowStartDate);
      const endDate = new Date(formData.borrowEndDate);
      if (endDate <= startDate) {
        nextErrors.borrowEndDate = 'Borrow end date must be after start date.';
      }
    }

    if (!formData.purpose.trim()) {
      nextErrors.purpose = 'Purpose is required.';
    }

    if (availability.checked && availability.available === false) {
      nextErrors.borrowEndDate = 'Selected equipment is unavailable for this period.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const availabilityResult = await checkAvailability();
    if (availabilityResult.available === false) {
      setSubmitError(availabilityResult.message || 'Equipment is not available for the selected date range.');
      return;
    }
    if (availabilityResult.available === null) {
      setSubmitError(availabilityResult.message || 'Could not validate availability. Please try again.');
      return;
    }

    const result = await Swal.fire({
  title: 'Submit Borrow Request?',
  text: 'Are you sure you want to submit this borrow request?',
  icon: 'question',
  showCancelButton: true,
  confirmButtonText: 'Yes, Submit',
  cancelButtonText: 'Cancel',
  confirmButtonColor: '#eab308',
  cancelButtonColor: '#6b7280',
  reverseButtons: true
});

if (!result.isConfirmed) {
  return;
}

    const payload = {
      equipmentId: selectedEquipment.id,
      equipmentName: selectedEquipment.equipmentName,
      laboratoryName: selectedEquipment.laboratory || '',
      model: selectedEquipment.model || '',
      serialNumber: selectedEquipment.serialNumber || '',
      applicantName: formData.applicantName.trim(),
      registrationOrStaffId: formData.registrationOrStaffId.trim(),
      department: formData.department.trim(),
      email: formData.email.trim(),
      contactNumber: formData.contactNumber.trim(),
      borrowStartDate: formData.borrowStartDate,
      borrowEndDate: formData.borrowEndDate,
      purpose: formData.purpose.trim(),
      status: 'PENDING'
    };

    try {
      setLoading(true);
      setSubmitError('');
      setSuccessMessage('');

      const token = localStorage.getItem('token');
      console.debug('Submitting borrow request with token:', token ? `${token.slice(0, 12)}...` : 'missing');
      await axios.post(`${API_BASE}/api/borrow-requests`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setSuccessMessage('Borrow request submitted successfully.');
      setFormData((prev) => ({
  ...initialForm,
  email: prev.email
}));
      setErrors({});

      setTimeout(() => {
        onSubmitted?.();
        onClose();
      }, 900);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          error.response?.data ||
          'Failed to submit borrow request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
  <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <ClipboardList size={20} className="text-yellow-600" />
              Borrow Request Form
            </h2>
            <p className="text-sm text-gray-500">Submit one centralized request for selected equipment.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Select Equipment</h3>
            <label className="mb-1 block text-sm text-gray-700">Equipment</label>
            <select
              value={selectedEquipmentId}
              onChange={(event) => setSelectedEquipmentId(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="">Select equipment</option>
              {equipmentList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.equipmentName} ({item.id})
                </option>
              ))}
            </select>
            {errors.selectedEquipmentId && (
              <p className="mt-1 text-xs text-red-600">{errors.selectedEquipmentId}</p>
            )}

            {selectedEquipment && (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <ReadOnly label="Equipment Name" value={selectedEquipment.equipmentName} />
                <ReadOnly label="Equipment ID" value={String(selectedEquipment.id)} />
                <ReadOnly label="Laboratory Name" value={selectedEquipment.laboratory || 'N/A'} />
                <ReadOnly label="Model" value={selectedEquipment.model || 'N/A'} />
                <ReadOnly label="Serial Number" value={selectedEquipment.serialNumber || 'N/A'} />
              </div>
            )}

            {availabilityChecking && (
              <p className="mt-3 text-xs text-gray-500">Checking equipment availability...</p>
            )}

            {!availabilityChecking && availability.checked && availability.message && (
              <p className={`mt-3 text-xs ${availability.available ? 'text-green-700' : 'text-red-600'}`}>
                {availability.message}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              <UserRound size={16} className="text-yellow-600" />
              Applicant Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Student/Staff Name" value={formData.applicantName} onChange={updateField('applicantName')} error={errors.applicantName} />
              <Field label="Registration Number / Staff ID" value={formData.registrationOrStaffId} onChange={updateField('registrationOrStaffId')} error={errors.registrationOrStaffId} />
              <div>
  <label className="mb-1 block text-sm font-medium text-slate-800">
    Department
  </label>

  <select
    value={formData.department}
    onChange={updateField('department')}
    className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 ${
      errors.department ? 'border-red-500' : 'border-gray-300'
    }`}
  >
    <option value="">Select Department</option>
    <option value="Department of Electrical and Information Engineering">
      Department of Electrical and Information Engineering
    </option>
    <option value="Department of Mechanical and Manufacturing Engineering">
      Department of Mechanical and Manufacturing Engineering
    </option>
    <option value="Department of Civil and Environmental Engineering">
      Department of Civil and Environmental Engineering
    </option>
    <option value="Department of Materials and Mechanical Engineering">
      Department of Materials and Mechanical Engineering
    </option>
    <option value="Department of Interdisciplinary Studies">
      Department of Interdisciplinary Studies
    </option>
  </select>

  {errors.department && (
    <p className="mt-1 text-xs text-red-600">
      {errors.department}
    </p>
  )}
</div>
              <Field
              label="Email"
              type="email"
              value={formData.email}
              readOnly
              error={errors.email}/>
              <Field label="Contact Number" value={formData.contactNumber} onChange={updateField('contactNumber')} error={errors.contactNumber} />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              <CalendarDays size={16} className="text-yellow-600" />
              Borrowing Schedule
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Borrow Start Date"
                type="date"
                value={formData.borrowStartDate}
                onChange={updateField('borrowStartDate')}
                error={errors.borrowStartDate}
              />
              <Field
                label="Borrow End Date"
                type="date"
                value={formData.borrowEndDate}
                onChange={updateField('borrowEndDate')}
                error={errors.borrowEndDate}
              />
            </div>

            <div className="mt-4">
  <button
    type="button"
    onClick={openCalendar}
    disabled={!selectedEquipmentId}
    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-yellow-400 bg-yellow-50 px-4 py-2.5 text-sm font-semibold text-yellow-800 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 sm:w-auto"
  >
    <CalendarDays size={17} />
    Check Availability Calendar
  </button>

  {!selectedEquipmentId && (
    <p className="mt-1 text-xs text-gray-500">
      Select equipment first to view its availability calendar.
    </p>
  )}
</div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Purpose of Borrowing</label>
              <textarea
                rows={4}
                value={formData.purpose}
                onChange={updateField('purpose')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="Briefly explain why this equipment is needed."
              />
              {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>}
            </div>
          </section>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
          )}
          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{successMessage}</div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 border-t pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-5 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={16} />
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
            </div>
    </div>

    {calendarOpen && (
      <AvailabilityCalendarModal
        equipment={selectedEquipment}
        calendarDate={calendarDate}
        blockedPeriods={blockedPeriods}
        loading={calendarLoading}
        error={calendarError}
        startDate={calendarStartDate}
        endDate={calendarEndDate}
        onClose={() => setCalendarOpen(false)}
        onPreviousMonth={() => changeCalendarMonth(-1)}
        onNextMonth={() => changeCalendarMonth(1)}
        onDateClick={handleCalendarDateClick}
        onUseDates={useCalendarDates}
      />
    )}
  </>
);
}

function ReadOnly({ label, value }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">{value}</div>
    </div>
  );
}

function Field({ label, error, type = 'text', value, onChange, readOnly = false }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
  type={type}
  value={value}
  onChange={onChange}
  readOnly={readOnly}
  className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 ${
    readOnly ? 'cursor-not-allowed bg-gray-100 text-gray-600' : ''
  }`}
/>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function AvailabilityCalendarModal({
  equipment,
  calendarDate,
  blockedPeriods,
  loading,
  error,
  startDate,
  endDate,
  onClose,
  onPreviousMonth,
  onNextMonth,
  onDateClick,
  onUseDates
}) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = calendarDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const formatDate = (day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const isBlocked = (dateString) =>
    blockedPeriods.some(
      (period) =>
        dateString >= period.startDate &&
        dateString <= period.endDate
    );

  const isSelected = (dateString) => {
    if (!startDate) return false;

    if (!endDate) {
      return dateString === startDate;
    }

    return dateString >= startDate && dateString <= endDate;
  };

  const cells = [];

  for (let i = 0; i < firstDayIndex; i += 1) {
    cells.push(
      <div
        key={`empty-${i}`}
        className="h-11 rounded-lg"
      />
    );
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateString = formatDate(day);
    const blocked = isBlocked(dateString);
    const selected = isSelected(dateString);

    cells.push(
      <button
        key={dateString}
        type="button"
        disabled={blocked}
        onClick={() => onDateClick(dateString)}
        className={`h-11 rounded-lg border text-sm font-semibold transition ${
          blocked
            ? 'cursor-not-allowed border-red-200 bg-red-100 text-red-500'
            : selected
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
        }`}
        title={blocked ? 'Unavailable' : 'Available'}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <CalendarDays size={20} className="text-yellow-600" />
              Equipment Availability
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {equipment?.equipmentName || 'Selected Equipment'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close availability calendar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onPreviousMonth}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Previous
            </button>

            <h4 className="text-base font-bold text-gray-900">
              {monthName}
            </h4>

            <button
              type="button"
              onClick={onNextMonth}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Loading availability...
            </div>
          ) : (
            <>
              <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-gray-500">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {cells}
              </div>
            </>
          )}

          <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium text-gray-600">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-green-100 ring-1 ring-green-300" />
              Available
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-red-100 ring-1 ring-red-300" />
              Unavailable
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-blue-500" />
              Selected
            </span>
          </div>

          {(startDate || endDate) && (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              <strong>Selected:</strong>{' '}
              {startDate || '—'} → {endDate || 'Select end date'}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse justify-end gap-3 border-t pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onUseDates}
              disabled={!startDate || !endDate}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Use These Dates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}