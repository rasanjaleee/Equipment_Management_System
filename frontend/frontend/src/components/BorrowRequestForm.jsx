import { useEffect, useMemo, useState } from 'react';
import { X, ClipboardList, CalendarDays, UserRound, Send } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (preselectedEquipment?.id) {
      setSelectedEquipmentId(String(preselectedEquipment.id));
    } else {
      setSelectedEquipmentId('');
    }

    setFormData(initialForm);
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

    const confirmed = window.confirm('Submit this borrow request?');
    if (!confirmed) {
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
      await axios.post('http://localhost:8080/api/borrow-requests', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setSuccessMessage('Borrow request submitted successfully.');
      setFormData(initialForm);
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
              <Field label="Department" value={formData.department} onChange={updateField('department')} error={errors.department} />
              <Field label="Email" type="email" value={formData.email} onChange={updateField('email')} error={errors.email} />
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

function Field({ label, error, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
