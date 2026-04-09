import { useState, useEffect } from "react";
import axios from "axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER"
  });

  const token = localStorage.getItem("token");

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create user
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8080/api/admin/create-user", form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("User created successfully");
      setForm({
        username: "",
        email: "",
        password: "",
        role: "USER"
      });

      fetchUsers();
    } catch (err) {
      alert("Error creating user");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">User Management</h1>

      {/* CREATE USER FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Create New User</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />

   <select
  name="role"
  value={form.role}
  onChange={handleChange}
  className="border p-2 rounded"
>
  <option value="STUDENT">Student</option>
  <option value="TECHNICIAN">Technician</option>
  <option value="ADMIN">Admin</option>
</select>
        </div>

        <button className="mt-4 bg-yellow-500 px-4 py-2 rounded">
          Create User
        </button>
      </form>

      {/* USERS TABLE */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">All Users</h2>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="text-center border-t">
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}