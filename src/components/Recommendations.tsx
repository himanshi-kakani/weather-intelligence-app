import React from "react";
import { AIRecommendations } from "../types";
import { 
  Sparkles, 
  Shirt, 
  Compass, 
  Activity, 
  AlertTriangle,
  Zap,
  Cpu
} from "lucide-react";
import { motion } from "motion/react";

interface RecommendationsProps {
  recommendations: AIRecommendations;
  isLoading: boolean;
}

export const Recommendations: React.FC<RecommendationsProps> = ({ 
  recommendations, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white/90 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-8 animate-pulse shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-24" />
        </div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
          <div className="h-32 bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
          <div className="h-32 bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { summary, clothing, travel, activities, alert, isFallback } = recommendations;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-blue-50 border border-blue-100 dark:bg-indigo-950/15 dark:border-indigo-900/20 rounded-[32px] p-6 md:p-8 flex flex-col gap-6 shadow-sm"
      id="clean-recommendations"
    >
      {/* Header section with AI badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/40 dark:border-indigo-900/30 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-5 w-5 stroke-[2]" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight">
            AI Travel & Clothing Planner
          </h3>
        </div>

        {/* AI Engine indicator badge */}
        <span 
          className={`self-start sm:self-auto text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 border ${
            isFallback 
              ? "bg-amber-100/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/40"
              : "bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 border-indigo-200/40"
          }`}
        >
          {isFallback ? (
            <>
              <Cpu className="h-3.5 w-3.5" />
              <span>Deterministic Mode</span>
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5" />
              <span>Gemini Smart Assistant</span>
            </>
          )}
        </span>
      </div>

      {/* Critical alerts */}
      {alert && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 text-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
          <div>
            <span className="font-bold">Active Warning: </span>
            {alert}
          </div>
        </div>
      )}

      {/* Structured weather summaries */}
      <p className="text-slate-700 dark:text-slate-350 leading-relaxed text-sm md:text-base font-medium">
        {summary}
      </p>

      {/* 3 Categories block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
        {/* Clothing guide */}
        <div className="bg-white/60 dark:bg-slate-900/40 border border-blue-200/20 dark:border-indigo-900/10 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm mb-3">
            <Shirt className="h-4.5 w-4.5" />
            <span>Clothing Guide</span>
          </div>
          <ul className="space-y-2">
            {clothing.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed font-medium">
                <span className="text-indigo-500 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Travel Guide */}
        <div className="bg-white/60 dark:bg-slate-900/40 border border-blue-200/20 dark:border-indigo-900/10 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm mb-3">
            <Compass className="h-4.5 w-4.5" />
            <span>Travel Advisory</span>
          </div>
          <ul className="space-y-2">
            {travel.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed font-medium">
                <span className="text-indigo-500 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Activities list */}
        <div className="bg-white/60 dark:bg-slate-900/40 border border-blue-200/20 dark:border-indigo-900/10 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm mb-3">
            <Activity className="h-4.5 w-4.5" />
            <span>Activity Guide</span>
          </div>
          <ul className="space-y-2">
            {activities.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed font-medium">
                <span className="text-indigo-500 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
