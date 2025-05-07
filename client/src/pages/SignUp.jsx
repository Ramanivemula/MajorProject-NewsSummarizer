import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const countries = ["India", "USA", "Canada"];
const statesByCountry = {
  India: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"],
  USA: ["California", "Texas", "New York"],
  Canada: ["Ontario", "Quebec", "British Columbia"],
};

const newsTypesList = ["Politics", "Sports", "Technology", "Health", "Entertainment"];
const deliveryMethods = ["email", "whatsapp"];

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    preferences: {
      newsTypes: [],
      country: "",
      state: "",
      notifyDaily: null,
      deliveryMethod: [],
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: checked
            ? [...prev.preferences[name], value]
            : prev.preferences[name].filter((v) => v !== value),
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [name]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      alert(res.data.msg);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-3xl rounded-xl shadow-md p-10 space-y-6"
      >
        <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-2">
          Create Your MeraPaper Account
        </h2>

        {/* Full Name */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Country */}
        <select
          name="country"
          value={formData.preferences.country}
          onChange={handlePreferenceChange}
          required
          className="w-full px-4 py-3 border rounded-lg text-gray-700"
        >
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* State */}
        <select
          name="state"
          value={formData.preferences.state}
          onChange={handlePreferenceChange}
          required
          className="w-full px-4 py-3 border rounded-lg text-gray-700"
        >
          <option value="">Select State</option>
          {(statesByCountry[formData.preferences.country] || []).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* News Types */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">News Preferences</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {newsTypesList.map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="newsTypes"
                  value={type}
                  checked={formData.preferences.newsTypes.includes(type)}
                  onChange={handlePreferenceChange}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Daily Notification */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Receive Daily News Notifications
          </label>
          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="notifyDaily"
                value="true"
                checked={formData.preferences.notifyDaily === true}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, notifyDaily: true },
                  }))
                }
                required
              />
              Yes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="notifyDaily"
                value="false"
                checked={formData.preferences.notifyDaily === false}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    preferences: { ...prev.preferences, notifyDaily: false },
                  }))
                }
              />
              No
            </label>
          </div>
        </div>

        {/* Delivery Methods */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">Delivery Method</label>
          <div className="flex gap-6 text-sm">
            {deliveryMethods.map((method) => (
              <label key={method} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="deliveryMethod"
                  value={method}
                  checked={formData.preferences.deliveryMethod.includes(method)}
                  onChange={handlePreferenceChange}
                />
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium text-lg hover:bg-indigo-700 transition"
        >
          Sign Up
        </button>

        {/* Already a member */}
        <div className="text-center text-sm text-gray-600 mt-2">
          Already a member?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Login here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
