import React from "react";
import universityLogo from "/images/university_logo.png";
import electricalMachine from "/images/electrical_machine.jpg";
import powerSystem from "/images/power_system.jpg";
import electronicsMeasurements from "/images/Electronics_Measurements.jpg";
import communication from "/images/communication.jpeg";
import undergraduateProject from "/images/undergraduate_project.jpg";
import information from "/images/information.jpeg";

const About = () => {
  return (
    <div className="font-[Poppins] bg-[#f8f9fa] text-[#333]">

      {/* HEADER */}
      <header className="flex flex-wrap items-center gap-4 p-8 bg-[#4c0000] text-white">
        
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={universityLogo}
            alt="University of Ruhuna Logo"
            className="w-[100px] h-auto"
          />
        </div>

        {/* Header Text */}
        <div className="flex flex-col animate-[fadeInSlide_1.5s_ease-out_forwards]">
          <h1 className="m-0 text-2xl">About the Equipment Management System</h1>
          <p className="m-0 text-base">Faculty of Engineering, University of Ruhuna</p>
        </div>
      </header>

      {/* CONTAINER */}
      <div className="max-w-[1100px] mx-auto bg-white rounded-xl shadow-md p-8 my-8">

        {/* OVERVIEW */}
        <section className="mb-8">
          <h2 className="text-[#002b5c] border-l-4 border-[#ffc107] pl-3 mb-2 text-xl font-semibold">
            Overview
          </h2>
          <p className="leading-relaxed">
            The Equipment Management System is a web-based platform developed
            for the Department of Electrical and Electronics Engineering,
            Faculty of Engineering, University of Ruhuna. It aims to efficiently
            manage laboratory equipment, streamline the borrowing process, and
            maintain accurate inventory records for all departmental laboratories.
          </p>
        </section>

        {/* OBJECTIVES */}
        <section className="mb-8">
          <h2 className="text-[#002b5c] border-l-4 border-[#ffc107] pl-3 mb-2 text-xl font-semibold">
            Objectives
          </h2>
          <ul className="list-disc ml-8 leading-relaxed">
            <li>Streamline equipment management across multiple laboratories.</li>
            <li>Reduce manual errors and paperwork.</li>
            <li>Provide real-time equipment availability tracking.</li>
            <li>Facilitate easy borrowing and return processes for students and staff.</li>
          </ul>
        </section>

        {/* LABS GRID */}
        <section className="mb-8">
          <h2 className="text-[#002b5c] border-l-4 border-[#ffc107] pl-3 mb-4 text-xl font-semibold">
            Laboratories Covered
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[{
              img: electricalMachine,
              title: "Electrical Machines & Power Electronics Lab",
              desc: "Focuses on power electronics, machine operations, and drives experiments.",
            }, {
              img: powerSystem,
              title: "Power System & High Voltage Lab",
              desc: "Deals with power system simulations, testing, and high-voltage experiments.",
            }, {
              img: electronicsMeasurements,
              title: "Electronics & Measurements Lab",
              desc: "Equipped for analog, digital, and measurement-based experiments.",
            }, {
              img: communication,
              title: "Communication & Systems Engineering Lab",
              desc: "Supports experiments in communication systems and signal processing.",
            }, {
              img: undergraduateProject,
              title: "Undergraduate Project Development Lab",
              desc: "Dedicated to final-year and research project development.",
            }, {
              img: information,
              title: "Information Engineering Lab",
              desc: "Focuses on programming, networking, and computing-related experiments.",
            }].map((lab, index) => (
              <div key={index} className="bg-[#f0f3f5] rounded-xl p-4 transition duration-300 hover:bg-[#e9ecef] hover:-translate-y-1">
                <img
                  src={lab.img}
                  alt={lab.title}
                  className="w-full h-[150px] object-cover rounded-md mb-2"
                />
                <h3 className="font-semibold">{lab.title}</h3>
                <p className="text-sm leading-relaxed">{lab.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VISION & MISSION */}
        <section className="mb-8">
          <h2 className="text-[#002b5c] border-l-4 border-[#ffc107] pl-3 mb-4 text-xl font-semibold">
            Our Vision & Mission
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg">Vision</h3>
              <p className="leading-relaxed">
                To be a centre of excellence in engineering education, research, and
                innovation that contributes to national development and global knowledge.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Mission</h3>
              <p className="leading-relaxed">
                To produce competent, innovative, and socially responsible engineers
                equipped with strong analytical skills and practical knowledge, through
                quality education and cutting-edge research, to meet the needs of
                industry and society.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT + MAP */}
        <section className="mb-8">
          <h2 className="text-[#002b5c] border-l-4 border-[#ffc107] pl-3 mb-4 text-xl font-semibold">
            Contact
          </h2>

          {/* FULL-WIDTH MAP */}
          <div className="w-full h-[350px] rounded-xl overflow-hidden shadow-lg mb-6">
            <iframe
              title="Faculty of Engineering Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.3801575966468!2d80.189389674802!3d6.079368393906758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae1714b88f66a7b%3A0x8a7feea89839a01a!2sFaculty%20of%20Engineering%20-%20University%20of%20Ruhuna!5e0!3m2!1sen!2slk!4v1762946302563!5m2!1sen!2slk"
              className="w-full h-full border-0"
            ></iframe>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg">Postal Address:</h4>
              <p className="leading-relaxed">
                Faculty of Engineering,<br />
                University of Ruhuna,<br />
                Hapugala,<br />
                Galle, 80000<br />
                Sri Lanka
              </p>

              <h4 className="font-semibold text-lg mt-4">Phone Numbers:</h4>
              <p>(+94) 912245761, (+94) 912245767, (+94) 913924732, (+94) 912245765/66</p>

              <h4 className="font-semibold text-lg mt-4">Fax:</h4>
              <p>+94 912245762</p>

              <h4 className="font-semibold text-lg mt-4">E-mail:</h4>
              <p>
                dean@eng.ruh.ac.lk <br />
                ar@eng.ruh.ac.lk
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#4c0000] text-white text-center p-4 mt-8 text-sm">
        © 2025 Faculty of Engineering, University of Ruhuna | Equipment Management System
      </footer>
    </div>
  );
};

export default About;