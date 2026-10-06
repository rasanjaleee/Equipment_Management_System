
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function HomePage() {
  const navigate = useNavigate();

  const {
    equipmentList,
    refreshEquipment,
    issuances,
    borrowRequests,
    myIssuances,
    myRequests,
    refreshMyEquipment,
    refreshIssuances,
    refreshBorrowRequests,
  } = useData();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const role = String(user?.role || '').replace(/^ROLE_/i, '').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isLoggedIn = !!localStorage.getItem('token');

  const normalize = (v) => String(v || '').toLowerCase().trim();

  // If Admin: calculate from system-wide issuances and borrow requests
  // If Student/Technician: calculate from user's personal issuances and requests
  const activeBorrowedList = isAdmin && Array.isArray(issuances) && issuances.length > 0
    ? issuances.filter((i) => normalize(i.status) === 'issued')
    : Array.isArray(myIssuances)
    ? myIssuances.filter((i) => normalize(i.status) === 'issued')
    : [];

  const pendingRequestsList = isAdmin && Array.isArray(borrowRequests) && borrowRequests.length > 0
    ? borrowRequests.filter((r) => normalize(r.status) === 'pending')
    : Array.isArray(myRequests)
    ? myRequests.filter((r) => normalize(r.status) === 'pending')
    : [];

  const borrowedCount = activeBorrowedList.length;
  const pendingCount = pendingRequestsList.length;
  const totalCount = Array.isArray(equipmentList) ? equipmentList.length : 0;

  useEffect(() => {
    refreshEquipment(false);
    if (isLoggedIn) {
      refreshMyEquipment(false);
      if (isAdmin) {
        refreshIssuances(false);
        refreshBorrowRequests();
      }
    }
  }, [isLoggedIn, isAdmin, refreshEquipment, refreshMyEquipment, refreshIssuances, refreshBorrowRequests]);

  return (
    <div className="w-full min-h-screen bg-gray-100 font-sans">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] bg-black">
        <img
          src="/images/header.png"
          alt="Lab"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow">
              Welcome to the Faculty of Engineering
            </h2>
            <p className="text-sm md:text-base max-w-2xl mx-auto text-gray-200 leading-relaxed">
              Track, request, and manage laboratory equipment efficiently through
              the Equipment Management System
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Borrowed Items"
            value={borrowedCount.toString().padStart(2, '0')}
            onClick={() => navigate(isAdmin ? '/admin/issuance' : '/equipment?view=my-equipment')}
          />
          <StatCard
            title="Pending Requests"
            value={pendingCount.toString().padStart(2, '0')}
            onClick={() => navigate(isAdmin ? '/admin/borrow-requests' : '/equipment?view=my-equipment')}
          />
          <StatCard
            title="Total Available Equipment"
            value={totalCount.toString().padStart(2, '0')}
            onClick={() => navigate('/equipment')}
          />
        </div>
      </section>

      {/* Department Section */}
      <section className="relative w-full mt-16">
        <img
          src="/images/image.png"
          alt="Building"
          className="w-full h-[380px] object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center">
          <div className="max-w-7xl mx-auto px-6 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Electrical and Information Engineering
            </h3>
            <ul className="space-y-2 text-sm">
              <li>01. Electrical Power and Energy Technology Laboratory</li>
              <li>02. Control Systems and Instrumentation Laboratory</li>
              <li>03. Communication Engineering Laboratory</li>
              <li>04. Computer Engineering Laboratory</li>
              <li>05. Electronic Engineering Laboratory</li>
              <li>06. Mechatronics Engineering Laboratory</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-yellow-500 rounded-xl shadow p-6 text-center transition-all ${
        onClick ? 'cursor-pointer hover:bg-yellow-400 hover:shadow-lg transform hover:-translate-y-0.5' : ''
      }`}
    >
      <p className="text-sm font-medium mb-2 text-gray-900">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

