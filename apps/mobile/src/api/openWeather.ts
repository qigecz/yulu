import type { Weather } from '@yulu/shared';

/**
 * Real weather via Open-Meteo (free, no API key) from the device's location.
 * Used by the home screen weather strip when coordinates are available —
 * works in both mock and real-API mode since it bypasses our backend.
 */

const WMO_MAP: Record<number, { label: string; good: boolean }> = {
  0: { label: '晴', good: true },
  1: { label: '晴间多云', good: true },
  2: { label: '多云', good: true },
  3: { label: '阴', good: true },
  4: { label: '霾', good: false },
  45: { label: '雾', good: false },
  48: { label: '雾凇', good: false },
  51: { label: '小毛毛雨', good: false },
  53: { label: '毛毛雨', good: false },
  55: { label: '大毛毛雨', good: false },
  61: { label: '小雨', good: false },
  63: { label: '中雨', good: false },
  65: { label: '大雨', good: false },
  66: { label: '冻雨', good: false },
  71: { label: '小雪', good: false },
  73: { label: '中雪', good: false },
  75: { label: '大雪', good: false },
  77: { label: '雪粒', good: false },
  80: { label: '阵雨', good: false },
  81: { label: '强阵雨', good: false },
  82: { label: '暴雨', good: false },
  85: { label: '阵雪', good: false },
  86: { label: '强阵雪', good: false },
  95: { label: '雷雨', good: false },
  96: { label: '雷雨伴冰雹', good: false },
  99: { label: '强雷雨冰雹', good: false },
};

const WIND_DIRS = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];

function describeWeather(code: number): { label: string; good: boolean } {
  return WMO_MAP[code] ?? { label: '未知', good: false };
}

/** Simple fishing heuristic: rain/thunder bad; sunny/cloudy + moderate wind good. */
function fishingAdvice(condition: string, windLevel: number): Weather['fishingAdvice'] {
  if (condition.includes('雨') || condition.includes('雪') || condition.includes('雷') || condition.includes('雹')) {
    return '不宜';
  }
  if (windLevel >= 6) return '不宜';
  if (windLevel >= 1 && windLevel <= 4) return '宜出钓';
  return '一般';
}

export async function fetchWeatherByCoords(lat: number, lng: number): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather api ${res.status}`);
  const json = await res.json();
  const cur = json.current ?? {};
  const code = Number(cur.weather_code ?? 0);
  const { label } = describeWeather(code);

  const windSpeed = Number(cur.wind_speed_10m ?? 0); // km/h
  const windLevel = Math.min(9, Math.max(0, Math.round(windSpeed / 6)));
  const dirIdx = Math.round((Number(cur.wind_direction_10m ?? 0) % 360) / 45) % 8;

  return {
    temperature: Math.round(Number(cur.temperature_2m ?? 0)),
    condition: label,
    windDirection: WIND_DIRS[dirIdx],
    windLevel,
    pressure: Math.round(Number(cur.surface_pressure ?? 1013)),
    fishingAdvice: fishingAdvice(label, windLevel),
  };
}
