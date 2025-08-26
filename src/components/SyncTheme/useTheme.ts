import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "./ThemeProvider";
import type { WeatherType, TimeOfDay } from "./theme.types";
import { getCurrentTimeOfDay, applyThemeToCSS } from "./theme.utils";

// 테마 컨텍스트 사용을 위한 기본 훅
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// 실제 날씨 API에서 날씨 정보 가져오기
export const useWeatherAPI = (apiKey?: string) => {
  const [weather, setWeather] = useState<WeatherType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setWeather: setThemeWeather } = useTheme();

  const fetchWeather = async (lat?: number, lon?: number) => {
    if (!apiKey) {
      console.warn("Weather API key not provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 위치 정보가 없으면 현재 위치 가져오기
      if (!lat || !lon) {
        const position = await getCurrentPosition();
        lat = position.coords.latitude;
        lon = position.coords.longitude;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await response.json();
      const weatherType = mapOpenWeatherToThemeWeather(
        data.weather[0].main,
        data.weather[0].id
      );

      setWeather(weatherType);
      setThemeWeather(weatherType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Weather API error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { weather, loading, error, fetchWeather };
};

// 자동 테마 변경을 위한 훅 (시간 기반)
export const useAutoTheme = () => {
  const { currentTheme, setTimeOfDay } = useTheme();
  const [isAutoMode, setIsAutoMode] = useState(false);

  useEffect(() => {
    if (!isAutoMode) return;

    const interval = setInterval(() => {
      const currentTime = getCurrentTimeOfDay();
      if (currentTime !== currentTheme.timeOfDay) {
        setTimeOfDay(currentTime);
      }
    }, 60 * 1000); // 1분마다 체크

    return () => clearInterval(interval);
  }, [isAutoMode, currentTheme.timeOfDay, setTimeOfDay]);

  const toggleAutoMode = () => {
    setIsAutoMode(!isAutoMode);
    if (!isAutoMode) {
      // 자동 모드 활성화 시 현재 시간으로 설정
      setTimeOfDay(getCurrentTimeOfDay());
    }
  };

  return { isAutoMode, toggleAutoMode };
};

// 테마 애니메이션을 위한 훅
export const useThemeTransition = (duration: number = 300) => {
  const { currentTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    applyThemeToCSS(currentTheme);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentTheme, duration]);

  return { isTransitioning };
};

// 현재 위치 가져오기 (Promise wrapper)
const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 300000, // 5분간 캐시
      enableHighAccuracy: false,
    });
  });
};

// OpenWeather API 날씨 코드를 테마 날씨로 매핑
const mapOpenWeatherToThemeWeather = (
  main: string,
  id: number
): WeatherType => {
  // OpenWeather 날씨 코드 기반 매핑
  if (id >= 200 && id < 300) return "stormy"; // Thunderstorm
  if (id >= 300 && id < 600) return "rainy"; // Drizzle & Rain
  if (id >= 600 && id < 700) return "snowy"; // Snow
  if (id >= 700 && id < 800) return "foggy"; // Atmosphere (fog, mist, etc)
  if (id === 800) return "sunny"; // Clear
  if (id > 800) return "cloudy"; // Clouds

  // 기본값
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
    case "mist":
    case "fog":
    case "haze":
      return "foggy";
    default:
      return "sunny";
  }
};
