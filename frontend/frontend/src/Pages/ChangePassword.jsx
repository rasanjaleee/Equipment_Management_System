import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8080/auth/change-password", {
        username: user.username,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });

      const updatedUser = { ...user, mustChangePassword: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Password changed successfully");

      if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
        setTimeout(() => navigate("/admin/dashboard"), 1000);
      } else if (user.role === "TECHNICIAN") {
        setTimeout(() => navigate("/technician/dashboard"), 1000);
      } else {
        setTimeout(() => navigate("/home"), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Change Temporary Password</h1>
        <p className="text-sm text-gray-600 mb-6">
          You must change your temporary password before continuing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="oldPassword"
            placeholder="Temporary Password"
            value={form.oldPassword}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg"
          />

          {message && <p className="text-green-600 text-sm">{message}</p>}
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}