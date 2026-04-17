import { useEffect, useState } from "react";
import axios from "axios";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8080/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProfile(res.data);
      setEmail(res.data.email || "");
    } catch (err) {
      setError("Failed to load profile");
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        "http://localhost:8080/api/profile/email",
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const user = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          email: res.data.email
        })
      );

      setMessage("Email updated successfully");
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update email");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8080/auth/change-password", {
        username: profile.username,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      const user = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          mustChangePassword: false
        })
      );

      setMessage("Password changed successfully");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  const formatRole = (role) => {
    if (!role) return "User";
    if (role === "SUPER_ADMIN") return "Super Admin";
    if (role === "ADMIN") return "Administrator";
    if (role === "TECHNICIAN") return "Technician";
    if (role === "STUDENT") return "Student";
    return role;
  };

  if (!profile) {
    return (
      <div className="p-8">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8 min-h-full">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
            <p className="text-green-700 font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium">{profile.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{profile.username}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">{formatRole(profile.role)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Password Status</p>
                <p className="font-medium">
                  {profile.mustChangePassword ? "Temporary password in use" : "Password already updated"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Update Email</h2>

            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border p-3 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                Update Email
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>

            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                }
                required
                className="border p-3 rounded-lg"
              />

              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                required
                className="border p-3 rounded-lg"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                required
                className="border p-3 rounded-lg"
              />

              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}