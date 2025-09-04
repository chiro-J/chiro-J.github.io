import { useContext, useCallback, useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { ThemeContext } from "./ThemeProvider";
import type { WeatherType, TimeOfDay } from "./theme.types";
// Removed unused getCurrentTimeOfDay import

const TEMP_API_KEY = "d3db7f268fac45dae3da3fa381c54f1c";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const useSmartMode = () => {
  const { setTheme, setTimeOfDay } = useTheme(); // Removed unused setWeather
  const [isSmartMode, setIsSmartMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [locationInfo, setLocationInfo] = useState<{
    city?: string;
    country?: string;
    method?: "gps" | "ip" | "fallback";
    coordinates?: { lat: number; lon: number };
  }>({});
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [sunriseData, setSunriseData] = useState<{
    sunrise: Date;
    sunset: Date;
    date: string;
  } | null>(null);

  // 실시간 시간 업데이트용 ref (useState 다음에 배치)
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const weatherUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // 더 정확한 시간 계산 (한국 시간대 고려)
  const getCurrentTimeOfDayAccurate = useCallback((): {
    time: TimeOfDay;
    hour: number;
    reason: string;
  } => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    let timeOfDay: TimeOfDay;
    let reason: string;

    if (hour >= 5 && hour < 8) {
      timeOfDay = "dawn";
      reason = `${hour}:${minute.toString().padStart(2, "0")} - Dawn period`;
    } else if (hour >= 8 && hour < 12) {
      timeOfDay = "morning";
      reason = `${hour}:${minute.toString().padStart(2, "0")} - Morning period`;
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = "afternoon";
      reason = `${hour}:${minute
        .toString()
        .padStart(2, "0")} - Afternoon period`;
    } else if (hour >= 17 && hour < 20) {
      timeOfDay = "evening";
      reason = `${hour}:${minute.toString().padStart(2, "0")} - Evening period`;
    } else {
      timeOfDay = "night";
      reason = `${hour}:${minute.toString().padStart(2, "0")} - Night period`;
    }

    return { time: timeOfDay, hour, reason };
  }, []);

  // GPS 위치 가져오기
  const getGPSLocation = useCallback((): Promise<{
    lat: number;
    lon: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          console.log("🎯 GPS Location:", result);
          resolve(result);
        },
        (error) => {
          console.log("❌ GPS Error:", error.message);
          reject(error);
        },
        {
          timeout: 8000,
          enableHighAccuracy: true,
          maximumAge: 300000, // 5분 캐시
        }
      );
    });
  }, []);

  // IP 기반 위치 가져오기
  const getIPLocation = useCallback(async (): Promise<{
    lat: number;
    lon: number;
    city?: string;
    country?: string;
  }> => {
    console.log("🌍 Trying IP location...");
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("IP location failed");

    const data = await response.json();
    console.log("📍 IP Location Response:", data);

    if (data.error) {
      throw new Error(data.reason || "IP location error");
    }

    const result = {
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      country: data.country_name,
    };

    console.log("✅ IP Location Success:", result);
    return result;
  }, []);

  // 일출/일몰 시간 가져오기
  const getSunriseData = useCallback(
    async (lat: number, lon: number) => {
      const today = new Date().toISOString().split("T")[0];

      // 오늘 데이터가 이미 있으면 재사용
      if (sunriseData && sunriseData.date === today) {
        console.log("🌅 Using cached sunrise data:", sunriseData);
        return sunriseData;
      }

      try {
        const response = await fetch(
          `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0&date=${today}`
        );
        const data = await response.json();

        if (data.status === "OK") {
          const newSunriseData = {
            sunrise: new Date(data.results.sunrise),
            sunset: new Date(data.results.sunset),
            date: today,
          };

          setSunriseData(newSunriseData);
          console.log("🌅 Sunrise data updated:", {
            sunrise: newSunriseData.sunrise.toLocaleTimeString("ko-KR"),
            sunset: newSunriseData.sunset.toLocaleTimeString("ko-KR"),
          });

          return newSunriseData;
        }
        throw new Error("Sunrise API failed");
      } catch (error) {
        console.log("⚠️ Sunrise API error:", error);
        return null;
      }
    },
    [sunriseData]
  );

  // Removed unused calculateCelestialPosition function

  const getWeatherFromCoords = useCallback(
    async (
      lat: number,
      lon: number
    ): Promise<{ weather: WeatherType; debug: string }> => {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${TEMP_API_KEY}&units=metric`;
      console.log("🌤️ Weather API URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Weather API error: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("🌈 Weather API Response:", data);

      const weatherMain = data.weather[0].main;
      const weatherId = data.weather[0].id;
      const description = data.weather[0].description;
      const temperature = Math.round(data.main.temp);
      const feelsLike = Math.round(data.main.feels_like);

      const weather = mapWeatherImproved(weatherMain, weatherId);

      const debugString = `Weather: ${weatherMain}(${weatherId}) -> ${weather} | "${description}" | ${temperature}°C (feels ${feelsLike}°C) | City: ${data.name}`;

      console.log("🎨 Weather Mapping:", debugString);

      return { weather, debug: debugString };
    },
    []
  );

  // 개선된 날씨 매핑
  const mapWeatherImproved = (main: string, id: number): WeatherType => {
    console.log(`🔄 Mapping weather: ${main} (ID: ${id})`);

    // 더 정확한 매핑
    if (id >= 200 && id < 300) {
      console.log("⛈️ Mapped to stormy");
      return "stormy";
    }
    if (id >= 300 && id < 400) {
      console.log("🌦️ Mapped to rainy (drizzle)");
      return "rainy";
    }
    if (id >= 500 && id < 600) {
      console.log("🌧️ Mapped to rainy");
      return "rainy";
    }
    if (id >= 600 && id < 700) {
      console.log("❄️ Mapped to snowy");
      return "snowy";
    }
    if (id >= 700 && id < 800) {
      console.log("🌫️ Mapped to foggy");
      return "foggy";
    }
    if (id === 800) {
      console.log("☀️ Mapped to sunny");
      return "sunny";
    }
    if (id > 800 && id < 900) {
      console.log("☁️ Mapped to cloudy");
      return "cloudy";
    }

    // 백업 매핑
    const lowerMain = main.toLowerCase();
    if (lowerMain === "clear") return "sunny";
    if (lowerMain === "clouds") return "cloudy";
    if (lowerMain === "rain") return "rainy";
    if (lowerMain === "snow") return "snowy";
    if (lowerMain === "thunderstorm") return "stormy";
    if (
      lowerMain.includes("mist") ||
      lowerMain.includes("fog") ||
      lowerMain.includes("haze")
    )
      return "foggy";

    console.log("🤷 Using default: sunny");
    return "sunny";
  };

  // 스마트 테마 업데이트 (일괄 업데이트 방식) - updateSmartTheme보다 먼저 정의
  const updateSmartTheme = useCallback(
    async (forceSync = false) => {
      console.log("\n=== 🚀 SMART UPDATE START ===");
      const startTime = Date.now();

      // 스마트 모드가 아닐 때는 강제 실행이 아니면 시간만 업데이트
      if (!isSmartMode && !forceSync) {
        const timeResult = getCurrentTimeOfDayAccurate();
        console.log(
          "💤 Smart mode OFF - Time only updated:",
          timeResult.reason
        );
        flushSync(() => setTimeOfDay(timeResult.time));
        setDebugInfo(`Time: ${timeResult.reason}`);
        return;
      }

      // 로딩 시작 - 기존 테마 유지
      console.log("🌤️ Starting complete sync...", { isSmartMode, forceSync });
      setIsLoading(true);
      setError(null);
      setDebugInfo("Loading weather & location data...");

      try {
        // 1. 현재 시간 계산 (UI 업데이트 안함)
        const timeResult = getCurrentTimeOfDayAccurate();
        console.log("🕐 Time Analysis:", timeResult.reason);

        let locationResult = null;
        let weatherResult = null;
        let finalLocationInfo = {};

        // 2. GPS 위치 시도
        try {
          console.log("🎯 Step 1: Trying GPS...");
          setDebugInfo("Getting GPS location...");

          locationResult = await getGPSLocation();

          console.log("🌤️ Step 2: Getting weather from GPS coords...");
          setDebugInfo("Getting weather data...");

          weatherResult = await getWeatherFromCoords(
            locationResult.lat,
            locationResult.lon
          );

          // 역지오코딩으로 도시명 가져오기
          try {
            setDebugInfo("Getting city information...");
            const geoResponse = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${locationResult.lat}&lon=${locationResult.lon}&appid=${TEMP_API_KEY}`
            );
            const geoData = await geoResponse.json();
            console.log("🏙️ Reverse Geocoding:", geoData);

            if (geoData[0]) {
              finalLocationInfo = {
                city: geoData[0].name,
                country: geoData[0].country,
                method: "gps" as const,
                coordinates: locationResult,
              };
            } else {
              finalLocationInfo = {
                method: "gps" as const,
                coordinates: locationResult,
              };
            }
          } catch (geoError) {
            console.log("⚠️ Reverse geocoding failed:", geoError);
            finalLocationInfo = {
              method: "gps" as const,
              coordinates: locationResult,
            };
          }

          console.log(`✅ GPS SUCCESS in ${Date.now() - startTime}ms`);
        } catch (gpsError) {
          console.log("❌ GPS failed:", gpsError);

          // 3. IP 위치 시도
          try {
            console.log("🌍 Step 3: Trying IP location...");
            setDebugInfo("Using IP-based location...");

            locationResult = await getIPLocation();

            console.log("🌤️ Step 4: Getting weather from IP coords...");
            setDebugInfo("Getting weather data...");

            weatherResult = await getWeatherFromCoords(
              locationResult.lat,
              locationResult.lon
            );

            finalLocationInfo = {
              city: locationResult.city,
              country: locationResult.country,
              method: "ip" as const,
              coordinates: { lat: locationResult.lat, lon: locationResult.lon },
            };

            // IP 사용 시 GPS 재시도 제안 (나중에)
            setTimeout(() => setShowLocationDialog(true), 2000);

            console.log(`📍 IP SUCCESS in ${Date.now() - startTime}ms`);
          } catch (ipError) {
            console.log("❌ IP location failed:", ipError);
            throw new Error("모든 위치 서비스 실패");
          }
        }

        // 4. 일출/일몰 데이터도 가져오기 (GPS/IP 성공 시)
        if (locationResult) {
          try {
            setDebugInfo("Getting sunrise/sunset times...");
            await getSunriseData(locationResult.lat, locationResult.lon);
          } catch (sunriseError) {
            console.log("⚠️ Sunrise data failed, using defaults");
          }
        }

        // 5. 모든 데이터 준비 완료 - 한번에 일괄 업데이트
        console.log("🎨 Applying complete theme update...");
        setDebugInfo("Applying theme...");

        // 약간의 지연으로 로딩 완료감 제공
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 한번에 모든 상태 업데이트
        setLocationInfo(finalLocationInfo as typeof locationInfo); // Type assertion to fix the error
        setTheme(weatherResult.weather, timeResult.time);

        const debugString = `✅ COMPLETE SUCCESS\n${timeResult.reason}\n${
          weatherResult.debug
        }\n${
          (finalLocationInfo as any).city
            ? `Location: ${(finalLocationInfo as any).city}, ${
                (finalLocationInfo as any).country
              }`
            : "GPS coordinates only"
        }`;
        setDebugInfo(debugString);

        console.log(
          `🎨 Applied: ${timeResult.time} + ${weatherResult.weather}`
        );
        console.log(`🎉 COMPLETE SUCCESS in ${Date.now() - startTime}ms`);
      } catch (err) {
        console.error("💥 Smart sync complete failure:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(`위치/날씨 동기화 실패: ${errorMessage}`);

        // 실패시에도 시간만은 업데이트
        const timeResult = getCurrentTimeOfDayAccurate();
        flushSync(() => setTimeOfDay(timeResult.time));
        setDebugInfo(`❌ FAILED\n${timeResult.reason}\nError: ${errorMessage}`);
      } finally {
        setIsLoading(false);
        console.log(
          `=== ⏱️ SMART UPDATE END (${Date.now() - startTime}ms) ===\n`
        );
      }
    },
    [
      isSmartMode,
      setTheme,
      setTimeOfDay,
      getCurrentTimeOfDayAccurate,
      getGPSLocation,
      getIPLocation,
      getWeatherFromCoords,
      getSunriseData,
    ]
  );

  // 실시간 시간 & 날씨 자동 업데이트 시작/중지 (updateSmartTheme 정의 후 배치)
  useEffect(() => {
    if (isSmartMode) {
      // 1분마다 시간 체크
      timeUpdateInterval.current = setInterval(() => {
        const timeResult = getCurrentTimeOfDayAccurate();
        setTimeOfDay(timeResult.time);
        console.log("⏰ Auto time update:", timeResult.reason);
      }, 60000); // 1분마다

      // 1분마다 날씨 동기화 (테스트용 - 원래는 5분)
      weatherUpdateInterval.current = setInterval(() => {
        console.log("🌤️ Auto weather sync...");
        updateSmartTheme(false); // 자동 동기화는 forceSync = false
      }, 300000); // 1분마다 (테스트용, 원래는 300000ms)

      return () => {
        if (timeUpdateInterval.current) {
          clearInterval(timeUpdateInterval.current);
          timeUpdateInterval.current = null;
        }
        if (weatherUpdateInterval.current) {
          clearInterval(weatherUpdateInterval.current);
          weatherUpdateInterval.current = null;
        }
      };
    } else {
      // 스마트 모드 OFF시 자동 업데이트 중지
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
      if (weatherUpdateInterval.current) {
        clearInterval(weatherUpdateInterval.current);
        weatherUpdateInterval.current = null;
      }
    }
  }, [
    isSmartMode,
    setTimeOfDay,
    updateSmartTheme,
    getCurrentTimeOfDayAccurate,
  ]);

  // GPS 권한 재요청
  const retryGPSLocation = useCallback(async () => {
    console.log("🔄 Retrying GPS...");
    setShowLocationDialog(false);
    setIsLoading(true);

    try {
      const timeResult = getCurrentTimeOfDayAccurate();
      const gpsLocation = await getGPSLocation();
      const weatherResult = await getWeatherFromCoords(
        gpsLocation.lat,
        gpsLocation.lon
      );

      // 정확한 위치 정보 업데이트
      try {
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${gpsLocation.lat}&lon=${gpsLocation.lon}&appid=${TEMP_API_KEY}`
        );
        const geoData = await geoResponse.json();
        if (geoData[0]) {
          setLocationInfo({
            city: geoData[0].name,
            country: geoData[0].country,
            method: "gps",
            coordinates: gpsLocation,
          });
        }
      } catch (geoError) {
        console.log("Reverse geocoding failed in retry");
        setLocationInfo({
          method: "gps",
          coordinates: gpsLocation,
        });
      }

      setTheme(weatherResult.weather, timeResult.time);
      setError(null);
      setDebugInfo(
        `🎯 GPS RETRY SUCCESS\n${timeResult.reason}\n${weatherResult.debug}`
      );

      console.log("✅ GPS retry successful");
    } catch (error) {
      console.log("❌ GPS retry failed:", error);
      setError("GPS 재시도 실패. IP 기반 위치를 계속 사용합니다.");
      setDebugInfo((prev) => prev + "\nGPS retry failed");
    } finally {
      setIsLoading(false);
    }
  }, [
    getCurrentTimeOfDayAccurate,
    getGPSLocation,
    getWeatherFromCoords,
    setTheme,
  ]);

  // 스마트 모드 토글 (수정된 버전)
  const toggleSmartMode = useCallback(() => {
    console.log(`🔄 Smart Mode Toggle: ${isSmartMode ? "OFF" : "ON"}`);

    if (!isSmartMode) {
      setIsSmartMode(true);
      setError(null);
      setDebugInfo("Activating smart mode...");

      // 강제 동기화 실행 (React 상태 업데이트를 기다리지 않음)
      setTimeout(() => updateSmartTheme(true), 100); // forceSync = true
    } else {
      setIsSmartMode(false);
      setError(null);
      setLocationInfo({});
      setShowLocationDialog(false);
      setDebugInfo("Smart mode disabled");
      console.log("💤 Smart mode disabled");
    }
  }, [isSmartMode, updateSmartTheme]);

  return {
    isSmartMode,
    isLoading,
    error,
    debugInfo,
    locationInfo,
    showLocationDialog,
    toggleSmartMode,
    updateSmartTheme: () => updateSmartTheme(false), // 일반 호출은 forceSync = false
    retryGPSLocation,
    dismissLocationDialog: () => setShowLocationDialog(false),
  };
};

export const useThemeTransition = () => ({ isTransitioning: false });
