// theme-system/types.ts

/**
 * 테마 모드 타입
 */
export type ThemeMode = "light" | "dark" | "sync";

/**
 * 시간대 타입 (일출/일몰 시간 기반으로 계산)
 */
export type TimeOfDay = "dawn" | "day" | "dusk" | "night";

/**
 * 날씨 조건 타입 (OpenWeather API 기반)
 */
export type WeatherCondition =
  | "clear" // 맑음
  | "clouds" // 구름
  | "rain" // 비
  | "drizzle" // 이슬비
  | "snow" // 눈
  | "thunderstorm" // 뇌우
  | "mist" // 연무
  | "fog"; // 안개

/**
 * OpenWeather API 응답 데이터 구조
 */
export interface WeatherData {
  main: {
    temp: number; // 온도 (°C)
    feels_like: number; // 체감온도
    humidity: number; // 습도 (%)
  };
  weather: Array<{
    id: number; // 날씨 ID (OpenWeather 코드)
    main: string; // 날씨 메인 카테고리
    description: string; // 날씨 설명
    icon: string; // 날씨 아이콘 코드
  }>;
  sys: {
    sunrise: number; // 일출 시간 (Unix timestamp)
    sunset: number; // 일몰 시간 (Unix timestamp)
  };
  name: string; // 도시명
}

/**
 * 3D 좌표 타입
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 날씨 효과 강도
 */
export interface WeatherIntensity {
  visual: number; // 시각 효과 강도 (0-1)
  particle: number; // 파티클 수
  opacity: number; // 투명도 (0-1)
}

/**
 * 테마 설정 옵션 (ThemeProvider에 전달)
 */
export interface ThemeConfig {
  /** OpenWeather API 키 (싱크 모드에서 필요) */
  apiKey?: string;

  /** 기본 테마 모드 */
  defaultTheme?: ThemeMode;

  /** 날씨 데이터 업데이트 간격 (밀리초) */
  updateInterval?: number;

  /** 위치 정보 사용 여부 */
  enableGeolocation?: boolean;

  /** 기본 위치 (위치정보 실패시 사용) */
  defaultLocation?: {
    lat: number; // 위도
    lon: number; // 경도
  };

  /** WebGL 사용 여부 */
  enableWebGL?: boolean;
}

/**
 * 테마 컨텍스트에서 제공하는 값들
 */
export interface ThemeContextType {
  /** 현재 테마 모드 */
  mode: ThemeMode;

  /** 테마 모드 변경 함수 */
  setMode: (mode: ThemeMode) => void;

  /** 다크모드 여부 */
  isDarkMode: boolean;

  /** 날씨 데이터 (싱크 모드에서만 사용) */
  weatherData: WeatherData | null;

  /** 현재 날씨 조건 */
  weatherCondition: WeatherCondition;

  /** 현재 시간대 */
  timeOfDay: TimeOfDay;

  /** 로딩 상태 */
  isLoading: boolean;

  /** 에러 메시지 */
  error: string | null;

  /** 테스트 모드 여부 (개발용) */
  isTestMode?: boolean;
}
