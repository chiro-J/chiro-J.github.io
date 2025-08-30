import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "./ThemeProvider";
import type { WeatherType, TimeOfDay } from "./theme.types";
import { getCurrentTimeOfDay, applyThemeToCSS } from "./theme.utils";

// 🔑 임시 API 키 (나중에 환경변수로 변경)
const TEMP_API_KEY = "d3db7f268fac45dae3da3fa381c54f1c";

// 🔑 OpenWeather API 키 설정 (런타임 체크)
const getAPIKey = (): string | null => {
  // 1. 임시 하드코딩된 키 (테스트용)
  if (TEMP_API_KEY) {
    console.log("🔑 Using temporary hardcoded API key");
    return TEMP_API_KEY;
  }

  // 2. 환경변수에서 확인
  if (process.env.REACT_APP_OPENWEATHER_API_KEY) {
    console.log("🔑 Using environment variable API key");
    return process.env.REACT_APP_OPENWEATHER_API_KEY;
  }

  // 3. 로컬스토리지에서 확인 (테스트용)
  if (typeof window !== "undefined") {
    const storedKey = localStorage.getItem("openweather_api_key");
    if (storedKey) {
      console.log("🔑 Using localStorage API key");
      return storedKey;
    }
  }

  return null;
};

// 💡 API 키 설정 방법 안내
const API_SETUP_GUIDE = {
  envFile:
    "Create .env file in project root with: REACT_APP_OPENWEATHER_API_KEY=your_key",
  getKey: "Get free API key from: https://openweathermap.org/api",
  localStorage:
    'Or temporarily store in localStorage: localStorage.setItem("openweather_api_key", "your_key")',
};

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
    console.log("🌍 Fetching weather data...");

    const apiKey = getAPIKey();
    if (!apiKey) {
      const errorMsg = "🔑 API key not found";
      console.group("🔑 API Key Setup Guide");
      console.log(
        "Environment Variable:",
        !!process.env.REACT_APP_OPENWEATHER_API_KEY
      );
      console.log(
        "LocalStorage:",
        typeof window !== "undefined"
          ? !!localStorage.getItem("openweather_api_key")
          : false
      );
      console.log("Temporary Key:", !!TEMP_API_KEY);
      console.log("\n📋 Setup Instructions:");
      console.log("1. Get API key:", API_SETUP_GUIDE.getKey);
      console.log("2. Method 1 (.env file):", API_SETUP_GUIDE.envFile);
      console.log("3. Method 2 (temporary):", API_SETUP_GUIDE.localStorage);
      console.groupEnd();
      throw new Error(errorMsg);
    }

    console.log("✅ API key found, proceeding with weather fetch...");

    try {
      // 현재 위치 가져오기
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      console.log(
        `📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      );

      // 날씨 데이터 API 호출
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
      console.log("🌐 Calling weather API...");

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          console.error("❌ Invalid API Key");
          console.log(
            "💡 Current API Key (first 8 chars):",
            apiKey.substring(0, 8) + "..."
          );
          throw new Error("🔑 Invalid API key. Please check your setup.");
        }

        const errorText = await response.text();
        console.error("❌ API Response:", response.status, errorText);
        throw new Error(
          `Weather API error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("🌤️ Weather data received:", {
        location: `${data.name}, ${data.sys.country}`,
        weather: data.weather[0].main,
        description: data.weather[0].description,
        id: data.weather[0].id,
        temp: `${Math.round(data.main.temp)}°C`,
      });

      // 위치 정보 저장
      setLocationInfo({
        city: data.name,
        country: data.sys.country,
      });

      // OpenWeather 날씨 코드를 테마 날씨로 변환
      const weatherType = mapOpenWeatherToThemeWeather(
        data.weather[0].main,
        data.weather[0].id
      );
      console.log(
        `🎨 Mapped weather: ${data.weather[0].main} (${data.weather[0].id}) → ${weatherType}`
      );

      return weatherType;
    } catch (error) {
      console.error("❌ Weather fetch error:", error);
      throw error;
    }
  };

  // 스마트 모드 업데이트 함수
  const updateSmartTheme = async () => {
    if (!isSmartMode) {
      console.log("⚠️ Smart mode is disabled, skipping update");
      return;
    }

    console.log("🤖 Starting smart theme update...");
    setIsLoading(true);
    setError(null);

    try {
      // 1. 현재 시간 업데이트 (항상)
      const currentTime = getCurrentTimeOfDay();
      console.log(`🕐 Current time: ${currentTime}`);
      setTimeOfDay(currentTime);

      // 2. 날씨 업데이트 (30분마다만)
      const now = Date.now();
      const shouldUpdateWeather = now - lastUpdateTime > 30 * 60 * 1000; // 30분

      console.log(
        `⏰ Should update weather: ${shouldUpdateWeather} (last update: ${Math.round(
          (now - lastUpdateTime) / 1000 / 60
        )}min ago)`
      );

      if (shouldUpdateWeather) {
        const weather = await fetchWeatherData();
        if (weather) {
          setWeather(weather);
          setLastUpdateTime(now);

          console.log(
            `✅ Smart mode completed: ${currentTime} + ${weather}`,
            locationInfo.city
              ? `in ${locationInfo.city}, ${locationInfo.country}`
              : ""
          );
        }
      } else {
        console.log(`⏰ Time updated to ${currentTime} (weather cache valid)`);
      }
    } catch (err) {
      let errorMessage = "Smart mode update failed";

      if (err instanceof Error) {
        errorMessage = err.message;

        // 특정 에러에 대한 사용자 친화적 메시지
        if (err.message.includes("Location access denied")) {
          errorMessage = "📍 Location access required for weather updates";
        } else if (err.message.includes("API key")) {
          errorMessage = "🔑 Please check your OpenWeather API key";
        } else if (
          err.message.includes("network") ||
          err.message.includes("fetch")
        ) {
          errorMessage = "🌐 Network error - check your connection";
        }
      }

      setError(errorMessage);
      console.error("❌ Smart mode error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 스마트 모드 토글
  const toggleSmartMode = async () => {
    console.log(`🔄 Toggling smart mode: ${!isSmartMode}`);

    if (!isSmartMode) {
      // 스마트 모드 활성화
      setIsSmartMode(true);
      setError(null);
      console.log("🤖 Smart mode activated, running initial update...");

      // 즉시 업데이트 실행
      setTimeout(updateSmartTheme, 100);
    } else {
      // 스마트 모드 비활성화
      setIsSmartMode(false);
      setError(null);
      setLocationInfo({});
      console.log("⚠️ Smart mode deactivated");
    }
  };

  // 수동 업데이트 (테스트용)
  const manualUpdate = () => {
    console.log("🔄 Manual smart update triggered");
    updateSmartTheme();
  };

  // 주기적 업데이트 (스마트 모드 시)
  useEffect(() => {
    if (!isSmartMode) return;

    console.log("⏰ Setting up smart mode interval (5min)");

    const interval = setInterval(() => {
      console.log("⏰ Interval triggered, updating smart theme...");
      updateSmartTheme();
    }, 5 * 60 * 1000); // 5분마다 체크

    return () => {
      console.log("🧹 Clearing smart mode interval");
      clearInterval(interval);
    };
  }, [isSmartMode]);

  return {
    isSmartMode,
    isLoading,
    error,
    locationInfo,
    toggleSmartMode,
    updateSmartTheme: manualUpdate, // 테스트용 수동 업데이트
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
      reject(new Error("🌍 Geolocation not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new Error(
                "📍 Location access denied by user. Please allow location access and try again."
              )
            );
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("📍 Location information unavailable"));
            break;
          case error.TIMEOUT:
            reject(new Error("📍 Location request timed out"));
            break;
          default:
            reject(new Error("📍 Unknown location error"));
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
      console.warn("❓ Unknown weather condition:", main, id);
      return "sunny";
  }
};
