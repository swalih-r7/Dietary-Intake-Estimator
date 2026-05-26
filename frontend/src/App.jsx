// src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import { api, getUserRole, isAuthenticated } from './services/api';

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('patient');
  
  const [personalMetrics, setPersonalMetrics] = useState({
    id: null,
    name: '',
    email: '',
    firstName: '',
    lastName: '',
    age: null,
    height: null,
    weight: null,
    dailyCalorieTarget: 2000,
    dailyCalorieIntake: 0,
    remainingBudget: 2000,
    complianceScore: 0,
    dailyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        await fetchUserProfile();
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await api.getProfile();
      const history = await api.getHistory();
      
      setUser(profile);
      setUserRole(getUserRole());
      
      const targetCalories = profile.daily_calorie_goal || 2000;
      const currentIntake = history.daily_totals?.calories || 0;
      
      setPersonalMetrics({
        id: profile.id,
        name: profile.username || 'User',
        email: profile.email || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        age: profile.age || null,
        height: profile.height || null,
        weight: profile.weight || null,
        dailyCalorieTarget: targetCalories,
        dailyCalorieIntake: currentIntake,
        remainingBudget: Math.max(0, targetCalories - currentIntake),
        complianceScore: targetCalories > 0 ? Math.min(100, Math.round((currentIntake / targetCalories) * 100)) : 0,
        dailyTotals: history.daily_totals || { calories: 0, protein: 0, carbs: 0, fat: 0 }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      setIsLogin(false);
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const data = await api.login({ username, password });
      if (data.access) {
        setIsLogin(true);
        setUserRole(getUserRole());
        await fetchUserProfile();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleRegister = async (userData) => {
    try {
      const data = await api.register(userData);
      if (data.access) {
        setIsLogin(true);
        setUserRole(getUserRole());
        await fetchUserProfile();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setIsLogin(false);
    setUser(null);
    setUserRole('patient');
    setActivePage('dashboard');
  };

  const handleAddMeal = async (mealData) => {
    // Update local state immediately for UI responsiveness
    const newIntake = personalMetrics.dailyCalorieIntake + mealData.calories;
    const targetCalories = personalMetrics.dailyCalorieTarget;
    
    setPersonalMetrics(prev => ({
      ...prev,
      dailyCalorieIntake: newIntake,
      remainingBudget: Math.max(0, targetCalories - newIntake),
      dailyTotals: {
        calories: newIntake,
        protein: prev.dailyTotals.protein + (mealData.macros?.protein || 0),
        carbs: prev.dailyTotals.carbs + (mealData.macros?.carbs || 0),
        fat: prev.dailyTotals.fat + (mealData.macros?.fat || 0)
      },
      complianceScore: targetCalories > 0 ? Math.min(100, Math.round((newIntake / targetCalories) * 100)) : 0
    }));
    
    // Refresh history from server to ensure consistency (background sync)
    try {
      const history = await api.getHistory();
      if (history.daily_totals) {
        setPersonalMetrics(prev => ({
          ...prev,
          dailyCalorieIntake: history.daily_totals.calories,
          remainingBudget: Math.max(0, targetCalories - history.daily_totals.calories),
          dailyTotals: history.daily_totals,
          complianceScore: targetCalories > 0 ? Math.min(100, Math.round((history.daily_totals.calories / targetCalories) * 100)) : 0
        }));
      }
    } catch (error) {
      console.error('Failed to refresh history:', error);
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const updated = await api.updateProfile(profileData);
      if (updated) {
        setPersonalMetrics(prev => ({
          ...prev,
          dailyCalorieTarget: updated.daily_calorie_goal || prev.dailyCalorieTarget,
          name: updated.username || prev.name,
          email: updated.email || prev.email,
          firstName: updated.first_name || prev.firstName,
          lastName: updated.last_name || prev.lastName,
          age: updated.age || prev.age,
          height: updated.height || prev.height,
          weight: updated.weight || prev.weight
        }));
      }
      return updated;
    } catch (error) {
      console.error('Profile update error:', error);
      return null;
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'history':
        return <History metrics={personalMetrics} onAddMeal={handleAddMeal} userRole={userRole} />;
      case 'profile':
        return (
          <Profile
            metrics={personalMetrics}
            setMetrics={setPersonalMetrics}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            userRole={userRole}
          />
        );
      case 'dashboard':
      default:
        return (
          <Dashboard 
            metrics={personalMetrics} 
            onAddMeal={handleAddMeal} 
            user={user} 
            userRole={userRole} 
          />
        );
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
          <p className="text-xs text-slate-400 mt-1">Connecting to NutriFlow AI</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isLogin && !isAuthenticated()) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
        <Login 
          setIsLogin={setIsLogin} 
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </div>
    );
  }

  // Main app with sidebar (only shows when logged in)
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30 flex">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={handleLogout} 
        userName={personalMetrics.firstName || personalMetrics.name} 
        userRole={userRole} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="px-8 lg:px-10 py-4 border-t border-slate-100 bg-white/50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <p className="text-[10px] text-slate-400">
              © 2026 NutriFlow • AI-Powered Dietary Intelligence
            </p>
            <p className="text-[10px] text-slate-400 flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${
                userRole === 'nutritionist' ? 'bg-emerald-500' : 
                userRole === 'admin' ? 'bg-purple-500' : 'bg-indigo-500'
              }`} />
              {userRole === 'nutritionist' ? 'Nutritionist' : 
               userRole === 'admin' ? 'Admin' : 'Patient'} Portal
            </p>
          </div>
        </footer>
      </div>
    </div>
  );


}

export default App;