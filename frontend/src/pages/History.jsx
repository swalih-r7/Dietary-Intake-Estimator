import React, { useState, useEffect } from 'react';
import { Activity, Flame, Salad, Search, Plus, Trash2, Calendar, UtensilsCrossed } from 'lucide-react';
import { api } from '../services/api';

export default function History({ metrics, onAddMeal, userRole }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [mealHistory, setMealHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [filter, setFilter] = useState('all');
  const [newMeal, setNewMeal] = useState({
    name: '',
    category: 'Breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  useEffect(() => {
    fetchMealHistory();
  }, []);

  const fetchMealHistory = async () => {
    try {
      setLoading(true);
      const history = await api.getHistory();
      
      if (history.history && history.history.length > 0) {
        const meals = history.history.map(meal => ({
          id: meal.id,
          name: meal.predicted_food.replace(/_/g, ' ').toUpperCase(),
          calories: Math.round(meal.estimated_calories),
          protein: meal.protein_per_100g,
          carbs: meal.carbs_per_100g,
          fats: meal.fat_per_100g,
          date: new Date(meal.created_at),
          dateStr: new Date(meal.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          time: new Date(meal.created_at).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          category: getMealCategory(new Date(meal.created_at).getHours()),
          isToday: new Date(meal.created_at).toDateString() === new Date().toDateString(),
          isYesterday: new Date(meal.created_at).toDateString() === new Date(Date.now() - 86400000).toDateString()
        }));
        setMealHistory(meals);
        setDailyTotals(history.daily_totals || { calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch meal history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMealCategory = (hour) => {
    if (hour < 11) return 'Breakfast';
    if (hour < 15) return 'Lunch';
    if (hour < 18) return 'Snack';
    return 'Dinner';
  };

  const handleAddMealSubmit = async (e) => {
    e.preventDefault();
    if (!newMeal.name || !newMeal.calories) return;

    const mealData = {
      foodItems: newMeal.name,
      calories: parseInt(newMeal.calories),
      macros: {
        carbs: parseInt(newMeal.carbs) || 0,
        protein: parseInt(newMeal.protein) || 0,
        fat: parseInt(newMeal.fats) || 0,
      }
    };

    await onAddMeal(mealData);
    await fetchMealHistory();

    setNewMeal({
      name: '',
      category: 'Breakfast',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
    });
    setShowAddModal(false);
  };

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await api.deleteAnalysis(mealId);
        await fetchMealHistory();
      } catch (error) {
        console.error('Failed to delete meal:', error);
      }
    }
  };

  // Filter meals based on selected filter
  const getFilteredMeals = () => {
    let filtered = [...mealHistory];
    
    if (searchQuery) {
      filtered = filtered.filter(meal =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filter === 'today') {
      filtered = filtered.filter(meal => meal.isToday);
    } else if (filter === 'yesterday') {
      filtered = filtered.filter(meal => meal.isYesterday);
    } else if (filter === 'older') {
      filtered = filtered.filter(meal => !meal.isToday && !meal.isYesterday);
    }
    
    return filtered;
  };

  const filteredMeals = getFilteredMeals();
  const totalCals = dailyTotals.calories || 0;
  const targetCals = metrics?.dailyCalorieTarget || 2000;
  const remainingCals = Math.max(targetCals - totalCals, 0);
  const compliancePercent = targetCals > 0 ? Math.min(100, Math.round((totalCals / targetCals) * 100)) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Intake <span className="text-indigo-600">History Journal</span>
        </h1>
        <p className="text-slate-500 mt-1 font-medium">
          Track your daily meals, monitor calorie intake, and achieve your dietary goals.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-2">
        {['all', 'today', 'yesterday', 'older'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
              filter === filterOption
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search meals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Meals List */}
      <div className="space-y-3">
        {filteredMeals.length > 0 ? (
          filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-slate-800 text-base">{meal.name}</h3>
                    <span className="text-[9px] font-extrabold tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase">
                      {meal.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {meal.dateStr} • {meal.time}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right min-w-17.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Calories</p>
                    <p className="font-extrabold text-slate-800 text-base">{meal.calories} <span className="text-[10px] font-normal text-slate-400">kcal</span></p>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="bg-slate-50 px-2 py-1 rounded-lg text-center min-w-11.25">
                      <p className="text-[8px] font-bold text-slate-400 uppercase">P</p>
                      <p className="font-bold text-slate-700 text-xs">{meal.protein}g</p>
                    </div>
                    <div className="bg-slate-50 px-2 py-1 rounded-lg text-center min-w-11.25">
                      <p className="text-[8px] font-bold text-slate-400 uppercase">C</p>
                      <p className="font-bold text-slate-700 text-xs">{meal.carbs}g</p>
                    </div>
                    <div className="bg-slate-50 px-2 py-1 rounded-lg text-center min-w-11.25">
                      <p className="text-[8px] font-bold text-slate-400 uppercase">F</p>
                      <p className="font-bold text-slate-700 text-xs">{meal.fats}g</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
            {mealHistory.length === 0 ? (
              <>
                <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No meals logged yet</p>
                <p className="text-xs text-slate-400 mt-1">Use the AI plate scanner to analyze your food!</p>
              </>
            ) : (
              <>
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No matching meals</p>
                <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Meal Button (Floating Action Button) */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all cursor-pointer z-50 group"
      >
        <Plus className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Add Manual Entry
        </span>
      </button>

      {/* Manual Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <form onSubmit={handleAddMealSubmit} className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full border border-slate-100 flex flex-col gap-4 relative animate-fade-up">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <h3 className="text-base font-bold text-slate-800">Manual Meal Entry</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Food Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grilled Chicken Salad"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Calories (kcal)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g., 350"
                  value={newMeal.calories}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, calories: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Meal Category</label>
                <select
                  value={newMeal.category}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Snack</option>
                  <option>Dinner</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <div className="space-y-1 text-center">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newMeal.protein}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, protein: e.target.value }))}
                    className="w-full bg-white border border-slate-200 text-center rounded-lg py-1 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1 text-center">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Carbs (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, carbs: e.target.value }))}
                    className="w-full bg-white border border-slate-200 text-center rounded-lg py-1 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1 text-center">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Fats (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newMeal.fats}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, fats: e.target.value }))}
                    className="w-full bg-white border border-slate-200 text-center rounded-lg py-1 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-100"
            >
              Save to Journal
            </button>
          </form>
        </div>
      )}
    </div>
  );
}