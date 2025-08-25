// theme-system/utils.ts

import type {
  WeatherData,
  WeatherCondition,
  TimeOfDay,
  Position3D,
  WeatherIntensity,
} from "./types";

/**
 * OpenWeather API에서 날씨 데이터를 가져오는 함수
 * @param apiKey - OpenWeather API 키
 * @param lat - 위도
 * @param lon - 경도
 */
export const fetchWeatherData = async (
  apiKey: string,
  lat: number,
  lon: number
): Promise<WeatherData> => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  if (!response.ok) {
    throw new Error(
      `날씨 API 요청 실패: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

/**
 * 사용자의 현재 위치를 가져오는 함수
 * 위치 정보 접근이 실패하면 서울 좌표를 반환합니다.
 */
export const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn("브라우저에서 위치 정보를 지원하지 않습니다");
      resolve({ lat: 37.5665, lon: 126.978 }); // 서울 좌표
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("위치 정보 가져오기 실패:", error);
        resolve({ lat: 37.5665, lon: 126.978 }); // 서울 좌표로 fallback
      },
      {
        timeout: 10000,
        enableHighAccuracy: false, // 배터리 절약을 위해 낮은 정확도 사용
        maximumAge: 300000, // 5분간 캐시 사용
      }
    );
  });
};

/**
 * OpenWeather API의 날씨 ID를 우리 시스템의 WeatherCondition으로 변환
 * @param weatherId - OpenWeather API의 날씨 ID
 */
export const mapWeatherIdToCondition = (
  weatherId: number
): WeatherCondition => {
  // OpenWeather API 날씨 ID 분류
  // 2xx: 뇌우, 3xx: 이슬비, 5xx: 비, 6xx: 눈, 7xx: 대기현상, 800: 맑음, 80x: 구름

  if (weatherId >= 200 && weatherId < 300) return "thunderstorm";
  if (weatherId >= 300 && weatherId < 400) return "drizzle";
  if (weatherId >= 500 && weatherId < 600) return "rain";
  if (weatherId >= 600 && weatherId < 700) return "snow";
  if (weatherId === 701 || weatherId === 741) return "mist";
  if (weatherId >= 700 && weatherId < 800) return "fog";
  if (weatherId === 800) return "clear";
  if (weatherId > 800) return "clouds";

  return "clear"; // 기본값
};

/**
 * 현재 시간과 일출/일몰 시간을 기준으로 시간대 계산
 * @param currentTime - 현재 시간 (Unix timestamp)
 * @param sunrise - 일출 시간 (Unix timestamp)
 * @param sunset - 일몰 시간 (Unix timestamp)
 */
export const getTimeOfDay = (
  currentTime: number,
  sunrise: number,
  sunset: number
): TimeOfDay => {
  const dawnStart = sunrise - 3600; // 일출 1시간 전부터 새벽
  const duskEnd = sunset + 3600; // 일몰 1시간 후까지 황혼

  if (currentTime >= dawnStart && currentTime < sunrise) return "dawn";
  if (currentTime >= sunrise && currentTime < sunset) return "day";
  if (currentTime >= sunset && currentTime < duskEnd) return "dusk";

  return "night";
};

/**
 * 태양의 3D 위치를 계산 (반원 궤도)
 * @param currentTime - 현재 시간 (Unix timestamp)
 * @param sunrise - 일출 시간 (Unix timestamp)
 * @param sunset - 일몰 시간 (Unix timestamp)
 */
export const calculateSunPosition = (
  currentTime: number,
  sunrise: number,
  sunset: number
): Position3D => {
  const dayLength = sunset - sunrise;
  const timeSinceSunrise = currentTime - sunrise;

  // 낮 시간이 아니면 태양은 지평선 아래
  if (timeSinceSunrise < 0 || timeSinceSunrise > dayLength) {
    return { x: 0, y: -0.5, z: -1 };
  }

  // 태양의 각도 계산 (0도에서 180도까지)
  const sunAngle = (timeSinceSunrise / dayLength) * Math.PI;

  return {
    x: Math.cos(sunAngle - Math.PI / 2), // 동쪽(-1)에서 서쪽(1)으로
    y: Math.sin(sunAngle), // 지평선(0)에서 정점(1)으로
    z: -0.8, // 뒤쪽에 고정
  };
};

/**
 * 달의 3D 위치를 계산 (태양의 반대편)
 * @param sunPosition - 태양의 위치
 */
export const calculateMoonPosition = (sunPosition: Position3D): Position3D => {
  return {
    x: -sunPosition.x,
    y: sunPosition.y < 0 ? Math.abs(sunPosition.y) * 0.8 : -0.4,
    z: sunPosition.z,
  };
};

/**
 * 날씨 강도 계산 (파티클 효과와 시각적 효과에 사용)
 * @param weatherCondition - 날씨 상태
 * @param weatherData - 날씨 데이터
 */
export const calculateWeatherIntensity = (
  weatherCondition: WeatherCondition,
  weatherData: WeatherData | null
): WeatherIntensity => {
  if (!weatherData) return { visual: 0, particle: 0, opacity: 0 };

  const weatherId = weatherData.weather[0].id;
  const description = weatherData.weather[0].description.toLowerCase();
  const humidity = weatherData.main.humidity;

  switch (weatherCondition) {
    case "rain":
      // 비 강도 세분화
      if (weatherId === 500 || description.includes("light")) {
        return { visual: 0.4, particle: 300, opacity: 0.6 }; // 가벼운 비
      } else if (weatherId === 501 || description.includes("moderate")) {
        return { visual: 0.7, particle: 600, opacity: 0.8 }; // 보통 비
      } else if (weatherId >= 502 || description.includes("heavy")) {
        return { visual: 1.0, particle: 1000, opacity: 1.0 }; // 폭우
      }
      return { visual: 0.7, particle: 600, opacity: 0.8 };

    case "snow":
      if (description.includes("light")) {
        return { visual: 0.4, particle: 200, opacity: 0.7 };
      } else if (description.includes("heavy")) {
        return { visual: 1.0, particle: 500, opacity: 1.0 };
      }
      return { visual: 0.7, particle: 300, opacity: 0.8 };

    case "thunderstorm":
      return { visual: 1.0, particle: 800, opacity: 0.9 };

    case "drizzle":
      return { visual: 0.3, particle: 200, opacity: 0.5 };

    case "mist":
    case "fog":
      const fogIntensity = Math.min(humidity / 100, 0.8);
      return { visual: fogIntensity, particle: 150, opacity: fogIntensity };

    case "clouds":
      // OpenWeather 구름 분류에 따른 강도
      if (weatherId === 801) {
        return { visual: 0.2, particle: 0, opacity: 0.3 }; // few clouds
      } else if (weatherId === 802) {
        return { visual: 0.4, particle: 0, opacity: 0.5 }; // scattered clouds
      } else if (weatherId === 803) {
        return { visual: 0.7, particle: 0, opacity: 0.7 }; // broken clouds
      } else if (weatherId === 804) {
        return { visual: 1.0, particle: 0, opacity: 0.9 }; // overcast
      }
      return { visual: 0.5, particle: 0, opacity: 0.6 };

    case "clear":
      return { visual: 0, particle: 0, opacity: 0 };

    default:
      return { visual: 0.5, particle: 100, opacity: 0.5 };
  }
};

/**
 * WebGL 지원 여부를 확인하는 함수
 */
export const isWebGLSupported = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
};

/**
 * 로컬스토리지에서 안전하게 데이터를 가져오는 함수
 * @param key - 로컬스토리지 키
 * @param defaultValue - 기본값
 */
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === "undefined") return defaultValue;

    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`로컬스토리지에서 ${key} 읽기 실패:`, error);
    return defaultValue;
  }
};

/**
 * 로컬스토리지에 안전하게 데이터를 저장하는 함수
 * @param key - 로컬스토리지 키
 * @param value - 저장할 값
 */
export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    if (typeof window === "undefined") return;

    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`로컬스토리지에 ${key} 저장 실패:`, error);
  }
};

/**
 * 디바운스 함수 (API 호출 제한용)
 * @param func - 실행할 함수
 * @param delay - 지연 시간 (ms)
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
