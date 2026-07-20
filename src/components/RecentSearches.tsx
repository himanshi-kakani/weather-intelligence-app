import React from "react";
import { RecentSearch } from "../types";
import { History, Trash2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSelect: (search: RecentSearch) => void;
  onClear: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSelect,
  onClear,
}) => {
  if (searches.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-50 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <History className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Search History
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-[10px] font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer uppercase tracking-wider"
          title="Clear search history"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {searches.map((search) => (
            <motion.button
              key={search.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => onSelect(search)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer font-medium"
            >
              <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-500" />
              <span>{search.name}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal px-1 rounded bg-slate-200/50 dark:bg-slate-800">
                {search.country}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
