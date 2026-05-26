import React from 'react';
import { Home, History, UserCheck, LogOut, UtensilsCrossed, LineChart } from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, onLogout, userName, userRole }) {
  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'history', label: 'History', icon: History },
      { id: 'profile', label: 'Profile', icon: UserCheck },
    ];
    
    // Add analytics for all users (optional)
    // baseItems.push({ id: 'analytics', label: 'Analytics', icon: LineChart });
    
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <aside className="w-20 h-[121.6vh] bg-white/80 backdrop-blur-sm border-r border-slate-100 flex flex-col justify-between items-center py-6 shrink-0 shadow-sm">
      {/* Logo / Brand */}
      <div className="flex flex-col items-center gap-10 w-full">
        <div className="group relative">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-200 hover:scale-105 transition-transform duration-200 cursor-pointer">
            <span>NF</span>
          </div>
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            NutriFlow
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col items-center gap-4 w-full">
          {navItems.map((item) => {
            const isSelected = activePage === item.id;
            const Icon = item.icon;
            return (
              <div key={item.id} className="w-full flex items-center relative group">
                {/* Active indicator bar */}
                <div 
                  className={`absolute left-0 w-1 h-8 bg-linear-to-b from-indigo-500 to-indigo-600 rounded-r-md transition-all duration-300 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                  }`} 
                />
                
                {/* Tooltip */}
                <span className="absolute left-24 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </span>

                {/* Nav Button */}
                <button
                  onClick={() => setActivePage(item.id)}
                  className={`mx-auto p-3.5 rounded-xl transition-all duration-300 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-linear-to-br from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Avatar & Logout */}
      <div className="flex flex-col items-center gap-4">
        {/* User Avatar */}
        <div className="group relative">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-inner">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="absolute left-10 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {userName || 'User'}
          </span>
        </div>

        {/* Logout Button */}
        <div className="group relative">
          <button
            onClick={onLogout}
            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <span className="absolute left-10 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            Sign Out
          </span>
        </div>
      </div>
    </aside>
  );
}