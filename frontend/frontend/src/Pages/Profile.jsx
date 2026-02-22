import React from "react";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-md">
      <h2 className="text-lg font-semibold mb-4">Profile</h2>

      <div className="space-y-2 text-sm">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>

      {/* ✅ Role-based content */}
      {user?.role === "admin" && (
        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <p className="text-sm font-semibold">Admin Privileges Enabled</p>
        </div>
      )}
    </div>
  );
}