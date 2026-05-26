import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, colorClass = "indigo", percentage }) {
  // Color presets mapping
  const colorMap = {
    indigo: {
      bg: "bg-indigo-50/50 border-indigo-100/50 text-indigo-600",
      pill: "bg-indigo-50 text-indigo-700 border-indigo-100",
      accent: "rgba(99,102,241,0.08)"
    },
    emerald: {
      bg: "bg-emerald-50/50 border-emerald-100/50 text-emerald-600",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
      accent: "rgba(16,185,129,0.08)"
    },
    amber: {
      bg: "bg-amber-50/50 border-amber-100/50 text-amber-600",
      pill: "bg-amber-50 text-amber-700 border-amber-100",
      accent: "rgba(245,158,11,0.08)"
    },
    rose: {
      bg: "bg-rose-50/50 border-rose-100/50 text-rose-600",
      pill: "bg-rose-50 text-rose-700 border-rose-100",
      accent: "rgba(225,29,72,0.08)"
    }
  };

  const scheme = colorMap[colorClass] || colorMap.indigo;

  return (
    <div
      className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-300 flex items-start justify-between relative overflow-hidden group"
      style={{ '--shadow-color': scheme.accent }}
    >
      {/* Dynamic Background Hover Glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full transition-transform duration-500 group-hover:scale-150" style={{ backgroundColor: scheme.accent }} />

      <div className="space-y-3 relative z-10">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-800 tracking-tight">{value}</span>
          {percentage && (
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${scheme.pill} border`}>
              {percentage}
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-400 leading-tight">{subtext}</p>
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${scheme.bg} relative z-10`}>
        <Icon className="w-5 h-5 stroke-[2.2]" />
      </div>
    </div>
  );
}