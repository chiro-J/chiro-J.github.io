import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "./ThemeProvider";
import type { WeatherType, TimeOfDay } from "./theme.types";
import { getCurrentTimeOfDay, applyThemeToCSS } from "./theme.utils";

// 🔑 OpenWeather API 키 설정
// 실제 사용 시에는 환경변수 (.env 파일)를 사용하세요:
// REACT_APP_OPENWEATHER_API_KEY=your_actual_api_key_here
const OPENWEATHER_API_KEY =
  process.env.REACT_APP_OPENWEATHER_API_KEY || "your-api-key-here";

// 💡 API 키 설정 방법:
// 1. OpenWeatherMap 가입 후 무료 API 키 발급: https://openweathermap.org/api
// 2. 프로젝트 루트에 .env 파일 생성
// 3. .env 파일에 추가: REACT_APP_OPENWEATHER_API_KEY=발급받은키
// 4. 개발 서버 재시작

// 테마 컨텍스트 사용을 위한 기본 훅
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// 🤖 스마트 모드 (시간 + 날씨 자동)
export const useSmartMode = () => {
  const { setTheme, setWeather, setTimeOfDay } = useTheme();
  const [isSmartMode, setIsSmartMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [locationInfo, setLocationInfo] = useState<{
    city?: string;
    country?: string;
  }>({});

  // 위치 기반 날씨 데이터 가져오기
  const fetchWeatherData = async (): Promise<WeatherType | null> => {
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "your-api-key-here") {
      throw new Error("OpenWeather API key not configured");
    }

    try {
      // 현재 위치 가져오기
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // 날씨 데이터 API 호출
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();

      // 위치 정보 저장
      setLocationInfo({
        city: data.name,
        country: data.sys.country,
      });

      // OpenWeather 날씨 코드를 테마 날씨로 변환
      return mapOpenWeatherToThemeWeather(
        data.weather[0].main,
        data.weather[0].id
      );
    } catch (error) {
      console.error("Weather fetch error:", error);
      throw error;
    }
  };

  // 스마트 모드 업데이트 (시간 + 날씨)
  const updateSmartTheme = async () => {
    if (!isSmartMode) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. 현재 시간 업데이트
      const currentTime = getCurrentTimeOfDay();
      setTimeOfDay(currentTime);

      // 2. 날씨 업데이트 (30분마다만)
      const now = Date.now();
      const shouldUpdateWeather = now - lastUpdateTime > 30 * 60 * 1000; // 30분

      if (shouldUpdateWeather) {
        const weather = await fetchWeatherData();
        if (weather) {
          setWeather(weather);
          setLastUpdateTime(now);

          console.log(
            `🤖 Smart mode updated: ${currentTime} + ${weather}`,
            locationInfo
          );
        }
      } else {
        console.log(`🕐 Smart mode: Time updated to ${currentTime}`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Smart mode update failed";
      setError(errorMessage);
      console.error("Smart mode error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 스마트 모드 토글
  const toggleSmartMode = async () => {
    if (!isSmartMode) {
      // 스마트 모드 활성화
      setIsSmartMode(true);
      await updateSmartTheme();
    } else {
      // 스마트 모드 비활성화
      setIsSmartMode(false);
      setError(null);
    }
  };

  // 주기적 업데이트 (스마트 모드 시)
  useEffect(() => {
    if (!isSmartMode) return;

    const interval = setInterval(() => {
      updateSmartTheme();
    }, 5 * 60 * 1000); // 5분마다 체크

    return () => clearInterval(interval);
  }, [isSmartMode, lastUpdateTime]);

  return {
    isSmartMode,
    isLoading,
    error,
    locationInfo,
    toggleSmartMode,
    updateSmartTheme,
  };
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

// 현재 위치 가져오기
const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location access denied by user"));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information unavailable"));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out"));
            break;
          default:
            reject(new Error("Unknown location error"));
            break;
        }
      },
      {
        timeout: 15000,
        maximumAge: 10 * 60 * 1000, // 10분간 캐시
        enableHighAccuracy: false, // 성능 최적화
      }
    );
  });
};

// OpenWeather API 날씨 코드를 테마 날씨로 매핑
const mapOpenWeatherToThemeWeather = (
  main: string,
  id: number
): WeatherType => {
  // 상세한 날씨 코드 매핑
  if (id >= 200 && id < 300) return "stormy"; // Thunderstorm
  if (id >= 300 && id < 500) return "rainy"; // Drizzle
  if (id >= 500 && id < 600) return "rainy"; // Rain
  if (id >= 600 && id < 700) return "snowy"; // Snow
  if (id >= 700 && id < 800) return "foggy"; // Atmosphere (fog, mist, etc)
  if (id === 800) return "sunny"; // Clear sky
  if (id > 800) return "cloudy"; // Clouds

  // 기본 매핑 (백업)
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
    case "drizzle":
      return "rainy";
    case "mist":
    case "fog":
    case "haze":
    case "smoke":
    case "dust":
    case "sand":
    case "ash":
    case "squall":
    case "tornado":
      return "foggy";
    default:
      console.warn("Unknown weather condition:", main, id);
      return "sunny";
  }
};
