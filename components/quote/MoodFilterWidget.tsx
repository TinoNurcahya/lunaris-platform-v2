"use client";

import {Sparkles, Smile, CloudRain, Flame, Leaf, HeartOff, Heart, Compass} from "lucide-react";

export interface MoodConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  activeClass: string;
}

export const MOOD_OPTIONS: MoodConfig[] = [
  {
    id: "all",
    label: "Semua Mood",
    icon: Sparkles,
    badgeClass:
      "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    activeClass: "bg-indigo-600 text-white shadow-md shadow-indigo-600/30",
  },
  {
    id: "happy",
    label: "Senang",
    icon: Smile,
    badgeClass:
      "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    activeClass:
      "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30",
  },
  {
    id: "sad",
    label: "Galau & Sedih",
    icon: CloudRain,
    badgeClass:
      "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    activeClass: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30",
  },
  {
    id: "motivated",
    label: "Motivasi",
    icon: Flame,
    badgeClass:
      "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    activeClass: "bg-gradient-to-r from-rose-500 to-indigo-500 text-white shadow-md shadow-rose-500/30",
  },
  {
    id: "calm",
    label: "Tenang & Damai",
    icon: Leaf,
    badgeClass:
      "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    activeClass: "bg-gradient-to-r from-emerald-500 to-indigo-500 text-white shadow-md shadow-emerald-500/30",
  },
  {
    id: "heartbroken",
    label: "Patah Hati",
    icon: HeartOff,
    badgeClass:
      "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    activeClass: "bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-600/30",
  },
  {
    id: "romantic",
    label: "Romantis",
    icon: Heart,
    badgeClass:
      "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    activeClass: "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/30",
  },
];

interface MoodFilterWidgetProps {
  selectedMood: string;
  onSelectMood: (moodId: string) => void;
}

export default function MoodFilterWidget({selectedMood, onSelectMood}: MoodFilterWidgetProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 transition-all">
      {/* Header Widget */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bagaimana Perasaanmu Hari Ini?
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Saring kutipan sesuai suasana hatimu
            </p>
          </div>
        </div>

        {selectedMood !== "all" && (
          <button
            onClick={() => onSelectMood("all")}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
            Reset Filter
          </button>
        )}
      </div>

      {/* Mood Pills Options */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MOOD_OPTIONS.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;

          return (
            <button
              key={mood.id}
              onClick={() => onSelectMood(mood.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? `${mood.activeClass} border-transparent scale-[1.03]`
                  : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}>
              <Icon
                className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
              />
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
