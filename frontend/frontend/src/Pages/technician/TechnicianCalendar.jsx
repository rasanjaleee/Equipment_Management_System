import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  User,
} from "lucide-react";
import { API_BASE_URL } from "../../services/api";

export default function TechnicianCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedLaboratory, setSelectedLaboratory] = useState("ALL");
  const [selectedEquipment, setSelectedEquipment] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const loadCalendar = async () => {
    try {
      setLoading(true);
      setError("");

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_BASE_URL}/api/borrow-requests/calendar`,
        {
          params: {
            startDate: formatLocalDate(firstDay),
            endDate: formatLocalDate(lastDay),
          },
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load technician calendar:", err);

      setRequests([]);
      setError(
        err.response?.data?.message ||
          "Unable to load equipment calendar."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, [year, month]);

  const laboratories = useMemo(() => {
    return [
      ...new Set(
        requests
          .map((request) => request.laboratoryName)
          .filter(Boolean)
      ),
    ].sort();
  }, [requests]);

  const equipmentOptions = useMemo(() => {
    let source = requests;

    if (selectedLaboratory !== "ALL") {
      source = source.filter(
        (request) => request.laboratoryName === selectedLaboratory
      );
    }

    const uniqueEquipment = new Map();

    source.forEach((request) => {
      if (request.equipmentId != null) {
        uniqueEquipment.set(request.equipmentId, request.equipmentName);
      }
    });

    return Array.from(uniqueEquipment.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [requests, selectedLaboratory]);

  useEffect(() => {
    if (
      selectedEquipment !== "ALL" &&
      !equipmentOptions.some(
        (equipment) => String(equipment.id) === String(selectedEquipment)
      )
    ) {
      setSelectedEquipment("ALL");
    }
  }, [selectedLaboratory, equipmentOptions, selectedEquipment]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const laboratoryMatches =
        selectedLaboratory === "ALL" ||
        request.laboratoryName === selectedLaboratory;

      const equipmentMatches =
        selectedEquipment === "ALL" ||
        String(request.equipmentId) === String(selectedEquipment);

      return laboratoryMatches && equipmentMatches;
    });
  }, [requests, selectedLaboratory, selectedEquipment]);

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
    setSelectedRequest(null);
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getRequestsForDay = (day) => {
    const dateString = formatLocalDate(new Date(year, month, day));

    return filteredRequests.filter(
      (request) =>
        request.borrowStartDate <= dateString &&
        request.borrowEndDate >= dateString
    );
  };

  const getStatusClasses = (status) => {
    switch ((status || "").toUpperCase()) {
      case "APPROVED":
        return "border-green-200 bg-green-100 text-green-800";
      case "PENDING":
      default:
        return "border-yellow-200 bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <CalendarDays className="text-yellow-600" size={26} />
            Equipment Calendar
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View scheduled equipment borrow requests and availability.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Laboratory
            </label>

            <select
              value={selectedLaboratory}
              onChange={(e) => setSelectedLaboratory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
            >
              <option value="ALL">All Laboratories</option>

              {laboratories.map((laboratory) => (
                <option key={laboratory} value={laboratory}>
                  {laboratory}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Equipment
            </label>

            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
            >
              <option value="ALL">All Equipment</option>

              {equipmentOptions.map((equipment) => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-3 py-4 sm:px-5">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:px-3"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <h2 className="text-base font-bold text-gray-800 sm:text-xl">
            {monthName}
          </h2>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:px-3"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {error && (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
            Loading equipment calendar...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="border-r border-gray-200 px-2 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-500 last:border-r-0"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7">
                {Array.from({ length: firstDayIndex }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[125px] border-b border-r border-gray-200 bg-gray-50/60"
                  />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dayRequests = getRequestsForDay(day);

                  return (
                    <div
                      key={day}
                      className="min-h-[125px] border-b border-r border-gray-200 bg-white p-2 align-top"
                    >
                      <div className="mb-2 text-sm font-semibold text-gray-700">
                        {day}
                      </div>

                      <div className="space-y-1.5">
                        {dayRequests.map((request) => (
                          <button
                            key={`${request.id}-${day}`}
                            type="button"
                            onClick={() => setSelectedRequest(request)}
                            className={`w-full rounded-md border px-2 py-1.5 text-left text-[11px] leading-tight transition hover:shadow-sm ${getStatusClasses(
                              request.status
                            )}`}
                            title={`${request.equipmentName} - ${request.status}`}
                          >
                            <span className="block truncate font-semibold">
                              {request.equipmentName}
                            </span>

                            <span className="mt-0.5 block text-[10px] font-medium">
                              {request.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-5 border-t border-gray-200 px-4 py-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="text-gray-600">Pending</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Approved</span>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Borrow Request Details
                </h2>
                <p className="text-xs text-gray-500">
                  Request #{selectedRequest.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Equipment
                </p>

                <p className="mt-1 font-bold text-gray-800">
                  {selectedRequest.equipmentName || "-"}
                </p>

                <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{selectedRequest.laboratoryName || "-"}</span>
                </div>

                {selectedRequest.model && (
                  <p className="mt-2 text-xs text-gray-500">
                    Model: {selectedRequest.model}
                  </p>
                )}

                {selectedRequest.serialNumber && (
                  <p className="mt-1 text-xs text-gray-500">
                    Serial No: {selectedRequest.serialNumber}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <User size={17} className="text-gray-500" />
                  <h3 className="font-semibold text-gray-800">Requester</h3>
                </div>

                <div className="grid gap-3 rounded-xl border border-gray-200 p-4 text-sm sm:grid-cols-2">
                  <Detail
                    label="Name"
                    value={selectedRequest.applicantName}
                  />
                  <Detail
                    label="Registration / Staff ID"
                    value={selectedRequest.registrationOrStaffId}
                  />
                  <Detail
                    label="Department"
                    value={selectedRequest.department}
                  />
                  <Detail
                    label="Contact"
                    value={selectedRequest.contactNumber}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailCard
                  label="Borrow Start"
                  value={formatDisplayDate(selectedRequest.borrowStartDate)}
                />

                <DetailCard
                  label="Borrow End"
                  value={formatDisplayDate(selectedRequest.borrowEndDate)}
                />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Purpose
                </p>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  {selectedRequest.purpose || "-"}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-gray-600">
                  Status
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                    selectedRequest.status
                  )}`}
                >
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg bg-gray-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-0.5 break-words font-medium text-gray-800">
        {value || "-"}
      </p>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}