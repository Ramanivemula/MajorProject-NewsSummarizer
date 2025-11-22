import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Globe, MapPin, Bell, Save, LogOut, ChevronRight } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    newsTypes: [],
    country: '',
    state: '',
    notifyDaily: false,
    deliveryMethod: 'email'
  });

  const [preferences, setPreferences] = useState({
    notificationSettings: {
      email: {
        enabled: false,
        frequency: 'daily',
        timeOfDay: '08:00'
      },
      whatsapp: {
        enabled: false,
        frequency: 'none',
        phoneNumber: ''
      }
    },
    keywords: {
      include: [],
      exclude: []
    },
    blockedSources: []
  });

  const [editMode, setEditMode] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordType, setKeywordType] = useState('include');

  const newsCategories = [
    'Technology', 'Sports', 'Politics', 'Entertainment', 
    'Business', 'Science', 'Health', 'Environment', 'General'
  ];

  const countries = ['India', 'USA', 'UK', 'Australia', 'Canada'];
  const states = {
    India: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Andhra Pradesh', 'Assam'],
    USA: ['California', 'New York', 'Texas', 'Florida'],
    UK: ['England', 'Scotland', 'Wales'],
    Australia: ['New South Wales', 'Victoria', 'Queensland'],
    Canada: ['Ontario', 'Quebec', 'British Columbia']
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUserData(data.user);
          if (data.preference) {
            setPreferences(data.preference);
          }
        } else {
          throw new Error('Failed to fetch profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setMessage('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (res.ok) {
        setMessage('✅ Profile updated successfully!');
        setEditMode(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:5000/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (res.ok) {
        setMessage('✅ Preferences updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update preferences');
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      setMessage('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = keywordType === 'include' ? 'include' : 'exclude';
      
      const res = await fetch(`http://localhost:5000/api/user/preferences/keywords/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ keyword: newKeyword.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setPreferences({ ...preferences, keywords: data.keywords });
        setNewKeyword('');
        setMessage(`✅ Keyword "${newKeyword}" added to ${keywordType} list`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error adding keyword:', err);
    }
  };

  const handleRemoveKeyword = async (keyword, type) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:5000/api/user/preferences/keywords/${type}/${keyword}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPreferences({ ...preferences, keywords: data.keywords });
      }
    } catch (err) {
      console.error('Error removing keyword:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleNewsType = (type) => {
    setUserData(prev => ({
      ...prev,
      newsTypes: prev.newsTypes.includes(type)
        ? prev.newsTypes.filter(t => t !== type)
        : [...prev.newsTypes, type]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{userData.name}</h1>
                <p className="text-gray-600">{userData.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {editMode ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-gray-50">
                <User className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  disabled={!editMode}
                  className="flex-1 bg-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-gray-100">
                <Mail className="w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="flex-1 bg-transparent outline-none text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-gray-50">
                <Globe className="w-5 h-5 text-gray-500" />
                <select
                  value={userData.country}
                  onChange={(e) => setUserData({ ...userData, country: e.target.value, state: '' })}
                  disabled={!editMode}
                  className="flex-1 bg-transparent outline-none"
                >
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {userData.country && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-gray-50">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <select
                    value={userData.state}
                    onChange={(e) => setUserData({ ...userData, state: e.target.value })}
                    disabled={!editMode}
                    className="flex-1 bg-transparent outline-none"
                  >
                    <option value="">Select State</option>
                    {states[userData.country]?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">News Categories</label>
              <div className="flex flex-wrap gap-2">
                {newsCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => editMode && toggleNewsType(cat)}
                    disabled={!editMode}
                    className={`px-3 py-1 rounded-full text-sm ${
                      userData.newsTypes?.includes(cat)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    } ${editMode ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {editMode && (
              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive news updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.notificationSettings?.email?.enabled || false}
                onChange={(e) => setPreferences({
                  ...preferences,
                  notificationSettings: {
                    ...preferences.notificationSettings,
                    email: {
                      ...preferences.notificationSettings.email,
                      enabled: e.target.checked
                    }
                  }
                })}
                className="w-5 h-5 accent-purple-600"
              />
            </div>

            {preferences.notificationSettings?.email?.enabled && (
              <div className="pl-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <select
                  value={preferences.notificationSettings.email.frequency}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notificationSettings: {
                      ...preferences.notificationSettings,
                      email: {
                        ...preferences.notificationSettings.email,
                        frequency: e.target.value
                      }
                    }
                  })}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="none">None</option>
                </select>
              </div>
            )}

            <button
              onClick={handleUpdatePreferences}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* Keywords Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Keyword Filters</h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword..."
                className="flex-1 px-4 py-2 border rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <select
                value={keywordType}
                onChange={(e) => setKeywordType(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="include">Include</option>
                <option value="exclude">Exclude</option>
              </select>
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add
              </button>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Include Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {preferences.keywords?.include?.map(keyword => (
                  <span key={keyword} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                    {keyword}
                    <button onClick={() => handleRemoveKeyword(keyword, 'include')} className="hover:text-green-900">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Exclude Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {preferences.keywords?.exclude?.map(keyword => (
                  <span key={keyword} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
                    {keyword}
                    <button onClick={() => handleRemoveKeyword(keyword, 'exclude')} className="hover:text-red-900">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Back to Dashboard
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Profile;
