import { useContext, useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { ThemeContext } from "./ThemeProvider";
import type { WeatherType, TimeOfDay } from "./theme.types";
import { getCurrentTimeOfDay } from "./theme.utils";

const TEMP_API_KEY = "d3db7f268fac45dae3da3fa381c54f1c";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const useSmartMode = () => {
  const { setTheme, setWeather, setTimeOfDay } = useTheme();
  const [isSmartMode, setIsSmartMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<{
    city?: string;
    country?: string;
  }>({});

  // 즉시 동기화 (모든 간섭 차단)
  const updateSmartTheme = useCallback(async () => {
    console.log("=== SMART UPDATE START ===");

    if (!isSmartMode) {
      // 스마트 모드 꺼져있어도 시간만 동기화
      const realTime = getCurrentTimeOfDay();
      flushSync(() => setTimeOfDay(realTime));
      console.log(`Time only: ${realTime}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 실시간 동기화
    const realTime = getCurrentTimeOfDay();

    try {
      // 1. 위치 가져오기
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
          });
        }
      );

      // 2. 날씨 API 호출
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${TEMP_API_KEY}&units=metric`;

      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Weather API error: ${response.status}`);

      const data = await response.json();
      const weather = mapWeather(data.weather[0].main, data.weather[0].id);

      setLocationInfo({
        city: data.name,
        country: data.sys.country,
      });

      // 3. 한번에 테마 전체 설정 (분리된 업데이트 방지)
      setTheme(weather, realTime);

      // 4. localStorage 강제 덮어쓰기 (복원 방지)
      localStorage.setItem(
        "current-theme",
        JSON.stringify({
          weather,
          timeOfDay: realTime,
          smartMode: true,
          timestamp: Date.now(),
        })
      );

      console.log(`=== SMART SYNC COMPLETE: ${realTime} + ${weather} ===`);
    } catch (err) {
      console.error("Smart sync failed:", err);
      setError("Sync failed");

      // 에러 시에도 시간은 동기화
      flushSync(() => setTimeOfDay(realTime));
    } finally {
      setIsLoading(false);
    }
  }, [isSmartMode, setTheme, setTimeOfDay, setWeather]);

  // 스마트 모드 토글
  const toggleSmartMode = useCallback(() => {
    if (!isSmartMode) {
      setIsSmartMode(true);
      setError(null);

      // 즉시 동기화 실행
      setTimeout(() => updateSmartTheme(), 100);
    } else {
      setIsSmartMode(false);
      setError(null);
      setLocationInfo({});
    }
  }, [isSmartMode, updateSmartTheme]);

  return {
    isSmartMode,
    isLoading,
    error,
    locationInfo,
    toggleSmartMode,
    updateSmartTheme,
  };
};

// 날씨 코드 매핑
const mapWeather = (main: string, id: number): WeatherType => {
  if (id >= 200 && id < 300) return "stormy";
  if (id >= 300 && id < 600) return "rainy";
  if (id >= 600 && id < 700) return "snowy";
  if (id >= 700 && id < 800) return "foggy";
  if (id === 800) return "sunny";
  if (id > 800) return "cloudy";

  switch (main.toLowerCase()) {
    case "clear":
      return "sunny";
    case "clouds":
      return "cloudy";
    case "rain":
      return "rainy";
    case "snow":
      return "snowy";
    case "thunderstorm":
      return "stormy";
    default:
      return "sunny";
  }
};

export const useThemeTransition = () => ({ isTransitioning: false });
