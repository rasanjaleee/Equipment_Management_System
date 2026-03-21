import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "",
    role: "",
    department: "",
    email: "",
    contact: "",
    id: "",
    profileImage: null,
  });

  const [issuedEquipment, setIssuedEquipment] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) setUser(loggedInUser);

    setIssuedEquipment([
      { id: 1, name: "Oscilloscope", lab: "Electronics Lab", issuedDate: "2026-02-01", dueDate: "2026-02-10", status: "Issued" },
      { id: 2, name: "Multimeter", lab: "Power Lab", issuedDate: "2026-01-15", dueDate: "2026-01-20", status: "Returned" },
    ]);
  }, []);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(user));
    alert("Profile saved successfully!");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUser({ ...user, profileImage: reader.result });
    reader.readAsDataURL(file);
  };

  const filteredItems = issuedEquipment.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const issuedCount = issuedEquipment.filter(e => e.status === "Issued").length;
  const returnedCount = issuedEquipment.filter(e => e.status === "Returned").length;
  const overdueCount = issuedEquipment.filter(item =>
    item.status === "Issued" && new Date(item.dueDate) < new Date()
  ).length;

  const isOverdue = (item) => item.status === "Issued" && new Date(item.dueDate) < new Date();

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100 rounded-xl shadow-md font-sans">
      {/* Profile Header */}
      <div className="flex gap-6 mb-6 items-start">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          {user.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-red-900 text-white text-5xl font-bold flex items-center justify-center">?</div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-2 text-sm"
          />
        </div>

        {/* Profile Form */}
        <form className="flex-1 flex flex-col gap-3">
          <label className="flex flex-col font-semibold text-gray-800 text-sm">
            Name
            <input
              name="name"
              value={user.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="mt-1 p-2 border border-gray-300 rounded focus:border-red-900 focus:ring focus:ring-red-200 outline-none"
            />
          </label>
          <label className="flex flex-col font-semibold text-gray-800 text-sm">
            Role
            <input
              name="role"
              value={user.role}
              onChange={handleChange}
              placeholder="Enter your role"
              className="mt-1 p-2 border border-gray-300 rounded focus:border-red-900 focus:ring focus:ring-red-200 outline-none"
            />
          </label>
          <label className="flex flex-col font-semibold text-gray-800 text-sm">
            Department
            <input
              name="department"
              value={user.department}
              onChange={handleChange}
              placeholder="Enter your department"
              className="mt-1 p-2 border border-gray-300 rounded focus:border-red-900 focus:ring focus:ring-red-200 outline-none"
            />
          </label>
          <label className="flex flex-col font-semibold text-gray-800 text-sm">
            Email
            <input
              name="email"
              value={user.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="mt-1 p-2 border border-gray-300 rounded focus:border-red-900 focus:ring focus:ring-red-200 outline-none"
            />
          </label>
          <label className="flex flex-col font-semibold text-gray-800 text-sm">
            Contact
            <input
              name="contact"
              value={user.contact}
              onChange={handleChange}
              placeholder="Enter your contact"
              className="mt-1 p-2 border border-gray-300 rounded focus:border-red-900 focus:ring focus:ring-red-200 outline-none"
            />
          </label>
          <label className="flex flex-col font-semibold text-gray-800 text-sm">
            ID
            <input
              name="id"
              value={user.id}
              onChange={handleChange}
              placeholder="Enter your ID"
              className="mt-1 p-2 border border-gray-300 rounded focus:border-red-900 focus:ring focus:ring-red-200 outline-none"
            />
          </label>

          <button
            type="button"
            onClick={handleSave}
            className="mt-2 px-4 py-2 bg-red-900 text-white rounded hover:bg-red-800 transition"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400 shadow hover:-translate-y-1 transition">
          <h4 className="font-semibold mb-2">Currently Issued</h4>
          <p className="text-2xl font-bold">{issuedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400 shadow hover:-translate-y-1 transition">
          <h4 className="font-semibold mb-2">Returned</h4>
          <p className="text-2xl font-bold">{returnedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400 shadow hover:-translate-y-1 transition">
          <h4 className="font-semibold mb-2">Overdue</h4>
          <p className="text-2xl font-bold">{overdueCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400 shadow hover:-translate-y-1 transition">
          <h4 className="font-semibold mb-2">Total Records</h4>
          <p className="text-2xl font-bold">{issuedEquipment.length}</p>
        </div>
      </div>

      {/* Equipment History */}
      <section>
        <h2 className="text-gray-800 text-lg font-semibold mb-3">My Equipment History</h2>
        <input
          type="text"
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-gray-300 rounded mb-4 w-64"
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-red-900 text-white">
              <tr>
                <th className="px-3 py-2 text-left">Equipment</th>
                <th className="px-3 py-2 text-left">Lab</th>
                <th className="px-3 py-2 text-left">Issued Date</th>
                <th className="px-3 py-2 text-left">Due Date</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2">{item.lab}</td>
                  <td className="px-3 py-2">{item.issuedDate}</td>
                  <td className="px-3 py-2">{item.dueDate}</td>
                  <td
                    className={`px-3 py-2 font-semibold ${
                      isOverdue(item)
                        ? "text-red-600 font-bold"
                        : item.status === "Issued"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {isOverdue(item) ? "Overdue" : item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}