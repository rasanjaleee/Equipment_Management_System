import React from "react";

export default function EquipmentDashboard() {
  return (
    <div className="flex flex-col w-full font-sans">
      {/* Header */}
      <header className="w-full bg-yellow-600 text-white p-4 flex justify-between items-center shadow">
        <div className="font-bold tracking-wide">Faculty of Engineering</div>
        <nav className="flex gap-6 text-sm font-medium">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Equipment</a>
          <a href="#" className="hover:underline">About</a>
        </nav>
        <div className="rounded-full bg-white text-black w-8 h-8 flex items-center justify-center font-semibold">H</div>
      </header>

      {/* Hero */}
      <section
        className="bg-cover bg-center h-64 flex flex-col items-center justify-center text-white relative"
        style={{ backgroundImage: "url('/lab-header.jpg')" }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative text-center">
          <h2 className="text-2xl font-semibold">Welcome to the Faculty of Engineering</h2>
          <p className="text-sm opacity-90">Equipment Management System</p>
          <input
            type="text"
            placeholder="Search by equipment name, lab..."
            className="mt-4 p-2 rounded w-72 text-black text-sm"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 text-center">
        <div className="bg-white rounded shadow p-4">
          <div className="text-3xl font-bold text-yellow-700">03</div>
          <div className="text-sm text-gray-700">Borrowed Items</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-3xl font-bold text-yellow-700">01</div>
          <div className="text-sm text-gray-700">Pending Requests</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-3xl font-bold text-yellow-700">500</div>
          <div className="text-sm text-gray-700">Total Available Equipment</div>
        </div>
      </section>

      {/* Popular Equipment */}
      <section className="p-6">
        <h3 className="font-semibold text-lg mb-3">Popular Equipment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["Oscilloscope","Digital Multimeter"].map((name,i)=> (
            <div key={i} className="border rounded-md shadow p-4 flex flex-col items-center bg-white">
              <div className="bg-gray-200 w-40 h-32 mb-2 rounded" />
              <div className="font-semibold text-sm">{name}</div>
              <div className="text-[10px] text-gray-500">Total Equipment: {i===0?"07":"09"}</div>
              <button className="mt-2 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition">View Details</button>
            </div>
          ))}
        </div>
      </section>

      {/* Slider Section */}
      <section className="p-6">
        <div className="relative w-full h-64 bg-gray-300 rounded overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative text-white font-medium text-center px-4">
            <div className="text-lg font-semibold mb-2">Electrical and Information Engineering</div>
            <ul className="text-xs space-y-1 opacity-90">
              <li>01. Electrical Machines and Power Electronics Laboratory</li>
              <li>02. Power Systems and High Voltage Laboratory</li>
              <li>03. Electronics and Microprocessor Laboratory</li>
              <li>04. Communications and Antenna Engineering Laboratory</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-900 text-white p-6 text-xs text-center space-y-1">
        <div className="font-semibold text-sm">Faculty of Engineering, University of Ruhuna</div>
        <div>Email: info@fe.ruh.ac.lk</div>
      </footer>
    </div>
  );
}