import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Globe, Send } from 'lucide-react';
import image from '../assets/image.png';
import { Link } from 'react-router-dom'; // ✅ Make sure this is imported

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    newsTypes: '',
    country: '',
    state: '',
    notifyDaily: false,
    deliveryMethod: 'email',
  });

  const [message, setMessage] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setMessage('✅ Registered Successfully!');
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Error occurred'}`);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Left side - Image */}
      <div className="lg:w-1/2 bg-blue-100 flex items-center justify-center p-12">
        <img src={image} alt="News Illustration" className="rounded-xl" />
      </div>

      {/* Right side - Form */}
      <div className="lg:w-1/2 w-full flex items-center justify-center bg-white p-4 border rounded-">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-4xl font-bold text-center text-gray-800">Sign up to NewsFlow</h1>
          <p className="text-center text-gray-500 text-sm">
            Stay updated with the latest news personalized just for you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name', icon: <User />, placeholder: 'Full Name' },
              { name: 'email', icon: <Mail />, placeholder: 'Email', type: 'email' },
              { name: 'password', icon: <Lock />, placeholder: 'Password', type: 'password' },
              { name: 'newsTypes', icon: <Send />, placeholder: 'News Types (comma-separated)' },
              { name: 'country', icon: <Globe />, placeholder: 'Country' },
              { name: 'state', icon: <Globe />, placeholder: 'State' },
            ].map(({ name, icon, placeholder, type = 'text' }) => (
              <div
                key={name}
                className="flex items-center gap-3 px-4 py-1 border border-gray-400 rounded-xl bg-gray-50"
              >
                <span className="text-gray-500">{icon}</span>
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-sm py-2"
                  required
                />
              </div>
            ))}

            {/* Checkbox */}
            <div className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                name="notifyDaily"
                checked={formData.notifyDaily}
                onChange={handleChange}
                className="accent-blue-600"
              />
              <label htmlFor="notifyDaily">Send me daily news updates</label>
            </div>

            {/* Delivery Method */}
            <div>
              <label className="block text-sm mb-1 text-gray-700">Delivery Method</label>
              <select
                name="deliveryMethod"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition duration-300 shadow-md"
            >
              Register Now
            </button>
          </form>

          {/* ✅ Login Redirect */}
          <p className="text-center text-sm text-gray-600 mt-2">
            Already registered?{' '}
            <Link to="/login" className="text-purple-600 font-medium hover:underline">
              Login here
            </Link>
          </p>

          {/* Message Display */}
          {message && (
            <p
              className={`text-center mt-2 text-sm ${
                message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignUp;
