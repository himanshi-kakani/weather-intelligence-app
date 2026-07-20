export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // region/state
  country_code?: string;
}

export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
  time: string;
}

export interface DailyForecast {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  daily: DailyForecast;
  timezone: string;
}

export interface AIRecommendations {
  summary: string;
  clothing: string[];
  travel: string[];
  activities: string[];
  alert: string;
  isFallback: boolean;
  errorOccurred?: boolean;
}

export interface RecentSearch {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}
