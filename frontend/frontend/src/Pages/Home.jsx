import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ClipboardList,
  PackageCheck,
  Clock,
  MapPin,
  ArrowRight,
  Zap,
  Activity,
  Cpu,
  Sliders,
  Radio,
  Network,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles
} from "lucide-react";
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

  const featuredLaboratories = [
    {
      name: "Electrical Machines and Power Electronics Laboratory",
      title: "Electrical Machines & Drives",
      icon: Zap,
      badge: "Power & Energy",
      desc: "AC/DC machines, transformers, motor drives, inverters, and high-power bench supplies.",
    },
    {
      name: "Power Systems and High Voltage Laboratory",
      title: "Power Systems & High Voltage",
      icon: Activity,
      badge: "High Voltage",
      desc: "Grid simulators, insulation breakdown kits, power analyzers, and transmission lines.",
    },
    {
      name: "Electronics and Measurements Laboratory",
      title: "Electronics & Measurements",
      icon: Cpu,
      badge: "Circuit Testing",
      desc: "Digital oscilloscopes, signal generators, precision multimeters, and circuit trainer kits.",
    },
    {
      name: "Control Systems Laboratory",
      title: "Control Systems & Automation",
      icon: Sliders,
      badge: "Automation",
      desc: "PID controllers, PLC trainers, robotic actuators, and process instrumentation rigs.",
    },
    {
      name: "Communication Systems Laboratory",
      title: "Communication & RF Engineering",
      icon: Radio,
      badge: "RF & Optics",
      desc: "RF signal generators, spectrum analyzers, optical transmission testbeds, and antenna kits.",
    },
    {
      name: "Computer Networks Laboratory",
      title: "Computer Networks & Systems",
      icon: Network,
      badge: "Networking",
      desc: "Enterprise routers, managed switches, network packet analyzers, and server racks.",
    },
  ];

  const borrowSteps = [
    {
      step: "01",
      title: "SEARCH & SELECT",
      color: "#4b0000", // University Maroon (same as footer)
      desc: "Browse our live faculty catalog to find equipment, check technical specifications, and verify working availability.",
    },
    {
      step: "02",
      title: "SUBMIT REQUEST",
      color: "#4b0000", // University Maroon (same as footer)
      desc: "Fill in your required borrow dates, purpose of laboratory usage, and accessories for swift technician approval.",
    },
    {
      step: "03",
      title: "COLLECT EQUIPMENT",
      color: "#4b0000", // University Maroon (same as footer)
      desc: "Visit the designated laboratory during operating hours to inspect and collect your equipment from the technician.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[430px] bg-black overflow-hidden">
        <img
          src="/images/header.png"
          alt="Faculty of Engineering Laboratory"
          className="w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-3xl">
            <span className="inline-flex items-center gap-2 py-1 px-3.5 mb-4 text-xs uppercase tracking-widest font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-full backdrop-blur-sm">
              <Sparkles size={14} className="text-yellow-400" />
              Faculty of Engineering · University of Ruhuna
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">
              Equipment Management System
            </h1>
            <p className="text-sm md:text-base max-w-2xl mx-auto text-gray-200 leading-relaxed mb-6 font-normal">
              Track, request, and manage specialized laboratory apparatus across all departments with ease and real-time visibility.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate('/equipment')}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-lg text-sm shadow-lg hover:shadow-yellow-500/30 transition-all flex items-center gap-2 group"
              >
                Browse Equipment Catalog
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const elem = document.getElementById('how-to-borrow');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-lg text-sm border border-white/25 backdrop-blur-sm transition-all"
              >
                How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title={isLoggedIn && !isAdmin ? "My Borrowed Items" : "Borrowed Items"}
            value={borrowedCount.toString().padStart(2, '0')}
            subtitle={isLoggedIn && !isAdmin ? "Items in your possession" : "Active faculty issuances"}
            onClick={() => navigate(isAdmin ? '/admin/issuance' : '/equipment?view=my-equipment')}
          />
          <StatCard
            title={isLoggedIn && !isAdmin ? "My Pending Requests" : "Pending Requests"}
            value={pendingCount.toString().padStart(2, '0')}
            subtitle={isLoggedIn && !isAdmin ? "Awaiting technician review" : "Requests needing approval"}
            onClick={() => navigate(isAdmin ? '/admin/borrow-requests' : '/equipment?view=my-equipment')}
          />
          <StatCard
            title="Total Available Equipment"
            value={totalCount.toString().padStart(2, '0')}
            subtitle="Catalog devices & tools"
            onClick={() => navigate('/equipment')}
          />
        </div>
      </section>

      {/* 3. Quick Action "How to Borrow" (3-Step Guide) */}
      <section id="how-to-borrow" className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-yellow-600 bg-yellow-100/70 px-3 py-1 rounded-full inline-block mb-2">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            How to Borrow Laboratory Equipment
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            A seamless, transparent workflow designed for engineering students and academic staff.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-6">
          {borrowSteps.map((item) => (
            <div
              key={item.step}
              className="relative flex items-center justify-start min-h-[185px] sm:min-h-[200px] group"
            >
              {/* Colored Chevron Ribbon in Background */}
              <div
                className="absolute inset-y-0 right-0 left-6 sm:left-8 flex items-center justify-end pointer-events-none"
                style={{ color: item.color }}
              >
                <svg
                  className="absolute inset-0 w-full h-full drop-shadow-md"
                  viewBox="0 0 320 200"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 35 0 L 255 0 L 320 100 L 255 200 L 35 200 A 20 20 0 0 1 15 180 L 15 20 A 20 20 0 0 1 35 0 Z"
                    fill="currentColor"
                  />
                </svg>
                {/* Number inside Chevron Point */}
                <span className="relative z-10 text-white font-black text-2xl sm:text-3xl tracking-tight mr-4 sm:mr-6 select-none drop-shadow-sm">
                  {item.step}
                </span>
              </div>

              {/* Foreground White Card */}
              <div className="relative z-10 w-[78%] sm:w-[76%] my-3 sm:my-3.5 bg-white rounded-2xl shadow-xl shadow-gray-200/80 border border-gray-100 p-5 sm:p-6 transition-transform duration-200 group-hover:-translate-y-1">
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Laboratories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-yellow-600 bg-yellow-100/70 px-3 py-1 rounded-full inline-block mb-2">
              Explore Facilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Featured Engineering Laboratories
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Click any laboratory to view its specialized equipment and instruments.
            </p>
          </div>
          <button
            onClick={() => navigate('/equipment')}
            className="text-sm font-semibold text-yellow-700 hover:text-yellow-800 flex items-center gap-1 group self-start sm:self-auto"
          >
            View all equipment
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredLaboratories.map((lab) => {
            const Icon = lab.icon;
            return (
              <div
                key={lab.name}
                onClick={() => navigate(`/equipment?lab=${encodeURIComponent(lab.name)}`)}
                className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm hover:shadow-lg hover:border-yellow-400 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                      <Icon size={20} />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {lab.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-yellow-700 transition-colors mb-2 line-clamp-1">
                    {lab.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {lab.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-yellow-600 group-hover:text-yellow-700">
                  <span>Browse lab apparatus</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Faculty Gate Banner with Lab Schedule & Notice */}
      <section className="relative w-full overflow-hidden mt-12 py-16 sm:py-20">
        {/* Faculty Gate Background Image */}
        <img
          src="/images/image.png"
          alt="Faculty of Engineering Gate"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Atmospheric Dark Overlay for optimal readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85 backdrop-blur-[0.5px]" />

        {/* Balanced Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center text-white mb-8 sm:mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 bg-yellow-500/20 border border-yellow-400/40 px-3.5 py-1 rounded-full inline-block mb-3 backdrop-blur-sm">
              Department of Electrical & Information Engineering
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Laboratory Operating Schedule & Guidelines
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 max-w-2xl mx-auto mt-2 leading-relaxed">
              Review standard collection hours and equipment handover safety policies before visiting the Hapugala campus laboratories.
            </p>
          </div>

          {/* Transparent Notice Card with High Visibility on Image */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/15">
              {/* Hours */}
              <div className="flex items-start gap-4 md:pr-6">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500 text-black flex items-center justify-center flex-shrink-0 shadow-lg font-bold">
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1 tracking-wide">
                    Collection & Return Hours
                  </h4>
                  <p className="text-sm font-semibold text-yellow-400 mb-1">
                    Mon – Fri: 8:30 AM – 4:30 PM
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed font-normal">
                    Pickups and handovers must occur during active technician hours. Closed on weekends & holidays.
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 pt-6 md:pt-0 md:px-6">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500 text-black flex items-center justify-center flex-shrink-0 shadow-lg font-bold">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1 tracking-wide">
                    Faculty Laboratory Location
                  </h4>
                  <p className="text-sm font-semibold text-yellow-400 mb-1">
                    Hapugala Campus, Galle
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed font-normal">
                    Faculty of Engineering, University of Ruhuna. Present your Student ID when collecting gear.
                  </p>
                </div>
              </div>

              {/* Technician Support */}
              <div className="flex items-start gap-4 pt-6 md:pt-0 md:pl-6">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500 text-black flex items-center justify-center flex-shrink-0 shadow-lg font-bold">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1 tracking-wide">
                    Technician & Safety Support
                  </h4>
                  <p className="text-sm font-semibold text-yellow-400 mb-1">
                    Inspection on Handover
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed font-normal">
                    All equipment is calibrated before issuance. Report any anomalies immediately to the technician on duty.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4">
            <p className="text-sm text-gray-200 text-center sm:text-left">
              Need apparatus for your practical session or research project?
            </p>
            <button
              onClick={() => navigate('/equipment')}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <span>Request Equipment Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 text-gray-900 rounded-2xl shadow-md p-6 transition-all duration-200 border border-yellow-300/60 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:brightness-105' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900/80">{title}</p>
        <span className="w-2 h-2 rounded-full bg-black/30"></span>
      </div>
      <p className="text-3xl sm:text-4xl font-black text-gray-950 mb-1">{value}</p>
      {subtitle && (
        <p className="text-xs font-medium text-gray-900/70">{subtitle}</p>
      )}
    </div>
  );
}
