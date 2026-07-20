import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  LucideIcon 
} from "lucide-react";

export interface WeatherCodeDetails {
  description: string;
  icon: LucideIcon;
  theme: {
    bgGradient: string; // Background for current weather card
    text: string;
    border: string;
    iconColor: string;
    bgApp: string; // App-wide container vibe
  };
}

export function getWeatherDetails(code: number, isDay: number = 1): WeatherCodeDetails {
  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  switch (code) {
    case 0:
      return {
        description: isDay ? "Sunny / Clear Sky" : "Clear Night",
        icon: Sun,
        theme: {
          bgGradient: "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/30",
          text: "text-amber-900 dark:text-amber-200",
          border: "border-amber-200/50 dark:border-amber-800/40",
          iconColor: "text-amber-500",
          bgApp: "from-amber-50 via-orange-50/30 to-slate-50",
        },
      };
    case 1:
    case 2:
      return {
        description: "Partly Cloudy",
        icon: CloudSun,
        theme: {
          bgGradient: "bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-950/30 dark:to-blue-950/20",
          text: "text-sky-950 dark:text-sky-200",
          border: "border-sky-200/50 dark:border-sky-800/40",
          iconColor: "text-sky-500",
          bgApp: "from-sky-50 via-indigo-50/20 to-slate-50",
        },
      };
    case 3:
      return {
        description: "Overcast",
        icon: Cloud,
        theme: {
          bgGradient: "bg-gradient-to-br from-slate-100 to-zinc-200 dark:from-slate-900/50 dark:to-zinc-900/40",
          text: "text-slate-900 dark:text-slate-200",
          border: "border-slate-300/40 dark:border-slate-800/40",
          iconColor: "text-slate-500",
          bgApp: "from-slate-100 via-zinc-100/30 to-slate-50",
        },
      };
    case 45:
    case 48:
      return {
        description: "Foggy",
        icon: CloudFog,
        theme: {
          bgGradient: "bg-gradient-to-br from-zinc-100 to-slate-200 dark:from-zinc-900/50 dark:to-slate-900/40",
          text: "text-zinc-800 dark:text-zinc-200",
          border: "border-zinc-200 dark:border-zinc-800/50",
          iconColor: "text-zinc-400",
          bgApp: "from-zinc-100 via-slate-100/30 to-zinc-50",
        },
      };
    case 51:
    case 53:
    case 55:
      return {
        description: "Light Drizzle",
        icon: CloudDrizzle,
        theme: {
          bgGradient: "bg-gradient-to-br from-teal-50 to-blue-100 dark:from-teal-950/30 dark:to-blue-950/20",
          text: "text-teal-900 dark:text-teal-200",
          border: "border-teal-200/50 dark:border-teal-800/40",
          iconColor: "text-teal-500",
          bgApp: "from-teal-50 via-slate-50 to-blue-50/20",
        },
      };
    case 56:
    case 57:
    case 66:
    case 67:
      return {
        description: "Freezing Drizzle/Rain",
        icon: CloudSnow,
        theme: {
          bgGradient: "bg-gradient-to-br from-cyan-50 to-slate-200 dark:from-cyan-950/30 dark:to-slate-900/40",
          text: "text-cyan-900 dark:text-cyan-200",
          border: "border-cyan-200/50 dark:border-cyan-800/40",
          iconColor: "text-cyan-500",
          bgApp: "from-cyan-50 via-blue-50/20 to-zinc-50",
        },
      };
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return {
        description: "Rainy",
        icon: CloudRain,
        theme: {
          bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/30",
          text: "text-blue-950 dark:text-blue-200",
          border: "border-blue-200/50 dark:border-blue-800/40",
          iconColor: "text-blue-500",
          bgApp: "from-blue-50 via-indigo-50/20 to-slate-50",
        },
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        description: "Snowy",
        icon: CloudSnow,
        theme: {
          bgGradient: "bg-gradient-to-br from-sky-50 to-cyan-100 dark:from-sky-950/30 dark:to-cyan-950/20",
          text: "text-sky-950 dark:text-sky-200",
          border: "border-sky-200/50 dark:border-sky-800/40",
          iconColor: "text-sky-400",
          bgApp: "from-sky-50 via-cyan-50/30 to-slate-50",
        },
      };
    case 95:
    case 96:
    case 99:
      return {
        description: "Thunderstorm",
        icon: CloudLightning,
        theme: {
          bgGradient: "bg-gradient-to-br from-violet-50 to-fuchsia-100 dark:from-violet-950/40 dark:to-fuchsia-950/30",
          text: "text-violet-950 dark:text-violet-200",
          border: "border-violet-200/50 dark:border-violet-800/40",
          iconColor: "text-violet-600",
          bgApp: "from-violet-50 via-slate-50 to-indigo-50/30",
        },
      };
    default:
      return {
        description: "Unknown Weather",
        icon: Cloud,
        theme: {
          bgGradient: "bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-slate-900/50 dark:to-zinc-900/40",
          text: "text-slate-800 dark:text-slate-200",
          border: "border-slate-200 dark:border-slate-800/50",
          iconColor: "text-slate-500",
          bgApp: "from-slate-100 to-zinc-50",
        },
      };
  }
}
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatDayName(dateStr: string): string {
  const d = new Date(dateStr);
  // Compare to today
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return "Today";
  }
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

export function getFallbackRecommendations(
  city: string,
  temp: number,
  wind: number,
  code: number
) {
  const clothing: string[] = [];
  const travel: string[] = [];
  const activities: string[] = [];
  let summary = `Currently ${temp}°C in ${city} with wind speed ${wind} km/h.`;
  let alert = "";

  const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);
  const isSnow = code >= 71 && code <= 77;

  if (temp < 10) {
    clothing.push("Wear a heavy winter coat, gloves, and a scarf.", "Layer up with thermal wear.");
    activities.push("Great day for indoor attractions like museums or cozy cafes.", "Enjoy hot beverages indoors.");
    summary += " It is quite cold outside.";
  } else if (temp < 20) {
    clothing.push("A light jacket, sweater, or hoodie is recommended.", "Comfortable pants or jeans.");
    activities.push("Good weather for walking tours or light outdoor sightseeing.", "Parks and outdoor walking are enjoyable.");
    summary += " The temperature is cool and pleasant.";
  } else {
    clothing.push("Shorts, t-shirts, and breathable clothing.", "Sunglasses and sunscreen are essential.");
    activities.push("Perfect for outdoor sports, beach visits, or patio dining.", "Great for hiking and general outdoor sightseeing.");
    summary += " It is warm and sunny.";
  }

  if (isRain) {
    clothing.push("Bring a sturdy umbrella or a waterproof raincoat.", "Waterproof footwear is recommended.");
    travel.push("Expect wet roads; drive cautiously and carry umbrella.", "Allow extra commute time due to rain.");
    activities.push("Stick to indoor activities or undercover venues today.");
    summary += " Expect some rainfall.";
  } else if (isSnow) {
    clothing.push("Wear insulated waterproof snow boots.", "Wear a warm winter cap.");
    travel.push("Be alert for icy roads and reduced visibility.", "Check public transport schedules for weather delays.");
    activities.push("Perfect day for building a snowman or ice skating!", "Cozy up indoors by the fire.");
    summary += " There is snow on the ground.";
  } else {
    travel.push("Clear conditions; great day for traveling and exploration.");
  }

  if (wind > 25) {
    clothing.push("Wear a wind-resistant jacket or windbreaker.");
    travel.push("High winds might affect high-profile vehicles. Keep both hands on the wheel.");
    alert = "Breezy/Windy conditions detected. Secure loose items.";
  }

  return {
    summary: summary.trim(),
    clothing,
    travel,
    activities,
    alert,
    isFallback: true,
  };
}
