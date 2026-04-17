import { useState, useEffect } from "react";
import axios from "axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "STUDENT"
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role
      };

      const res = await axios.post(
        "http://localhost:8080/api/admin/create-user",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage(res.data?.message || "User created successfully");

      setForm({
        username: "",
        email: "",
        password: "",
        role: "STUDENT"
      });

      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating user");
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="font-semibold text-lg mb-4">Create New User</h2>
          <p className="text-sm text-gray-500 mb-4">
            Accounts are created with a temporary password. The user must change it on first login.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="border p-3 rounded-lg"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="border p-3 rounded-lg"
            />

            <input
              type="password"
              name="password"
              placeholder="Temporary Password"
              value={form.password}
              onChange={handleChange}
              required
              className="border p-3 rounded-lg"
            />

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border p-3 rounded-lg"
            >
              <option value="STUDENT">Student</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mt-4">
              <p className="text-green-700 font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mt-4">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-semibold">
            Create User
          </button>
        </form>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold text-lg mb-4">All Users</h2>

          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-200 text-center">
                  <th className="p-3">ID</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Must Change Password</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="text-center border-t">
                    <td className="p-3">{u.id}</td>
                    <td className="p-3">{u.username}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3">{u.mustChangePassword ? "Yes" : "No"}</td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}