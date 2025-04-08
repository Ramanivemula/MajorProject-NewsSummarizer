import React from "react";
import { Link } from "react-router-dom";
import { FaNewspaper, FaCog, FaBell } from "react-icons/fa";
import background from "../assets/background.png";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md py-6 px-8 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight">
          <FaNewspaper className="text-4xl" /> MeraPaper
        </h1>
        <div className="flex gap-4">
          <Link to="/login" className="hover:underline hover:text-gray-100 transition">Login</Link>
          <Link
            to="/signup"
            className="bg-white text-purple-700 px-5 py-2 rounded-lg font-medium shadow hover:bg-purple-100 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[90vh] bg-cover bg-center flex items-center justify-center text-center px-6"
        style={{
          backgroundImage: `url(${background})`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10 text-white max-w-3xl animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-md">
            Stay Updated,<br /> Stay Smart
          </h2>
          <p className="text-xl md:text-2xl mb-8 drop-shadow">
            Get personalized and summarized news delivered to your device — every single day.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 px-10 py-4 rounded-full text-lg font-semibold shadow-lg transition"
          >
            Join MeraPaper Now
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white text-center">
        <h3 className="text-4xl font-bold mb-14 text-purple-700">How MeraPaper Works</h3>
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 px-6">
          {[ 
            { icon: <FaCog />, title: "Customize Preferences", desc: "Select your interests, location & delivery method." },
            { icon: <FaBell />, title: "Get Daily Summaries", desc: "We send 5–6 point summaries via Email or WhatsApp." },
            { icon: <FaNewspaper />, title: "Read the News", desc: "View summarized news in your dashboard with full links." }
          ].map((item, i) => (
            <div key={i} className="max-w-sm p-8 rounded-2xl border shadow-md bg-white hover:shadow-xl transition">
              <div className="text-4xl text-purple-600 mb-4">{item.icon}</div>
              <h4 className="text-2xl font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest News (Dummy cards) */}
      <section className="py-20 bg-gray-100 text-center">
        <h3 className="text-4xl font-bold mb-12 text-purple-700">Latest News</h3>
        <div className="grid gap-8 md:grid-cols-3 px-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white shadow-lg p-6 rounded-xl hover:shadow-2xl transition">
              <h4 className="font-bold text-xl mb-3 text-gray-800">Breaking Headline {n}</h4>
              <ul className="text-left text-sm text-gray-600 mb-4 list-disc ml-5 space-y-1">
                <li>Point 1 of the summary</li>
                <li>Point 2 of the summary</li>
                <li>Point 3 of the summary</li>
              </ul>
              <a href="#" className="text-purple-600 hover:underline text-sm font-medium">Read Full Article</a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
