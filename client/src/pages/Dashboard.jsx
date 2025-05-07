import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState({ name: "User" });
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedTime, setSelectedTime] = useState("lastWeek");

  const [newsList, setNewsList] = useState([]);

  const baseURL = "http://localhost:5000/api/news"; // change if deployed

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) setUser(userData);
  }, []);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get(`${baseURL}/filters`);
        const { categories, countries, states } = res.data;
        setCategories(categories);
        setCountries(countries);
        setStates(states);
      } catch (err) {
        console.error("Failed to load filters", err);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const res = await axios.get(`${baseURL}/latest`);
        const newsArray = Array.isArray(res.data.articles) ? res.data.articles : [];
        setNewsList(newsArray);
        console.log("Dashboard News:", newsArray);
      } catch (err) {
        console.error("Failed to fetch latest news", err.message);
        setNewsList([]);
      }
    };
    fetchLatestNews();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-purple-700 text-gray55600 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">MeraPaper Dashboard</h1>
        <div className="relative group">
          <button className="font-semibold">{user.name} ⏷</button>
          <div className="absolute right-0 mt-2 w-32 bg-white text-black shadow-md rounded hidden group-hover:block z-10">
          <button
  onClick={() => (window.location.href = "/edit")}
  className="block w-full px-4 py-2 text-left hover:bg-gray-200"
>
  Edit
</button>
            <button onClick={handleLogout} className="block w-full px-4 py-2 text-left hover:bg-gray-200">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="p-6">
        <h2 className="text-xl font-bold text-purple-700 mb-4">News Feed</h2>

        {/* Filters */}
        <section className="bg-white p-6 rounded shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter News</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterSelect label="News Categories" options={categories} value={selectedCategory} onChange={setSelectedCategory} defaultText="All" />
            <FilterSelect label="Country" options={countries} value={selectedCountry} onChange={setSelectedCountry} defaultText="All Countries" />
            <FilterSelect label="State" options={states} value={selectedState} onChange={setSelectedState} defaultText="All States" />
            <FilterSelect
              label="Time Range"
              options={[
                { label: "Last Week", value: "lastWeek" },
                { label: "Last Month", value: "lastMonth" },
                { label: "Last Year", value: "lastYear" },
              ]}
              value={selectedTime}
              onChange={setSelectedTime}
              isObjectOption
            />
          </div>
        </section>

        {/* News Cards (like Landing Page style) */}
        <section className="py-10">
          <h3 className="text-3xl font-bold text-purple-700 mb-10 text-center">News For You</h3>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 px-4 md:px-10">
            {newsList.length === 0 ? (
              <p className="col-span-full text-gray-500 text-lg text-center">No news found at the moment.</p>
            ) : (
              newsList.slice(0, 6).map((news, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 flex flex-col justify-between text-left border border-gray-200 min-h-[340px] max-w-[360px] mx-auto"
                >
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg md:text-xl text-gray-900 tracking-normal leading-snug line-clamp-2">
                      🗞️ {news.title}
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2 list-disc ml-5 leading-relaxed">
                      {news.summary?.slice(0, 4).map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-700 hover:text-purple-900 font-medium text-sm underline"
                    >
                      🔗 Read Full Article
                    </a>
                    <p className="text-xs text-gray-400 mt-1">📅 {new Date(news.publishedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4">
        © 2025 MeraPaper | Made with ❤️ for Smart News Reading
      </footer>
    </div>
  );
};

const FilterSelect = ({ label, options, value, onChange, defaultText, isObjectOption = false }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select className="w-full border rounded p-2" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{defaultText}</option>
      {options.map((opt, idx) =>
        isObjectOption ? (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ) : (
          <option key={idx} value={opt}>
            {opt}
          </option>
        )
      )}
    </select>
  </div>
);

export default Dashboard;
