import React, { useState, useEffect } from 'react';
import { User, LogOut, Check, Shield, Save, Mail, Edit2, UserCircle, Lock, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function Profile({ metrics, setMetrics, onUpdateProfile, onLogout, userRole }) {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await api.getProfile();
      setProfileData({
        username: profile.username || '',
        email: profile.email || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
      });
      setTempUsername(profile.username || '');
      
      setMetrics(prev => ({
        ...prev,
        name: profile.username,
        email: profile.email,
      }));
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Could not load profile data');
      setLoading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!tempUsername.trim()) return;
    try {
      const updated = await onUpdateProfile({ ...profileData, username: tempUsername });
      if (updated) {
        setProfileData(prev => ({ ...prev, username: tempUsername }));
        setMetrics(prev => ({ ...prev, name: tempUsername }));
        setIsEditingUsername(false);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      setError('Username update failed');
    }
  };

  const displayName = `${profileData.first_name} ${profileData.last_name}`.trim() || profileData.username;
  const userTitle = userRole === 'nutritionist' ? 'Lead Dietitian' : userRole === 'admin' ? 'Administrator' : 'Member';
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Profile <span className="text-indigo-600">Settings</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Manage your account information and security settings
          </p>
        </div>
        {isSaved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm animate-slide-up">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold">Profile updated!</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <Shield className="w-5 h-5 text-rose-600" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 sticky top-8">
            {/* Avatar */}
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full bg-linear-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-black text-4xl shadow-inner mx-auto">
                {userInitials || 'U'}
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mt-4">{displayName}</h2>
            <p className="text-xs font-semibold text-indigo-600 mt-1 bg-indigo-50 px-3 py-1 rounded-full inline-block">
              {userTitle}
            </p>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium">Member since 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information Card */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4 bg-linear-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Account Information</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Manage your personal account details</p>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Username Section */}
              <div className="group">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <User className="w-3 h-3" />
                  Username
                </label>
                <div className="flex gap-2">
                  {isEditingUsername ? (
                    <>
                      <input
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleUsernameUpdate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingUsername(false);
                          setTempUsername(profileData.username);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium">
                        {profileData.username}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingUsername(true)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Full Name - Read Only */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <UserCircle className="w-3 h-3" />
                  Full Name
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium">
                  {displayName}
                </div>
              </div>

              {/* Email - Read Only */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3 h-3" />
                  Email Address
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium">
                  {profileData.email}
                </div>
              </div>
            </div>
          </div>

          {/* Session Management Card */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4 bg-linear-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Security & Session</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Manage your account security and active sessions</p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-sm font-bold text-slate-700">Active Session</span>
                  <span className="text-[10px] text-slate-400">You are currently logged into this account</span>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="bg-linear-to-r from-indigo-50 to-indigo-100/30 border border-indigo-100 rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-800">Account Status</p>
                <p className="text-[10px] text-indigo-600">Your account is secure and verified</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}