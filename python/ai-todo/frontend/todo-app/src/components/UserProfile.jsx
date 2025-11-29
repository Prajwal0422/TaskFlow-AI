import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || "http://localhost:8002";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [notificationMethods, setNotificationMethods] = useState({
    webpush: true,
    email: true
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // In a real app, this would come from auth
      const userId = "default_user";
      const res = await axios.get(`${API}/users/${userId}`);
      setUser(res.data);
      setName(res.data.name || '');
      setTimezone(res.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setNotificationMethods(res.data.notification_methods || { webpush: true, email: true });
    } catch (error) {
      console.error("Error loading user:", error);
      // Create a default user if not exists
      createUser();
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      const newUser = {
        id: "default_user",
        name: "Default User",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notification_methods: { webpush: true, email: true },
        behavior_stats: {},
        created_at: new Date().toISOString()
      };
      
      const res = await axios.post(`${API}/users`, newUser);
      setUser(res.data);
      setName(res.data.name || '');
      setTimezone(res.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setNotificationMethods(res.data.notification_methods || { webpush: true, email: true });
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const updateUser = async () => {
    try {
      const userId = "default_user";
      const updatedUser = {
        id: userId,
        name: name,
        timezone: timezone,
        notification_methods: notificationMethods,
        behavior_stats: user?.behavior_stats || {},
        created_at: user?.created_at || new Date().toISOString()
      };
      
      const res = await axios.put(`${API}/users/${userId}`, updatedUser);
      setUser(res.data);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update profile");
    }
  };

  const updateNotificationMethods = async () => {
    try {
      const userId = "default_user";
      const updatedUser = {
        id: userId,
        name: user?.name || name,
        timezone: user?.timezone || timezone,
        notification_methods: notificationMethods,
        behavior_stats: user?.behavior_stats || {},
        created_at: user?.created_at || new Date().toISOString()
      };
      
      const res = await axios.put(`${API}/users/${userId}`, updatedUser);
      setUser(res.data);
      alert("Notification preferences updated!");
    } catch (error) {
      console.error("Error updating notification methods:", error);
      alert("Failed to update notification preferences");
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <p className="text-gray-400">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">User Profile</h3>
        {!editing ? (
          <button 
            onClick={() => setEditing(true)}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Edit
          </button>
        ) : (
          <button 
            onClick={() => setEditing(false)}
            className="text-gray-400 hover:text-gray-300 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
      
      {user && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {name.charAt(0) || user.name.charAt(0)}
            </div>
            {editing ? (
              <div className="flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full input-field py-2 px-3 text-white rounded-lg"
                  placeholder="Your name"
                />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full input-field py-2 px-3 text-white rounded-lg mt-2"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                </select>
              </div>
            ) : (
              <div>
                <h4 className="font-bold text-white">{user.name}</h4>
                <p className="text-gray-400 text-sm">{user.timezone}</p>
              </div>
            )}
          </div>
          
          {editing ? (
            <div className="pt-4 border-t border-gray-700">
              <h4 className="font-bold text-white mb-3">Notification Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Web Push Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationMethods.webpush}
                      onChange={(e) => setNotificationMethods({...notificationMethods, webpush: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationMethods.email}
                      onChange={(e) => setNotificationMethods({...notificationMethods, email: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
              
              <button 
                onClick={updateUser}
                className="btn btn-primary w-full mt-4 rounded-xl"
              >
                Save Profile
              </button>
            </div>
          ) : (
            <>
              <div className="pt-4 border-t border-gray-700">
                <h4 className="font-bold text-white mb-3">Notification Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Web Push Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationMethods.webpush}
                        onChange={(e) => setNotificationMethods({...notificationMethods, webpush: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Email Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationMethods.email}
                        onChange={(e) => setNotificationMethods({...notificationMethods, email: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
                
                <button 
                  onClick={updateNotificationMethods}
                  className="btn btn-primary w-full mt-4 rounded-xl"
                >
                  Update Preferences
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <h4 className="font-bold text-white mb-3">Personalization</h4>
                <p className="text-gray-400 text-sm">
                  Your AI suggestions are personalized based on your task history and completion patterns.
                </p>
                <div className="mt-3 flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-gray-300">Personalization active</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;