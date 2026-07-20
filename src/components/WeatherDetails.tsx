import React from "react";
import { Wind, Navigation, Compass, ArrowUpRight } from "lucide-react";
import { WeatherData } from "../types";
import { getWeatherDetails, formatDate } from "../utils/weatherUtils";
import { motion } from "motion/react";

interface WeatherDetailsProps {
  data: WeatherData;
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({ data }) => {
  const details = getWeatherDetails(data.current.weathercode, data.current.is_day);
  const Icon = details.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
      id="clean-weather-details"
    >
      {/* Premium minimal header layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="space-y-1.5">
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 dark:text-slate-100 tracking-tight">
            {data.city}
            <span className="text-lg font-normal text-slate-400 dark:text-slate-500 ml-2.5">
              {data.country}
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase text-xs flex items-center gap-2">
            <span>{formatDate(data.current.time)}</span>
            <span>&bull;</span>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
              {data.timezone}
            </span>
          </p>
        </div>

        {/* Temperature Block */}
        <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-4 sm:gap-0">
          <div className="text-6xl md:text-7xl font-light text-indigo-600 dark:text-indigo-400 tracking-tighter flex items-start">
            <span>{Math.round(data.current.temperature)}</span>
            <span className="text-3xl font-normal mt-1 md:mt-2">°</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`p-1 rounded-lg ${details.theme.iconColor}`}>
              <Icon className="h-5 w-5 stroke-[2]" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
              {details.description}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 3 key clean cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="weather-attributes-grid">
        {/* Wind Speed Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5 text-slate-400" />
            <span>Wind Speed</span>
          </p>
          <div className="flex items-end gap-1.5">
            <span className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              {data.current.windspeed}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-medium mb-1">
              km/h
            </span>
          </div>
        </div>

        {/* Wind Direction Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-slate-400" />
            <span>Wind Direction</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              {data.current.winddirection}°
            </span>
            <ArrowUpRight 
              className="h-5 w-5 text-indigo-500 opacity-75 shrink-0 transition-transform" 
              style={{ transform: `rotate(${data.current.winddirection - 45}deg)` }} 
            />
          </div>
        </div>

        {/* Coordinates Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-slate-400" />
            <span>Coordinates</span>
          </p>
          <div className="text-xs font-mono text-slate-600 dark:text-slate-350 space-y-0.5 leading-snug">
            <div>Lat: {data.latitude.toFixed(4)}°</div>
            <div>Lon: {data.longitude.toFixed(4)}°</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
