import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Mail, User, Lock, UserPlus, LogIn } from 'lucide-react';

export default function Login({ setIsLogin, onLogin, onRegister }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.username.trim()) {
        setError('Username is required');
        return false;
      }
    } else {
      if (!formData.username.trim()) {
        setError('Username or email is required');
        return false;
      }
      if (!formData.password) {
        setError('Password is required');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      let success;
      
      if (isSignUp) {
        success = await onRegister({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          first_name: formData.firstName,
          last_name: formData.lastName
        });
      } else {
        success = await onLogin(formData.username, formData.password);
      }
      
      if (success) {
        setIsLogin(true);
      } else {
        setError(isSignUp ? 'Registration failed. Please try again.' : 'Invalid username or password.');
      }
    } catch (err) {
      setError('Connection error. Please make sure the backend server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100 transition-all duration-300">
      {/* Brand Identity / Logo */}
      <div className="flex flex-col items-center mb-8 space-y-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
          <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">NutriFlow</h2>
        <p className="text-sm font-medium text-slate-400">
          {isSignUp ? "Create your account" : "Sign in to your dashboard"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        {/* Sign Up Fields */}
        {isSignUp && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                Username
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border rounded-xl bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm border rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border rounded-xl bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </>
        )}

        {/* Login Fields */}
        {!isSignUp && (
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              Username or Email
            </label>
            <input
              type="text"
              name="username"
              required
              placeholder="johndoe or john@example.com"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm border rounded-xl bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        )}

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Password
            </label>
            {!isSignUp && (
              <button type="button" className="text-xs font-semibold text-indigo-600 hover:underline">
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm border rounded-xl bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {isSignUp && (
            <p className="text-[10px] text-slate-400 mt-1">Password must be at least 6 characters</p>
          )}
        </div>

        {/* Confirm Password (Sign Up only) */}
        {isSignUp && (
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm border rounded-xl bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 font-bold text-white rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </>
          )}
        </button>
      </form>

      {/* Toggle between Login and Sign Up */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setFormData({
                email: '',
                password: '',
                username: '',
                firstName: '',
                lastName: '',
                confirmPassword: ''
              });
            }}
            className="font-bold text-indigo-600 hover:underline focus:outline-none"
          >
            {isSignUp ? "Sign In" : "Create Account"}
          </button>
        </p>
      </div>

      {/* Demo Credentials Hint */}
      {!isSignUp && (
        <div className="mt-4 p-2 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[10px] text-slate-400 text-center">
            <span className="font-semibold text-slate-500">Demo:</span> Use "testuser" / "testpass123"
          </p>
        </div>
      )}
    </div>
  );
}