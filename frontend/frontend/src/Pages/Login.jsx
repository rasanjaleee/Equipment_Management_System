import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from '/images/logo.jpg';
import loginpage01 from "/images/loginpage01.png";


export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    username: "", 
    password: "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:8080/auth/login", form);
      
      // Store JWT token and user info
      const { token, id, username, email, role } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ id, username, email, role }));

      // Redirect to dashboard
      if (role === "ADMIN") {
        console.log("Redirecting to admin dashboard");
        navigate("/admin/dashboard");
      } else {
        console.log("Redirecting to user home");
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="max-w-md w-full">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg overflow-hidden bg-white">
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-800">FACULTY OF ENGINEERING</h1>
                <h2 className="text-xs text-gray-600">UNIVERSITY OF RUHUNA</h2>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              LOGIN TO LABORATORY EQUIPMENT<br />MANAGEMENT SYSTEM
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                required
                placeholder="Enter your username"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                required
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                'LOGIN'
              )}
            </button>

            {/* Signup Link */}
            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-yellow-600 hover:text-yellow-700 font-semibold underline"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent z-10"></div>
        <img
          src={loginpage01}
          alt="University Campus"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}