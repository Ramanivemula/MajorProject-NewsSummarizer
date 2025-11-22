// Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../assets/image.png";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Login form submitted ✅", formData);

    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Login success, navigating to OTP page ✅");
        alert("OTP sent to your email.");
        navigate("/verify-otp", { state: { email: formData.email } });
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error ❌", err);
      alert("Server error during login");
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-1/2 bg-blue-100 flex items-center justify-center">
        <img
          src={image}
          alt="Login Illustration"
          className="w-[90%] h-[90%] object-contain"
        />
      </div>

      <div className="w-1/2 flex items-center justify-center bg-white px-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-6 rounded-lg space-y-5"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Login to NewsFlow
          </h2>
          <p className="text-sm text-center text-gray-500 mb-4">
            Access your personalized news dashboard
          </p>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-blue-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-blue-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition duration-300"
          >
            Login
          </button>

          <p className="text-sm text-center text-gray-600 mt-4">
            Don’t have an account?{' '}
            <span
              className="text-purple-600 font-semibold cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;