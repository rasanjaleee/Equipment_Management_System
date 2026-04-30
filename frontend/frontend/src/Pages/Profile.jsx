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

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setUser({ ...user, profileImage: reader.result });
    reader.readAsDataURL(file);
  };

  const filteredItems = issuedEquipment.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const issuedCount = issuedEquipment.filter((e) => e.status === "Issued").length;
  const returnedCount = issuedEquipment.filter((e) => e.status === "Returned").length;
  const overdueCount = issuedEquipment.filter(
    (item) =>
      item.status === "Issued" && new Date(item.dueDate) < new Date()
  ).length;

  const isOverdue = (item) =>
    item.status === "Issued" && new Date(item.dueDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center">

          <div className="relative group">

            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 shadow-md bg-slate-100 flex items-center justify-center">

              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  className="w-full h-full object-cover"
                />
              ) : (
                // ✅ UPDATED COLOR HERE
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-4xl font-bold">
                {user.name?.charAt(0) || "U"}
                </div>
              )}

            </div>

            {/* OVERLAY EDIT */}
            <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition cursor-pointer">

              <div className="text-white text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mx-auto mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7h2l2-3h10l2 3h2v14H3V7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 11a3 3 0 100 6 3 3 0 000-6z"
                  />
                </svg>
                <p className="text-xs">Change Photo</p>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

          </div>

          <h2 className="mt-4 text-xl font-semibold">
            {user.name || "User Name"}
          </h2>

          <p className="text-gray-500 text-sm">{user.role}</p>
          <p className="text-gray-400 text-xs">{user.department}</p>

          <button
            onClick={handleSave}
            className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800"
          >
            Save Profile
          </button>

        </div>

        {/* FORM CARD */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {["name", "role", "department", "email", "contact", "id"].map((field) => (
              <div key={field}>
                <label className="text-sm text-gray-600 capitalize">
                  {field}
                </label>
                <input
                  name={field}
                  value={user[field]}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-slate-300 outline-none"
                />
              </div>
            ))}

          </div>
        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">

        {[
          { label: "Issued", value: issuedCount },
          { label: "Returned", value: returnedCount },
          { label: "Overdue", value: overdueCount },
          { label: "Total", value: issuedEquipment.length },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-amber-50 rounded-xl shadow p-4 border-l-4 border-amber-500"
          >
            <p className="text-gray-500 text-sm">{item.label}</p>
            <p className="text-2xl font-bold">{item.value}</p>
          </div>
        ))}

      </div>

      {/* TABLE */}
      <div className="mt-6 bg-white rounded-2xl shadow p-6">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Equipment History</h2>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="border p-2 rounded-lg w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-amber-500 text-white">
              <tr>
                <th className="p-3 text-left">Equipment</th>
                <th className="p-3 text-left">Lab</th>
                <th className="p-3 text-left">Issued</th>
                <th className="p-3 text-left">Due</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">

                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.lab}</td>
                  <td className="p-3">{item.issuedDate}</td>
                  <td className="p-3">{item.dueDate}</td>

                  <td
                    className={`p-3 font-semibold ${
                      isOverdue(item)
                        ? "text-red-600"
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

      </div>

    </div>
  );
}