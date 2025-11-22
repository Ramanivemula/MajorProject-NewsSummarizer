import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaNewspaper, FaCog, FaBell } from "react-icons/fa";
import background from "../assets/background.png";
import axios from "axios";

const LandingPage = () => {
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("/api/news/latest?max=10");
        console.log("News fetched:", res.data);
        setLatestNews(res.data.articles || []);
      } catch (err) {
        console.error("Error fetching latest news:", err.message);
        console.error("Full error:", err.response?.data);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800">
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

      <section
        className="relative h-[90vh] bg-cover bg-center flex items-center justify-center text-center px-6"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
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

      <section className="py-20 bg-white text-center">
        <h3 className="text-4xl font-bold mb-14 text-purple-700">How MeraPaper Works</h3>
        <div className="flex flex-col md:flex-row justify-center items-center gap-10 px-6">
          {[
            { icon: <FaCog />, title: "Customize Preferences", desc: "Select your interests, location & delivery method." },
            { icon: <FaBell />, title: "Get Daily Summaries", desc: "We send full paragraph summaries via Email or WhatsApp." },
            { icon: <FaNewspaper />, title: "Read the News", desc: "View rich summaries in your dashboard with full links." }
          ].map((item, i) => (
            <div key={i} className="max-w-sm p-8 rounded-2xl border shadow-md bg-white hover:shadow-xl transition">
              <div className="text-4xl text-purple-600 mb-4">{item.icon}</div>
              <h4 className="text-2xl font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-gray-100 text-center">
        <h3 className="text-5xl font-extrabold mb-16 text-purple-700 tracking-widest">🗞️ Latest News</h3>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 px-4 md:px-10">
          {latestNews.length === 0 ? (
            <p className="col-span-full text-gray-500 text-lg">Loading news...</p>
          ) : (
            latestNews.slice(0, 6).map((news, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden flex flex-col justify-between text-left border border-gray-200 min-h-[400px] max-w-[360px] mx-auto"
              >
                {/* News Image */}
                {news.image && (
                  <img 
                    src={news.image} 
                    alt={news.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg md:text-xl text-gray-900 tracking-normal leading-snug line-clamp-2">
                      {news.title}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                      {news.description || news.summary || news.content}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-700 hover:text-purple-900 font-medium text-sm underline inline-block"
                    >
                      🔗 Read Full Article
                    </a>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">📅 {new Date(news.publishedAt).toLocaleDateString()}</p>
                      {news.source?.name && (
                        <p className="text-xs text-gray-500 font-medium">📰 {news.source.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
