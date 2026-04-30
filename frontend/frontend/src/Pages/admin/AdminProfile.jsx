import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminProfile() {

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    role: "Administrator",
    phone: "",
    profileImage: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/profile")
      .then((res) => setAdmin(res.data))
      .catch((err) =>
        console.log("PROFILE ERROR:", err.response?.data || err.message)
      );
  }, []);

  // IMAGE HANDLER
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      setAdmin({
        ...admin,
        profileImage: URL.createObjectURL(file),
      });
    }
  };

  // SAVE PROFILE
  const handleSave = async () => {
    try {
      let updatedAdmin = { ...admin };

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await axios.post(
          "http://localhost:8080/api/admin/upload-profile",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        updatedAdmin.profileImage = uploadRes.data;
      }

      const res = await axios.put(
        "http://localhost:8080/api/admin/profile",
        updatedAdmin
      );

      setAdmin(res.data);
      setIsEditing(false);
      setImageFile(null);

    } catch (err) {
      console.log("UPDATE ERROR:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PROFILE CARD */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">

          {/* PROFESSIONAL AVATAR */}
          <label className="relative w-28 h-28 rounded-full cursor-pointer group">

            {/* IMAGE */}
            <img
              src={
                admin.profileImage ||
                "https://ui-avatars.com/api/?name=Admin+User&background=0f172a&color=fff"
              }
              alt="profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-slate-300 shadow-md"
            />

            {/* OVERLAY */}
            {isEditing && (
              <div className="absolute inset-0 rounded-full bg-slate-900 bg-opacity-60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">

                {/* CAMERA ICON */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white mb-1"
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

                <span className="text-white text-xs font-medium">
                  Upload Photo
                </span>

              </div>
            )}

            {/* INPUT */}
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            )}

          </label>

          {/* INFO */}
          <h2 className="text-lg font-semibold mt-4">
            {admin.name || "Admin User"}
          </h2>

          <p className="text-gray-500 text-sm">{admin.email}</p>

          <span className="mt-2 px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
            {admin.role}
          </span>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-5 bg-slate-800 text-white px-5 py-2 rounded-lg hover:bg-slate-900"
          >
            Edit Profile
          </button>

        </div>

        {/* RIGHT PERSONAL INFO */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">

          <h2 className="text-lg font-semibold mb-4 text-slate-800">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <input
                className="w-full border p-2 rounded mt-1"
                value={admin.name}
                disabled={!isEditing}
                onChange={(e) =>
                  setAdmin({ ...admin, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                className="w-full border p-2 rounded mt-1"
                value={admin.email}
                disabled={!isEditing}
                onChange={(e) =>
                  setAdmin({ ...admin, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <input
                className="w-full border p-2 rounded mt-1"
                value={admin.phone || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setAdmin({ ...admin, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Role</label>
              <input
                className="w-full border p-2 rounded mt-1 bg-gray-100"
                value={admin.role}
                disabled
              />
            </div>

          </div>

          {/* ACTIONS */}
          {isEditing && (
            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save Changes
              </button>

            </div>
          )}

        </div>

        {/* ACCOUNT INFO */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Account Info</h2>

          <div className="space-y-3 text-sm">

            <div>
              <p className="text-gray-500">Account Status</p>
              <p className="text-green-600 font-medium">Active</p>
            </div>

            <div>
              <p className="text-gray-500">Account Type</p>
              <p className="font-medium">System Administrator</p>
            </div>

            <div>
              <p className="text-gray-500">Security Level</p>
              <p className="font-medium">High</p>
            </div>

          </div>
        </div>

        {/* ACTIVITY */}
        <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">
            Activity Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">

            <div>
              <p className="text-gray-500">Last Login</p>
              <p className="font-medium">Today</p>
            </div>

            <div>
              <p className="text-gray-500">Account Created</p>
              <p className="font-medium">2025</p>
            </div>

            <div>
              <p className="text-gray-500">Login Status</p>
              <p className="text-green-600 font-medium">Online</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}