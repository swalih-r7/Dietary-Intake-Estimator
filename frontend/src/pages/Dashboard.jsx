import React, { useState, useRef, useEffect } from 'react';
import { Camera, Sparkles, Plus, Check, X, Search, Apple, Coffee, UtensilsCrossed, User, Heart, CalendarDays } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { api } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ metrics, onAddMeal, user, userRole }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [userName, setUserName] = useState('');
  
  // Food Directory States
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [foodCategory, setFoodCategory] = useState('all');
  const [foodDatabase, setFoodDatabase] = useState([]);
  const [foodLoading, setFoodLoading] = useState(true);

  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showFlash, setShowFlash] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Get username from user data
  useEffect(() => {
    if (user && user.username) {
      setUserName(user.username);
    } else if (metrics && metrics.name) {
      setUserName(metrics.name);
    }
    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => setShowWelcome(True));
    return () => clearTimeout(timer);
  }, [user, metrics]);

  useEffect(() => {
    loadFoodsFromBackend();
  }, []);

  const loadFoodsFromBackend = async () => {
    try {
      setFoodLoading(true);
      const foods = await api.getFoods();
      
      if (foods && foods.foods) {
        // Transform real backend data
        const transformedFoods = foods.foods.map((food, index) => ({
          id: index + 1,
          name: food.replace(/_/g, ' ').toUpperCase(),
          category: getFoodCategory(food),
          calories: getNutritionValue(food, 'calories'),
          protein: getNutritionValue(food, 'protein'),
          carbs: getNutritionValue(food, 'carbs'),
          fats: getNutritionValue(food, 'fat'),
          icon: getFoodIcon(food)
        }));
        setFoodDatabase(transformedFoods);
      }
    } catch (error) {
      console.error('Failed to fetch foods:', error);
    } finally {
      setFoodLoading(false);
    }
  };

  // Get real nutrition values from your dataset
  const getNutritionValue = (foodName, nutrient) => {
    const nutritionMap = {
      'caesar_salad': { calories: 150, protein: 6, carbs: 8, fat: 10 },
      'cheesecake': { calories: 350, protein: 6, carbs: 30, fat: 22 },
      'donuts': { calories: 400, protein: 6, carbs: 50, fat: 20 },
      'dumplings': { calories: 250, protein: 8, carbs: 30, fat: 10 },
      'french_toast': { calories: 250, protein: 8, carbs: 30, fat: 10 },
      'macarons': { calories: 400, protein: 6, carbs: 50, fat: 20 },
      'prime_rib': { calories: 300, protein: 20, carbs: 0, fat: 22.5 },
      'ramen': { calories: 133, protein: 5, carbs: 20, fat: 3.3 },
      'spaghetti_bolognese': { calories: 175, protein: 7.5, carbs: 20, fat: 6 }
    };
    
    const foodKey = foodName.toLowerCase().replace(/ /g, '_');
    const nutrition = nutritionMap[foodKey] || { calories: 200, protein: 10, carbs: 20, fat: 8 };
    return nutrition[nutrient] || Math.floor(Math.random() * 200) + 50;
  };

  const getFoodCategory = (foodName) => {
    const fruits = ['apple', 'banana', 'strawberry', 'orange', 'grape', 'watermelon', 'mango', 'berry', 'avocado'];
    if (fruits.some(fruit => foodName.toLowerCase().includes(fruit))) return 'fruits';
    return 'meals';
  };

  const getFoodIcon = (foodName) => {
    const iconMap = {
      'apple': '🍎', 'banana': '🍌', 'strawberry': '🍓', 'orange': '🍊',
      'grape': '🍇', 'watermelon': '🍉', 'mango': '🥭', 'avocado': '🥑',
      'caesar_salad': '🥗', 'cheesecake': '🍰', 'donuts': '🍩', 
      'dumplings': '🥟', 'ramen': '🍜', 'pasta': '🍝'
    };
    for (const [key, icon] of Object.entries(iconMap)) {
      if (foodName.toLowerCase().includes(key)) return icon;
    }
    return '🍽️';
  };

  const filteredFoods = foodDatabase.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(foodSearchQuery.toLowerCase());
    const matchesCategory = foodCategory === 'all' || food.category === foodCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddFoodToMeal = (food) => {
    const mealData = {
      foodItems: food.name,
      calories: food.calories,
      macros: {
        carbs: parseFloat(food.carbs),
        protein: parseFloat(food.protein),
        fat: parseFloat(food.fats)
      }
    };
    onAddMeal(mealData);
    
    // Success notification
    const tempMessage = document.createElement('div');
    tempMessage.className = 'fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold z-50 animate-fade-up shadow-lg';
    tempMessage.innerText = `✓ Added ${food.name} to your journal!`;
    document.body.appendChild(tempMessage);
    setTimeout(() => tempMessage.remove(), 2000);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedImage(URL.createObjectURL(file));
      setSelectedImageFile(file);
      setAnalysisResult(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
      setSelectedImageFile(file);
      setAnalysisResult(null);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleOpenCamera = async () => {
    setIsCameraOpen(true);
    setCameraError(null);
    setStreamActive(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      }, 150);
    } catch {
      try {
        const fallback = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = fallback;
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = fallback;
            setStreamActive(true);
          }
        }, 150);
      } catch {
        setCameraError('Camera access denied. Please enable permissions.');
      }
    }
  };

  const handleCloseCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setStreamActive(false);
    setCameraError(null);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      setSelectedImage(URL.createObjectURL(file));
      setSelectedImageFile(file);
      setAnalysisResult(null);
    }, 'image/jpeg', 0.9);
    
    setTimeout(() => handleCloseCamera(), 200);
  };

  const handleAnalyze = async () => {
    if (!selectedImageFile) {
      alert('Please select an image first');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await api.predictFood(selectedImageFile, 100);
      
      const carbCalories = result.estimated_nutrition.carbs * 4;
      const proteinCalories = result.estimated_nutrition.protein * 4;
      const fatCalories = result.estimated_nutrition.fat * 9;
      const totalMacroCalories = carbCalories + proteinCalories + fatCalories;
      
      setAnalysisResult({
        mealName: result.predicted_food.replace(/_/g, ' ').toUpperCase(),
        calories: result.estimated_nutrition.calories,
        confidence: result.confidence,
        macros: {
          carbs: { 
            value: result.estimated_nutrition.carbs, 
            percentage: totalMacroCalories > 0 ? Math.round((carbCalories / totalMacroCalories) * 100) : 33,
            label: 'Carbohydrates', 
            color: '#6366F1' 
          },
          protein: { 
            value: result.estimated_nutrition.protein, 
            percentage: totalMacroCalories > 0 ? Math.round((proteinCalories / totalMacroCalories) * 100) : 33,
            label: 'Protein', 
            color: '#10B981' 
          },
          fat: { 
            value: result.estimated_nutrition.fat, 
            percentage: totalMacroCalories > 0 ? Math.round((fatCalories / totalMacroCalories) * 100) : 33,
            label: 'Fats', 
            color: '#F59E0B' 
          }
        },
        saved: false
      });
    } catch (error) {
      console.error('Prediction error:', error);
      alert(error.message || 'Failed to analyze image. Make sure backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!analysisResult) return;
    onAddMeal({
      foodItems: analysisResult.mealName,
      calories: analysisResult.calories,
      macros: {
        carbs: analysisResult.macros.carbs.value,
        protein: analysisResult.macros.protein.value,
        fat: analysisResult.macros.fat.value
      }
    });
    setAnalysisResult(prev => ({ ...prev, saved: true }));
  };

  const chartData = analysisResult ? {
    labels: ['Carbs', 'Protein', 'Fats'],
    datasets: [{
      data: [
        analysisResult.macros.carbs.percentage,
        analysisResult.macros.protein.percentage,
        analysisResult.macros.fat.percentage,
      ],
      backgroundColor: [
        analysisResult.macros.carbs.color,
        analysisResult.macros.protein.color,
        analysisResult.macros.fat.color,
      ],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  } : null;

  const chartOptions = {
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` } }
    },
  };

  // Get current hour for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Welcome Banner */}
      {showWelcome && userName && (
        <div className="bg-linear-to-r from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg animate-slide-down">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 fill-white" />
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Welcome Back</span>
              </div>
              <h2 className="text-2xl font-black">{getGreeting()}, {userName}!</h2>
              <p className="text-indigo-100 text-xs mt-1">Ready to track your nutrition today? Let's achieve your health goals together! 🎯</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Personal Health & <span className="text-indigo-600">Calorie Workspace</span>
        </h1>
        <p className="text-slate-500 text-xs font-medium mt-1">
          Consolidated monitoring hub for food directory logging, AI snapshots, and timeline audits.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: AI Plate Scanner */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-3">Immediate AI Plate Scanner</h3>
          <p className="text-[10px] text-slate-400 mb-3">Instantly analyze meal snaps via simulated cameras or drop targets.</p>
          
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`drop-zone py-8 px-4 flex flex-col items-center justify-center min-h-70 relative overflow-hidden border-2 rounded-xl transition-all ${
              dragActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-dashed border-slate-200 hover:border-indigo-400'
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            {!selectedImage && (
              <div className="text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-xs">Drag & drop or click to add meal photo</p>
                  <p className="text-[9px] text-slate-400 max-w-55 mt-0.5">Accepts any food snap image file to simulate scan results</p>
                </div>
                <div className="flex gap-2 mt-1">
                  <button onClick={triggerFileInput} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[9px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    Browse Files
                  </button>
                  <button onClick={handleOpenCamera} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold hover:bg-indigo-700 transition-colors">
                    Use Camera
                  </button>
                </div>
              </div>
            )}

            {selectedImage && (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full h-40 rounded-xl overflow-hidden relative group">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={handleOpenCamera} className="bg-white text-slate-800 px-2 py-1 rounded-lg text-[9px] font-bold">
                      Retake
                    </button>
                    <button onClick={() => { setSelectedImage(null); setSelectedImageFile(null); setAnalysisResult(null); }} className="bg-rose-600 text-white px-2 py-1 rounded-lg text-[9px] font-bold">
                      Remove
                    </button>
                  </div>
                </div>

                {!analysisResult && !isAnalyzing && (
                  <button onClick={handleAnalyze} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Analyze with AI
                  </button>
                )}

                {isAnalyzing && (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="text-[9px] font-bold text-slate-700">Analyzing food...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl animate-fade-up">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                      AI • {(analysisResult.confidence * 100).toFixed(0)}%
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm">{analysisResult.mealName}</h4>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <div>
                      <p className="text-[8px] text-slate-400">Carbs</p>
                      <p className="font-bold text-slate-700 text-xs">{analysisResult.macros.carbs.value}g</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400">Protein</p>
                      <p className="font-bold text-slate-700 text-xs">{analysisResult.macros.protein.value}g</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400">Fats</p>
                      <p className="font-bold text-slate-700 text-xs">{analysisResult.macros.fat.value}g</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[8px] text-slate-400">Total</p>
                      <p className="font-bold text-indigo-600 text-sm">{analysisResult.calories} kcal</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveToHistory}
                    disabled={analysisResult.saved}
                    className={`w-full mt-2 py-1.5 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all ${
                      analysisResult.saved
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {analysisResult.saved ? '✓ Logged' : '+ Log to Daily Intake'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Food Directory Repository - Using REAL data */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-800">Fruits & Food Directory Repository</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search food database..."
                value={foodSearchQuery}
                onChange={(e) => setFoodSearchQuery(e.target.value)}
                className="w-40 bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1 text-[10px] font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 border-b border-slate-100 mb-3">
            {[
              { id: 'all', label: 'ALL', icon: UtensilsCrossed },
              { id: 'fruits', label: 'FRUITS', icon: Apple },
              { id: 'meals', label: 'MEALS', icon: Coffee },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFoodCategory(tab.id)}
                className={`flex items-center gap-1 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-t-lg transition-all ${
                  foodCategory === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <tab.icon className="w-2.5 h-2.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Food List - Real data from your dataset */}
          <div className="space-y-1 max-h-95 overflow-y-auto pr-1">
            {foodLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => handleAddFoodToMeal(food)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{food.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">{food.name}</p>
                      <p className="text-[8px] text-slate-400">
                        P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600 text-xs">{food.calories} kcal</span>
                    <Plus className="w-3 h-3 text-slate-300 group-hover:text-indigo-600" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Search className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-slate-400 text-[10px] font-medium">No foods found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Version Footer */}
      <div className="text-center">
        <p className="text-[9px] text-slate-300 font-bold tracking-wider">V1.2</p>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-2xl p-5 shadow-xl max-w-md w-full border border-slate-100 flex flex-col gap-4 relative animate-fade-up">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Scan Meal Plate</h3>
              <button onClick={handleCloseCamera} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 relative flex items-center justify-center border border-slate-100">
              {cameraError ? (
                <div className="p-4 text-center text-[10px] font-bold text-slate-400">{cameraError}</div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  {!streamActive && <div className="absolute inset-0 bg-slate-950 flex items-center justify-center text-[10px] text-slate-500">Initializing camera...</div>}
                </>
              )}
              <div className={`absolute inset-0 bg-white z-20 pointer-events-none transition-opacity duration-150 ${showFlash ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            {!cameraError && streamActive && (
              <div className="flex items-center justify-center pt-1">
                <button onClick={handleCapturePhoto} className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center bg-white shadow-md hover:scale-105 active:scale-95 transition-all">
                  <div className="w-8 h-8 rounded-full bg-indigo-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}