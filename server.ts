import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-loaded Gemini AI client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Rule-based fallback generator in case Gemini API key is missing or fails
function getFallbackRecommendations(
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

  // Simple WMO weather code categorization
  // 0: Clear sky, 1-3: Mainly clear/partly cloudy/overcast, 45-48: Fog, 51-57: Drizzle, 61-67: Rain, 71-77: Snow, 80-82: Showers, 95-99: Thunderstorm
  const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);
  const isSnow = code >= 71 && code <= 77;
  const isFog = code === 45 || code === 48;

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

// REST API for intelligent weather recommendations using Gemini
app.post("/api/recommendations", async (req, res) => {
  const { city, country, temp, windspeed, weathercode, dailyMax, dailyMin, dailyWeatherCodes } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  const client = getAiClient();

  if (!client) {
    // If no API key, use fallback recommendations
    const fallback = getFallbackRecommendations(city, temp, windspeed, weathercode);
    return res.json(fallback);
  }

  try {
    const prompt = `Generate highly specific, contextual travel, clothing, and activity recommendations based on the current weather and 7-day outlook for ${city}, ${country || ""}.
    
    Current Conditions:
    - Temperature: ${temp}°C
    - Wind Speed: ${windspeed} km/h
    - Weather Code (WMO): ${weathercode}
    
    7-Day Forecast:
    - Daily Highs: ${dailyMax ? dailyMax.join(", ") : "N/A"}°C
    - Daily Lows: ${dailyMin ? dailyMin.join(", ") : "N/A"}°C
    - Weather Codes: ${dailyWeatherCodes ? dailyWeatherCodes.join(", ") : "N/A"}
    
    Please return a JSON response matching the required schema. Ensure recommendations are actionable, friendly, and practical.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an intelligent, friendly Weather Concierge. Analyze weather patterns and deliver expert, structured recommendations for clothing, travel plans, and outdoor activities. Always return valid JSON matching the specified type schema.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A friendly, cohesive summary of the current and upcoming weather.",
            },
            clothing: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of recommended clothing items and layered options for current and forecast conditions.",
            },
            travel: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of practical travel advisories (e.g., umbrella, road conditions, flight watchouts).",
            },
            activities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable activity suggestions tailored to this specific weather (indoor vs. outdoor).",
            },
            alert: {
              type: Type.STRING,
              description: "A short warning message if there is high wind, freezing temperatures, or heavy rain/storms. Otherwise empty.",
            },
          },
          required: ["summary", "clothing", "travel", "activities", "alert"],
        },
      },
    });

    const responseText = response.text;
    if (responseText) {
      const parsedData = JSON.parse(responseText.trim());
      return res.json({ ...parsedData, isFallback: false });
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini recommendations error, falling back:", error);
    const fallback = getFallbackRecommendations(city, temp, windspeed, weathercode);
    return res.json({ ...fallback, errorOccurred: true });
  }
});

// Configure Vite or Static Assets serving based on Node environment
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(path.join(process.cwd(), "dist/index.html"));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA catch-all
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
