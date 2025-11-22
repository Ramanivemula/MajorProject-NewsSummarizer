import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGlobeAsia,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaTag,
  FaExternalLinkAlt,
} from "react-icons/fa";
import axios from "axios";
import SummarizeButton from "../components/SummarizeButton";

const countries = ["in", "us", "au", "gb", "ca"];
const countryNames = {
  in: "India",
  us: "United States",
  au: "Australia",
  gb: "United Kingdom",
  ca: "Canada"
};
const categories = ["general", "technology", "sports", "science", "health", "business", "entertainment", "nation", "world"];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({ country: "", category: "", date: "" });
  const [allNews, setAllNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.country) params.append('country', filters.country);
        if (filters.category) params.append('category', filters.category);
        params.append('max', '20');
        
        const res = await axios.get(`/api/news/latest?${params.toString()}`);
        console.log("News fetched:", res.data);
        const articles = res.data.articles || [];
        setAllNews(articles);
        setFilteredNews(articles);
      } catch (err) {
        console.error("Error fetching news:", err.message);
        setAllNews([]);
        setFilteredNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [filters.country, filters.category]);

  useEffect(() => {
    let filtered = allNews;
    if (filters.date) {
      filtered = filtered.filter(article => {
        const articleDate = new Date(article.publishedAt).toISOString().split('T')[0];
        return articleDate === filters.date;
      });
    }
    setFilteredNews(filtered);
  }, [filters.date, allNews]);

  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name.split(" ").map(n => n[0].toUpperCase()).join("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-700">📰 NewsSummarizer</h1>
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg"
            >
              {getInitials(user.name)}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow z-20">
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Filter News</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            name="country"
            value={filters.country}
            onChange={handleChange}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{countryNames[c]}</option>)}
          </select>

          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleChange}
            className="px-4 py-2 border rounded-md"
          />
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600 text-lg">Loading news...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredNews.map((article, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {article.image && (
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">{article.title}</h3>
                    {article.source?.name && (
                      <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                        <FaTag className="text-purple-400" /> {article.source.name}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                      <FaRegCalendarAlt className="text-purple-400" /> 
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                      {article.description || article.summary || article.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-purple-600 hover:underline font-medium"
                      >
                        Read Full Article <FaExternalLinkAlt className="ml-1" />
                      </a>
                      <SummarizeButton article={{
                        ...article,
                        link: article.url,
                        fullText: article.content
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredNews.length === 0 && !loading && (
              <p className="text-gray-600 mt-6">No news articles match the filters.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
