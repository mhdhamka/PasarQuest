import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

interface WeatherResponse {
  condition: string;
  conditionCategory: 'clear' | 'cloudy' | 'rain' | 'thunderstorm' | 'drizzle' | 'haze';
  temperature: string;
  tempNumeric: number;
  rainChance: string;
  humidity: string;
  wind: string;
  precipitation?: string;
  forecastSummary: string;
  marketVisitTip: string;
  lastUpdated: string;
  isGoogleSearchGrounded: boolean;
  groundingSources: { title: string; uri: string }[];
  searchQuery?: string;
}

function mapWmoToWeather(code: number, tempC: number, precipMm: number): {
  condition: string;
  conditionCategory: 'clear' | 'cloudy' | 'rain' | 'thunderstorm' | 'drizzle' | 'haze';
  summary: string;
  tip: string;
} {
  if (code === 0) {
    return {
      condition: 'Clear Sky',
      conditionCategory: 'clear',
      summary: 'Clear skies and warm tropical evening conditions.',
      tip: 'Great clear weather for stall hopping! Light breathable cotton clothing is recommended.',
    };
  }
  if (code === 1 || code === 2) {
    return {
      condition: 'Partly Cloudy',
      conditionCategory: 'cloudy',
      summary: 'Scattered clouds with comfortable evening breeze.',
      tip: 'Pleasant evening with good cloud cover. Ideal weather for walking between food stalls and dining outdoors.',
    };
  }
  if (code === 3) {
    return {
      condition: 'Overcast',
      conditionCategory: 'cloudy',
      summary: 'Heavy cloud cover with mild temperatures.',
      tip: 'Overcast evening keeps the temperature cool. Keep a compact umbrella handy just in case of brief drizzle.',
    };
  }
  if (code === 45 || code === 48) {
    return {
      condition: 'Haze / Mist',
      conditionCategory: 'haze',
      summary: 'Hazy conditions with reduced visibility.',
      tip: 'Moderate outdoor conditions. Stay well hydrated with fresh coconut water or sugar cane juice from the vendors.',
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      condition: 'Passing Drizzle',
      conditionCategory: 'drizzle',
      summary: 'Occasional light drizzle or mist in the area.',
      tip: 'Passing light showers. Most pasar malam stalls have canopy awnings, but bringing a small umbrella is recommended.',
    };
  }
  if (code >= 61 && code <= 67 || (code >= 80 && code <= 82)) {
    return {
      condition: 'Tropical Rain Showers',
      conditionCategory: 'rain',
      summary: `Wet weather active (${precipMm > 0 ? precipMm + ' mm' : 'intermittent showers'}).`,
      tip: 'Rain showers in the area. Stall paths might be wet and slick — wear non-slip shoes and carry a rain umbrella.',
    };
  }
  if (code >= 95) {
    return {
      condition: 'Thunderstorm',
      conditionCategory: 'thunderstorm',
      summary: 'Tropical thunderstorm and lightning active nearby.',
      tip: 'Thunderstorm alert. Vendors may delay setting up tarps or close early; wait until heavy rain subsides before visiting.',
    };
  }

  return {
    condition: tempC > 30 ? 'Warm & Humid' : 'Fair',
    conditionCategory: 'cloudy',
    summary: 'Typical Malaysian tropical evening conditions.',
    tip: 'Wear comfortable walking shoes and enjoy the freshly prepared street food.',
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Weather forecast endpoint using Google Search tool via Gemini
  app.post('/api/weather', async (req, res) => {
    const { marketName, district, state, latitude, longitude } = req.body || {};

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const locName = marketName || 'Pasar Malam';
    const locDesc = [district, state, 'Malaysia'].filter(Boolean).join(', ');
    const lat = Number(latitude);
    const lng = Number(longitude);

    // 1. Attempt Google Search grounded query via Gemini
    const ai = getGenAI();
    if (ai) {
      try {
        const searchQuery = `Current weather forecast tonight for ${locName} ${district || ''} ${state || ''} Malaysia`;
        const prompt = `Search live Google Search for the current real-time weather and tonight evening forecast for:
Market: ${locName}
Location: ${locDesc} (Coordinates: ${lat}, ${lng})

Focus on current conditions and the evening hours (5:00 PM to 10:30 PM) when the Malaysian outdoor night market (pasar malam) is open.
Look up:
- Real-time temperature (°C)
- Current condition (e.g. Clear, Partly Cloudy, Cloudy, Rain Showers, Thunderstorms, Haze)
- Chance of precipitation / rain in the evening
- Relative humidity (%)
- Wind speed
- A practical, helpful advice tip specifically for visitors planning to visit this outdoor night market today under these weather conditions.

Return a strictly valid JSON object:
{
  "condition": "Short condition name",
  "conditionCategory": "clear" | "cloudy" | "rain" | "thunderstorm" | "drizzle" | "haze",
  "temperature": "e.g. 29°C",
  "tempNumeric": 29,
  "rainChance": "e.g. 25%",
  "humidity": "e.g. 78%",
  "wind": "e.g. 10 km/h",
  "forecastSummary": "1-2 sentences on what visitors should expect weather-wise at this market tonight",
  "marketVisitTip": "Actionable advice for visiting this outdoor pasar malam today (clothing, umbrella, walking comfort)"
}
Output only the JSON block without other text.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          },
        });

        const rawText = response.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);

          // Extract grounding sources from Google Search
          const groundingChunks =
            response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          const groundingSources: { title: string; uri: string }[] = [];

          if (Array.isArray(groundingChunks)) {
            for (const chunk of groundingChunks) {
              if (chunk.web?.uri) {
                groundingSources.push({
                  title: chunk.web.title || new URL(chunk.web.uri).hostname,
                  uri: chunk.web.uri,
                });
              }
            }
          }

          const result: WeatherResponse = {
            condition: parsed.condition || 'Partly Cloudy',
            conditionCategory: parsed.conditionCategory || 'cloudy',
            temperature: parsed.temperature || `${parsed.tempNumeric || 29}°C`,
            tempNumeric: typeof parsed.tempNumeric === 'number' ? parsed.tempNumeric : 29,
            rainChance: parsed.rainChance || '20%',
            humidity: parsed.humidity || '75%',
            wind: parsed.wind || '10 km/h',
            forecastSummary:
              parsed.forecastSummary ||
              `Current evening weather around ${locName} is pleasant for outdoor dining.`,
            marketVisitTip:
              parsed.marketVisitTip ||
              'Standard night market gear: comfortable shoes and casual wear.',
            lastUpdated: new Date().toLocaleTimeString('en-MY', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isGoogleSearchGrounded: true,
            groundingSources: groundingSources.slice(0, 4),
            searchQuery,
          };

          return res.json(result);
        }
      } catch (geminiError: any) {
        console.warn(
          'Gemini Google Search query failed (temporary quota or service limit), falling back to coordinate weather:',
          geminiError?.message || geminiError
        );
      }
    }

    // 2. High-precision coordinate weather fallback using Open-Meteo
    try {
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&hourly=precipitation_probability&forecast_days=1&timezone=Asia%2FKuala_Lumpur`;
      const meteoRes = await fetch(meteoUrl);
      if (meteoRes.ok) {
        const data = await meteoRes.json();
        const cur = data.current;
        const temp = cur?.temperature_2m ?? 29;
        const humidity = cur?.relative_humidity_2m ?? 75;
        const windSpeed = cur?.wind_speed_10m ?? 8;
        const weatherCode = cur?.weather_code ?? 1;
        const precip = cur?.precipitation ?? 0;

        // Current or peak evening precipitation probability
        const hourlyProb = data.hourly?.precipitation_probability;
        const curHour = new Date().getHours();
        const eveningProb = Array.isArray(hourlyProb)
          ? Math.max(...hourlyProb.slice(Math.max(0, curHour), Math.min(23, curHour + 5)))
          : (precip > 0 ? 80 : 20);

        const mapped = mapWmoToWeather(weatherCode, temp, precip);

        const result: WeatherResponse = {
          condition: mapped.condition,
          conditionCategory: mapped.conditionCategory,
          temperature: `${Math.round(temp)}°C`,
          tempNumeric: Math.round(temp),
          rainChance: `${eveningProb}%`,
          humidity: `${Math.round(humidity)}%`,
          wind: `${Math.round(windSpeed)} km/h`,
          precipitation: precip > 0 ? `${precip} mm` : undefined,
          forecastSummary: mapped.summary,
          marketVisitTip: mapped.tip,
          lastUpdated: new Date().toLocaleTimeString('en-MY', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isGoogleSearchGrounded: false,
          groundingSources: [],
          searchQuery: `Weather for ${locName} (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
        };

        return res.json(result);
      }
    } catch (fallbackErr) {
      console.error('Weather fallback error:', fallbackErr);
    }

    // Safe default response if everything fails
    res.json({
      condition: 'Warm & Fair',
      conditionCategory: 'cloudy',
      temperature: '29°C',
      tempNumeric: 29,
      rainChance: '20%',
      humidity: '75%',
      wind: '8 km/h',
      forecastSummary: `Tropical evening conditions around ${locName}.`,
      marketVisitTip: 'Light casual wear and comfortable shoes recommended for exploring the night market stalls.',
      lastUpdated: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' }),
      isGoogleSearchGrounded: false,
      groundingSources: [],
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
