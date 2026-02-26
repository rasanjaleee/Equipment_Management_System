import React from "react";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-gray-100 font-sans">
      {/* Navbar */}
      <header className="w-full bg-yellow-500 text-black shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-yellow-400 flex items-center justify-center font-bold rounded">
              FE
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Faculty of Engineering
              </h1>
              <p className="text-xs">Equipment Management System</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="hover:underline">Home</a>
            <a href="#" className="hover:underline">Equipment</a>
            <a href="#" className="hover:underline">Requests</a>
            <a href="#" className="hover:underline">About</a>
          </nav>

          <div className="w-9 h-9 rounded-full bg-black text-yellow-400 flex items-center justify-center font-bold">
            H
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-[420px] bg-black">
        <img
          src="\header.png"
          alt="Lab"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome to the Faculty of Engineering
            </h2>
            <p className="text-sm md:text-base max-w-2xl mx-auto mb-6">
              Track, request, and manage laboratory equipment efficiently through
              the Equipment Management System
            </p>
            <div className="flex justify-center">
              <input
                type="text"
                placeholder="Search equipment..."
                className="w-72 md:w-96 px-4 py-2 rounded-l-md text-black focus:outline-none"
              />
              <button className="bg-yellow-500 px-5 py-2 rounded-r-md font-semibold">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Borrowed Items" value="03" />
          <StatCard title="Pending Requests" value="01" />
          <StatCard title="Total Available Equipment" value="500" />
        </div>
      </section>

      {/* Popular Equipment */}
      <section className="max-w-7xl mx-auto px-6 mt-12">
        <h3 className="text-xl font-semibold mb-6">Popular Equipment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <EquipmentCard
            name="Oscilloscope"
            image="\oscilloscope.png"
            status="Available"
          />
          <EquipmentCard
            name="Digital Multimeter"
            image="\multimeter.png"
            status="Available"
          />
        </div>
      </section>

      {/* Department Section */}
      <section className="relative w-full mt-16">
        <img
          src="\image.png"
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

      {/* Footer */}
      <footer className="bg-black text-gray-300 text-sm mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          © 2026 Faculty of Engineering – Equipment Management System
        </div>
      </footer>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-yellow-500 rounded-xl shadow p-6 text-center">
      <p className="text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function EquipmentCard({ name, image, status }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition">
      <img
        src={image}
        alt={name}
        className="w-full h-40 object-cover rounded-t-xl"
      />
      <div className="p-4">
        <h4 className="font-semibold mb-1">{name}</h4>
        <p className="text-xs text-gray-500 mb-3">Status: {status}</p>
        <button className="w-full bg-yellow-500 py-2 rounded font-semibold text-sm">
          View Details
        </button>
      </div>
    </div>
  );
}
