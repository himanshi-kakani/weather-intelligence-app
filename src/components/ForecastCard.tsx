import React from "react";
import { DailyForecast } from "../types";
import { getWeatherDetails, formatDayName } from "../utils/weatherUtils";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";

interface ForecastCardProps {
  forecast: DailyForecast;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  const forecastDays = forecast.time.map((time, index) => {
    return {
      dateStr: time,
      maxTemp: forecast.temperature_2m_max[index],
      minTemp: forecast.temperature_2m_min[index],
      weatherCode: forecast.weathercode[index],
    };
  });

  return (
    <motion.aside
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-6 md:p-8 flex flex-col shadow-xl shadow-slate-200/40 dark:shadow-none h-full"
      id="forecast-sidebar"
    >
      {/* Sidebar Header */}
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2.5 text-slate-800 dark:text-slate-100 tracking-tight">
        <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        <span>7-Day Forecast</span>
      </h2>

      {/* Forecast list */}
      <div className="flex-1 space-y-2">
        {forecastDays.map((day, i) => {
          const weather = getWeatherDetails(day.weatherCode);
          const WeatherIcon = weather.icon;
          const dayName = formatDayName(day.dateStr).slice(0, 3); // Minimal format: "Wed"

          return (
            <div
              key={day.dateStr}
              className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              id={`forecast-row-${day.dateStr}`}
            >
              <span className="w-12 font-semibold text-slate-600 dark:text-slate-350 text-sm">
                {dayName}
              </span>

              {/* Icon and tiny label */}
              <div className="flex items-center gap-2.5 flex-1 justify-start pl-4">
                <WeatherIcon className={`w-5 h-5 shrink-0 ${weather.theme.iconColor}`} />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline truncate max-w-[100px]">
                  {weather.description}
                </span>
              </div>

              {/* Temperatures */}
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {Math.round(day.maxTemp)}° 
                <span className="text-slate-350 dark:text-slate-500 font-medium ml-2">
                  {Math.round(day.minTemp)}°
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Live sync footer status */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span>Live Open-Meteo Sync</span>
      </div>
    </motion.aside>
  );
};
