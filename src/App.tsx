import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  CloudSun, 
  AlertCircle, 
  MapPin, 
  Loader2, 
  Info,
  HelpCircle,
  TrendingUp
} from "lucide-react";
import { 
  GeocodingResult, 
  WeatherData, 
  AIRecommendations, 
  RecentSearch 
} from "./types";
import { getWeatherDetails, getFallbackRecommendations } from "./utils/weatherUtils";
import { WeatherDetails } from "./components/WeatherDetails";
import { ForecastCard } from "./components/ForecastCard";
import { Recommendations } from "./components/Recommendations";
import { RecentSearches } from "./components/RecentSearches";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [isSearching, setIsSearching] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendations | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const suggestionRef = useRef<HTMLDivElement>(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load recent searches and initial default weather
  useEffect(() => {
    const saved = localStorage.getItem("weather_recent_searches");
    let parsedSaved: RecentSearch[] = [];
    if (saved) {
      try {
        parsedSaved = JSON.parse(saved);
        setRecentSearches(parsedSaved);
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }

    // Default to first recent search, or a default city (San Francisco)
    if (parsedSaved.length > 0) {
      fetchWeatherForLocation(
        parsedSaved[0].name,
        parsedSaved[0].country,
        parsedSaved[0].latitude,
        parsedSaved[0].longitude
      );
    } else {
      // Elegant default: San Francisco
      fetchWeatherForLocation("San Francisco", "United States", 37.7749, -122.4194);
    }
  }, []);

  // Fetch coordinates live or on enter
  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    setError(null);
    if (val.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setIsSearching(true);
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5`
      );
      if (!res.ok) throw new Error("Geocoding failed");
      const data = await res.json();
      if (data.results) {
        setSuggestions(data.results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Geocoding fetch error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setError(null);
    setIsSearching(true);

    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5`
      );
      if (!res.ok) throw new Error("Search service returned an error");
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const topResult = data.results[0];
        fetchWeatherForLocation(
          topResult.name,
          topResult.country,
          topResult.latitude,
          topResult.longitude
        );
        setShowSuggestions(false);
      } else {
        setError(`No locations matching "${searchQuery}" found. Please check spelling.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to search for location. Please check your network.");
    } finally {
      setIsSearching(false);
    }
  };

  const fetchWeatherForLocation = async (
    city: string,
    country: string,
    lat: number,
    lon: number
  ) => {
    setError(null);
    setIsWeatherLoading(true);
    setIsAiLoading(true);
    setSearchQuery(city);

    try {
      // 1. Fetch Forecast & Current Weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      );
      
      if (!weatherRes.ok) {
        throw new Error("Unable to retrieve weather forecast at this time.");
      }

      const weatherDataRaw = await weatherRes.json();
      
      const fullWeatherData: WeatherData = {
        city,
        country,
        latitude: lat,
        longitude: lon,
        current: weatherDataRaw.current_weather,
        daily: weatherDataRaw.daily,
        timezone: weatherDataRaw.timezone,
      };

      setWeatherData(fullWeatherData);
      setIsWeatherLoading(false);

      // Save to recent searches
      saveToRecent(city, country, lat, lon);

      // 2. Fetch Intelligent recommendations from Gemini Endpoint
      try {
        const aiRes = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city,
            country,
            temp: fullWeatherData.current.temperature,
            windspeed: fullWeatherData.current.windspeed,
            weathercode: fullWeatherData.current.weathercode,
            dailyMax: fullWeatherData.daily.temperature_2m_max,
            dailyMin: fullWeatherData.daily.temperature_2m_min,
            dailyWeatherCodes: fullWeatherData.daily.weathercode,
          }),
        });

        if (!aiRes.ok) {
          throw new Error("Failed to compile smart AI recommendations.");
        }

        const aiData = await aiRes.json();
        setRecommendations(aiData);
      } catch (aiErr: any) {
        console.warn("AI recommendation engine failed, falling back to local model:", aiErr);
        const fallback = getFallbackRecommendations(
          city,
          fullWeatherData.current.temperature,
          fullWeatherData.current.windspeed,
          fullWeatherData.current.weathercode
        );
        setRecommendations(fallback);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while fetching weather updates.");
    } finally {
      setIsWeatherLoading(false);
      setIsAiLoading(false);
    }
  };

  const saveToRecent = (name: string, country: string, latitude: number, longitude: number) => {
    const id = `${latitude.toFixed(2)}-${longitude.toFixed(2)}`;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      const updated = [
        { id, name, country, latitude, longitude },
        ...filtered,
      ].slice(0, 5); // Keep top 5
      localStorage.setItem("weather_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem("weather_recent_searches");
    setRecentSearches([]);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* MINIMALIST NAVIGATION HEADER */}
      <nav className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-10 flex-shrink-0 z-40 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-850 dark:text-slate-150">
            WeatherIQ
          </span>
        </div>

        {/* Dynamic Clean Search Bar */}
        <div className="relative w-72 sm:w-96" ref={suggestionRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search city (e.g. London, Tokyo)..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full py-2.5 pl-11 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium"
              />
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-slate-400" />
                )}
              </span>
              <button
                type="submit"
                className="absolute right-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-full cursor-pointer transition-all shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Autocomplete suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
              >
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      fetchWeatherForLocation(item.name, item.country, item.latitude, item.longitude);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {item.admin1 ? `${item.admin1}, ` : ""}{item.country}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live status / indicator badge on right */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Live Open-Meteo Sync</span>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-10 grid grid-cols-12 gap-8 items-start">
        {/* Left main content block */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          
          {/* SEARCH HISTORY / RECENT SEARCHES */}
          <RecentSearches
            searches={recentSearches}
            onSelect={(s) => fetchWeatherForLocation(s.name, s.country, s.latitude, s.longitude)}
            onClear={clearHistory}
          />

          {/* DYNAMIC ERROR BANNERS */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4.5 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-2xl text-red-700 dark:text-red-400 flex items-start gap-3 text-sm font-medium shadow-sm"
              id="error-notification"
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-grow">
                <span className="font-bold">Error:</span> {error}
              </div>
              <button 
                onClick={() => setError(null)} 
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {/* CURRENT WEATHER DATA */}
          {isWeatherLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 shadow-sm text-center flex flex-col items-center justify-center gap-4 min-h-[350px]">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-slate-400 font-medium text-sm">Retrieving real-time atmospheric updates...</p>
            </div>
          ) : (
            weatherData && <WeatherDetails data={weatherData} />
          )}

          {/* AI recommendations */}
          {recommendations && (
            <Recommendations 
              recommendations={recommendations} 
              isLoading={isAiLoading} 
            />
          )}
        </div>

        {/* Right side panel (7-Day Forecast) */}
        <div className="col-span-12 lg:col-span-4 h-full">
          {isWeatherLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-10 shadow-sm text-center flex flex-col items-center justify-center gap-4 min-h-[450px]">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-slate-400 font-medium text-sm">Formatting 7-day meteorological forecast...</p>
            </div>
          ) : (
            weatherData && <ForecastCard forecast={weatherData.daily} />
          )}
        </div>
      </main>

      {/* APP FOOTER */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium py-8 border-t border-slate-200/40 dark:border-slate-800/60 max-w-7xl mx-auto w-full px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p>© 2026 WeatherIQ. Meteorological readings provided via Open-Meteo services.</p>
        <p>Expert planning recommendations processed via Gemini-3.5-Flash.</p>
      </footer>
    </div>
  );
}
