import React from "react";
import logo from "/images/home_logo.png";


const Footer = () => {
  return (
    <footer className="bg-[#4b0000] text-white">
      <div className="max-w-7xl mx-auto px-6 py-5">

        {/* System Title */}
        <div className="text-center mb-3">
          <h2 className="text-[13px] font-semibold tracking-wide">
            Faculty of Engineering Equipment Management System
          </h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">

          {/* Logo + University */}
          <div className="flex items-start gap-3">
            <img
              src={logo}
              alt="University Logo"
              className="w-24 h-24 object-contain"
            />

            <div className="leading-tight">
              <p className="text-sm font-medium">
                Faculty of Engineering,
              </p>
              <p className="text-sm font-medium">
                University of Ruhuna
              </p>

              <p className="text-xs mt-2">( +34 ) 546-4356</p>

              <p className="text-xs mt-1">
                Contact:{" "}
                <a
                  href="mailto:thilina@eie.ruh.ac.lk"
                  className="underline hover:text-gray-300 transition"
                >
                  thilina@eie.ruh.ac.lk
                </a>
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col space-y-1 text-sm">
            <a href="/" className="hover:underline">Home</a>
            <a href="/equipment" className="hover:underline">Equipment</a>
            <a href="/about" className="hover:underline">About</a>
            <a href="/contact" className="hover:underline">Contact</a>
            <a href="/login" className="hover:underline">Login</a>
          </div>

          {/* Social Media */}
          <div className="flex flex-col space-y-1 text-sm">
            <a href="#" className="hover:underline">Facebook</a>
            <a href="#" className="hover:underline">Twitter</a>
            <a href="#" className="hover:underline">LinkedIn</a>
            <a href="#" className="hover:underline">Instagram</a>
          </div>

          {/* Copyright */}
          <div className="text-xs md:text-right leading-relaxed">
            © 2025 University of Ruhuna <br />
            All Rights Reserved
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
