import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import image from "../assets/image.png";

function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("OTP Verified Successfully!");
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP Verification error ❌", err);
      alert("Server error");
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-1/2 bg-blue-100 flex items-center justify-center">
        <img
          src={image}
          alt="OTP Illustration"
          className="w-[90%] h-[90%] object-contain"
        />
      </div>

      <div className="w-1/2 flex items-center justify-center bg-white px-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-6 rounded-lg space-y-5"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Verify OTP
          </h2>
          <p className="text-sm text-center text-gray-500 mb-4">
            Enter the 6-digit OTP sent to your email
          </p>

          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
            className="w-full px-4 py-2 rounded-lg bg-blue-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition duration-300"
          >
            Verify OTP
          </button>

          <p className="text-sm text-center text-gray-600 mt-4">
            Didn’t get it?{' '}
            <span className="text-purple-600 font-semibold cursor-pointer">
              Resend OTP
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default OtpVerification;
