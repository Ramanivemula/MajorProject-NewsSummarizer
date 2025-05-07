import { useState, useEffect } from "react";
import axios from "axios";

const EditPreferences = () => {
  const [formData, setFormData] = useState({
    name: "",
    newsTypes: [],
    country: "",
    state: "",
    notifyDaily: false,
    deliveryMethod: "email",
  });

  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        newsTypes: user.newsTypes || [],
        country: user.country || "",
        state: user.state || "",
        notifyDaily: user.notifyDaily || false,
        deliveryMethod: user.deliveryMethod || "email",
      });
    }

    const fetchFilters = async () => {
      const res = await axios.get("http://localhost:5000/api/news/filters");
      setCategories(res.data.categories || []);
      setCountries(res.data.countries || []);
      setStates(res.data.states || []);
    };
    fetchFilters();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, newsTypes: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("http://localhost:5000/api/users/update", formData);
      localStorage.setItem("user", JSON.stringify(res.data.updatedUser));
      alert("Preferences updated!");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Update failed", err.message);
      alert("Failed to update preferences");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">✏️ Edit Preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* News Types (multi-select) */}
        <div>
          <label className="block mb-1 font-medium">Preferred News Categories</label>
          <select
            multiple
            value={formData.newsTypes}
            onChange={handleMultiSelectChange}
            className="w-full border rounded p-2 h-32"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="block mb-1 font-medium">Country</label>
          <select name="country" value={formData.country} onChange={handleChange} className="w-full border rounded p-2">
            <option value="">Select Country</option>
            {countries.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div>
          <label className="block mb-1 font-medium">State</label>
          <select name="state" value={formData.state} onChange={handleChange} className="w-full border rounded p-2">
            <option value="">Select State</option>
            {states.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Notify & Delivery */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="notifyDaily"
              checked={formData.notifyDaily}
              onChange={handleChange}
            />
            <span>Send Daily Summary</span>
          </label>

          <select name="deliveryMethod" value={formData.deliveryMethod} onChange={handleChange} className="border p-2 rounded">
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-purple-700 text-white font-semibold px-6 py-2 rounded hover:bg-purple-800 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditPreferences;
