// theme-system/ThemeProvider.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type {
  ThemeMode,
  ThemeConfig,
  ThemeContextType,
  WeatherData,
  WeatherCondition,
  TimeOfDay,
} from "./types";
import {
  fetchWeatherData,
  getCurrentLocation,
  mapWeatherIdToCondition,
  getTimeOfDay,
  calculateSunPosition,
  calculateMoonPosition,
  calculateWeatherIntensity,
  getFromStorage,
  saveToStorage,
  debounce,
} from "./utils";
import { WebGLBackground } from "./WebGLBackground";

/**
 * 테마 컨텍스트 생성
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * 기본 설정 값들
 */
const DEFAULT_CONFIG: Required<ThemeConfig> = {
  apiKey: "",
  defaultTheme: "light",
  updateInterval: 10 * 60 * 1000, // 10분
  enableGeolocation: true,
  defaultLocation: { lat: 37.5665, lon: 126.978 }, // 서울
  enableWebGL: true,
};

/**
 * ThemeProvider Props
 */
interface ThemeProviderProps extends Partial<ThemeConfig> {
  children: React.ReactNode;
}

/**
 * 테마 프로바이더 컴포넌트
 *
 * 애플리케이션 전체에 테마 상태를 제공합니다.
 *
 * @example
 * ```tsx
 * <ThemeProvider apiKey="your-api-key">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  ...userConfig
}) => {
  // 사용자 설정과 기본 설정 병합
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // 상태 관리
  const [mode, setMode] = useState<ThemeMode>(config.defaultTheme);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 참조 관리
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  /**
   * 에러 상태를 업데이트하는 함수 (자동으로 5초 후 사라짐)
   */
  const setTemporaryError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  }, []);

  /**
   * 날씨 데이터를 가져오는 함수 (디바운스 적용)
   */
  const fetchWeather = useCallback(
    debounce(async () => {
      // 테스트 모드 확인
      const testOverride = (window as any).testWeatherOverride;
      if (testOverride) {
        console.log("테스트 모드 - 모의 날씨 데이터 사용");
        setWeatherData(testOverride.weatherData);
        setIsLoading(false);
        setError(null);
        return;
      }

      // API 키 확인
      if (!config.apiKey) {
        setTemporaryError("OpenWeather API 키가 필요합니다");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("날씨 데이터 가져오는 중...");

        // 위치 정보 가져오기
        const location = config.enableGeolocation
          ? await getCurrentLocation()
          : config.defaultLocation;

        console.log("사용자 위치:", location);

        // 날씨 API 호출
        const weather = await fetchWeatherData(
          config.apiKey,
          location.lat,
          location.lon
        );

        setWeatherData(weather);
        console.log("날씨 데이터 업데이트 완료:", {
          location: weather.name,
          temp: weather.main.temp,
          condition: weather.weather[0].description,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "날씨 데이터를 가져올 수 없습니다";
        console.error("날씨 데이터 가져오기 실패:", err);
        setTemporaryError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, 1000), // 1초 디바운스
    [
      config.apiKey,
      config.enableGeolocation,
      config.defaultLocation,
      setTemporaryError,
    ]
  );

  /**
   * 테마 모드 변경 함수
   */
  const handleSetMode = useCallback(
    (newMode: ThemeMode) => {
      console.log(`테마 모드 변경: ${mode} → ${newMode}`);

      setMode(newMode);

      // 로컬스토리지에 저장
      saveToStorage("theme-mode", newMode);

      // 싱크 모드로 변경할 때 날씨 데이터 가져오기
      if (newMode === "sync" && !weatherData) {
        fetchWeather();
      }

      // 싱크 모드가 아닐 때 주기적 업데이트 중단
      if (newMode !== "sync" && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    [mode, weatherData, fetchWeather]
  );

  /**
   * 현재 날씨 조건 계산
   */
  const weatherCondition: WeatherCondition = React.useMemo(() => {
    // 테스트 오버라이드 확인
    const testOverride = (window as any).testWeatherOverride;
    if (testOverride) {
      return testOverride.weatherCondition;
    }

    return weatherData
      ? mapWeatherIdToCondition(weatherData.weather[0].id)
      : "clear";
  }, [weatherData]);

  /**
   * 현재 시간대 계산
   */
  const timeOfDay: TimeOfDay = React.useMemo(() => {
    // 테스트 오버라이드 확인
    const testOverride = (window as any).testWeatherOverride;
    if (testOverride) {
      return testOverride.timeOfDay;
    }

    return weatherData
      ? getTimeOfDay(
          Date.now() / 1000,
          weatherData.sys.sunrise,
          weatherData.sys.sunset
        )
      : "day";
  }, [weatherData]);

  /**
   * 다크모드 여부 계산
   */
  const isDarkMode =
    mode === "dark" ||
    (mode === "sync" && (timeOfDay === "night" || timeOfDay === "dawn"));

  /**
   * 테스트 모드 여부
   */
  const isTestMode = !!(window as any).testWeatherOverride;

  /**
   * 초기화 및 로컬스토리지 복원
   */
  useEffect(() => {
    if (isInitializedRef.current) return;

    console.log("테마 시스템 초기화 중...");

    // 테스트 데이터 확인
    const testData = getFromStorage("theme-test-override", null);
    if (testData) {
      (window as any).testWeatherOverride = testData;
      console.log("테스트 모드 활성화:", testData);
    }

    // 저장된 테마 모드 복원
    const savedMode = getFromStorage<ThemeMode>(
      "theme-mode",
      config.defaultTheme
    );
    if (["light", "dark", "sync"].includes(savedMode)) {
      setMode(savedMode);
      console.log(`저장된 테마 모드 복원: ${savedMode}`);
    }

    isInitializedRef.current = true;
  }, [config.defaultTheme]);

  /**
   * 싱크 모드에서 주기적 날씨 업데이트
   */
  useEffect(() => {
    if (mode !== "sync" || !config.apiKey || isTestMode) {
      // 주기적 업데이트 정리
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 즉시 한 번 실행
    fetchWeather();

    // 주기적으로 실행
    intervalRef.current = setInterval(() => {
      console.log("주기적 날씨 데이터 업데이트");
      fetchWeather();
    }, config.updateInterval);

    // 정리 함수
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [mode, config.apiKey, config.updateInterval, fetchWeather, isTestMode]);

  /**
   * CSS 변수 및 클래스 적용
   */
  useEffect(() => {
    const root = document.documentElement;

    // 다크모드 클래스 적용/제거
    root.classList.toggle("dark", isDarkMode);
    root.classList.toggle("light", !isDarkMode);

    // 기본 CSS 변수 설정
    root.style.setProperty("--theme-mode", isDarkMode ? "dark" : "light");

    // 싱크 모드 관련 CSS 변수
    if (mode === "sync") {
      root.style.setProperty("--weather-condition", weatherCondition);
      root.style.setProperty("--time-of-day", timeOfDay);

      // 태양/달 위치 계산 및 CSS 변수 설정
      if (weatherData) {
        const currentTime = Date.now() / 1000;
        const sunPos = calculateSunPosition(
          currentTime,
          weatherData.sys.sunrise,
          weatherData.sys.sunset
        );
        const moonPos = calculateMoonPosition(sunPos);
        const intensity = calculateWeatherIntensity(
          weatherCondition,
          weatherData
        );

        // 위치 정보를 CSS 변수로 설정
        root.style.setProperty("--sun-x", sunPos.x.toString());
        root.style.setProperty("--sun-y", sunPos.y.toString());
        root.style.setProperty("--moon-x", moonPos.x.toString());
        root.style.setProperty("--moon-y", moonPos.y.toString());
        root.style.setProperty(
          "--weather-intensity-visual",
          intensity.visual.toString()
        );
        root.style.setProperty(
          "--weather-intensity-particle",
          intensity.particle.toString()
        );
        root.style.setProperty(
          "--weather-intensity-opacity",
          intensity.opacity.toString()
        );
      }
    } else {
      // 싱크 모드가 아닐 때 CSS 변수 정리
      root.style.removeProperty("--weather-condition");
      root.style.removeProperty("--time-of-day");
      root.style.removeProperty("--sun-x");
      root.style.removeProperty("--sun-y");
      root.style.removeProperty("--moon-x");
      root.style.removeProperty("--moon-y");
    }

    console.log("CSS 테마 업데이트:", {
      mode,
      isDarkMode,
      weatherCondition,
      timeOfDay,
    });
  }, [mode, isDarkMode, weatherCondition, timeOfDay, weatherData]);

  /**
   * 정리 작업
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 컨텍스트 값 생성
  const contextValue: ThemeContextType = {
    mode,
    setMode: handleSetMode,
    isDarkMode,
    weatherData,
    weatherCondition,
    timeOfDay,
    isLoading,
    error,
    isTestMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {/* 싱크 모드이고 WebGL이 활성화되어 있을 때만 배경 렌더링 */}
      {mode === "sync" && config.enableWebGL && <WebGLBackground />}
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 테마 컨텍스트를 사용하는 커스텀 훅
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { mode, isDarkMode, setMode } = useThemeContext();
 *
 *   return (
 *     <div className={isDarkMode ? 'dark' : 'light'}>
 *       현재 테마: {mode}
 *     </div>
 *   );
 * }
 * ```
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      "useThemeContext는 ThemeProvider 내부에서만 사용할 수 있습니다.\n" +
        "App 컴포넌트를 <ThemeProvider>로 감싸주세요.\n\n" +
        "예시:\n" +
        "<ThemeProvider>\n" +
        "  <App />\n" +
        "</ThemeProvider>"
    );
  }

  return context;
};
