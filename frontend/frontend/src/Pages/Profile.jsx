import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../services/api";
import { Bell, Check, CheckCheck } from "lucide-react";

export default function ProfilePage() {
  const location = useLocation();
  const notificationSectionRef = useRef(null);

  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [email, setEmail] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?.email || "";
    } catch {
      return "";
    }
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u?.profileImage || "";
    } catch {
      return "";
    }
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
  }, []);

  // Auto-scroll to notifications section when navigated with #notifications hash
  useEffect(() => {
    if (location.hash === "#notifications" && notificationSectionRef.current) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        notificationSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash, notifications]);

  // LOAD PROFILE
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setEmail(res.data.email || "");
      setPhotoPreview(res.data.profileImage || "");
    } catch (err) {
      setError("Failed to load profile");
    }
  };

  // LOAD NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem("token");
      let userId = null;
      try {
        const u = JSON.parse(localStorage.getItem("user"));
        userId = u?.id;
      } catch {}
      if (!userId) return;
      const res = await axios.get(`${API_BASE_URL}/api/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.notifications)
        ? res.data.notifications
        : [];
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // MARK SINGLE NOTIFICATION AS READ
  const handleMarkAsRead = async (notifId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/notifications/${notifId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // MARK ALL NOTIFICATIONS AS READ
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      const token = localStorage.getItem("token");
      let userId = null;
      try {
        const u = JSON.parse(localStorage.getItem("user"));
        userId = u?.id;
      } catch {}
      if (!userId) return;
      await axios.put(
        `${API_BASE_URL}/api/notifications/${userId}/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    } finally {
      setMarkingAll(false);
    }
  };

  // SELECT PROFILE PHOTO
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be smaller than 5 MB");
      return;
    }
    setError("");
    setMessage("");
    setProfilePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // UPLOAD PROFILE PHOTO
  const handlePhotoUpload = async () => {
    if (!profilePhoto) {
      setError("Please select a profile photo");
      return;
    }
    try {
      setUploadingPhoto(true);
      setError("");
      setMessage("");
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("photo", profilePhoto);
      const res = await axios.post(`${API_BASE_URL}/api/profile/photo`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile((prev) => ({ ...prev, profileImage: res.data.profileImage }));
      setPhotoPreview(res.data.profileImage);
      setProfilePhoto(null);
      setMessage("Profile photo updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // UPDATE EMAIL
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE_URL}/api/profile/email`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const user = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...user, email: res.data.email }));
      setMessage("Email updated successfully");
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update email");
    }
  };

  // CHANGE PASSWORD
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/auth/change-password`, {
        username: profile.username,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      const user = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...user, mustChangePassword: false }));
      setMessage("Password changed successfully");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  // FORMAT ROLE
  const formatRole = (role) => {
    if (!role) return "User";
    if (role === "SUPER_ADMIN") return "Super Admin";
    if (role === "ADMIN") return "Administrator";
    if (role === "TECHNICIAN") return "Technician";
    if (role === "STUDENT") return "Student";
    return role;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
            <p className="text-green-700 font-medium">{message}</p>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ACCOUNT INFORMATION */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>

            {/* PROFILE PHOTO */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-200 shadow-sm bg-yellow-500 flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {profile.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <label className="mt-3 text-sm font-semibold text-yellow-600 hover:text-yellow-700 cursor-pointer">
                Change Photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>

              {profilePhoto && (
                <button
                  type="button"
                  onClick={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="mt-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  {uploadingPhoto ? "Uploading..." : "Save Photo"}
                </button>
              )}
            </div>

            {/* USER INFORMATION */}
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
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="font-medium">
                  {profile.lastLogin
                    ? new Date(profile.lastLogin).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                      })
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* UPDATE EMAIL */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Update Email</h2>
            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
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

          {/* CHANGE PASSWORD */}
          <div className="bg-white p-6 rounded-xl shadow lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                required
                className="border p-3 rounded-lg"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                className="border p-3 rounded-lg"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
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

          {/* NOTIFICATIONS SECTION */}
          <div
            id="notifications"
            ref={notificationSectionRef}
            className="bg-white p-6 rounded-xl shadow lg:col-span-2 scroll-mt-20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-yellow-500" />
                <h2 className="text-lg font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll}
                    className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 font-medium disabled:opacity-50"
                  >
                    <CheckCheck size={16} />
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={fetchNotifications}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loadingNotifications ? (
              <div className="flex items-center justify-center py-10 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell size={36} className="mb-2 opacity-30" />
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                      n.read ? "bg-white" : "bg-yellow-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5 break-words">{n.message}</p>
                      {n.createdAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })}
                        </p>
                      )}
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(n.id)}
                        title="Mark as read"
                        className="shrink-0 mt-1 text-yellow-500 hover:text-yellow-600"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    {n.read && (
                      <span className="shrink-0 mt-1 text-gray-300">
                        <Check size={16} />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
