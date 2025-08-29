// 시간 타입
export type TimeOfDay = "dawn" | "morning" | "afternoon" | "evening" | "night";

// 날씨 타입
export type WeatherType =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "stormy"
  | "foggy";

// 테마 조합 타입
export type ThemeKey = `${WeatherType}-${TimeOfDay}`;

// 색상 팔레트 인터페이스
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    start: string;
    end: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  overlay?: string;
}

// 테마 설정 인터페이스 (메인)
export interface ThemeConfig {
  name: string;
  weather: WeatherType;
  timeOfDay: TimeOfDay;
  colors: ColorPalette;
  effects?: {
    particles?: "rain" | "snow" | "fog" | "stars";
    intensity?: "light" | "medium" | "heavy";
  };
}

// 테마 컨텍스트 인터페이스
export interface ThemeContextType {
  currentTheme: ThemeConfig;
  setTheme: (weather: WeatherType, timeOfDay: TimeOfDay) => void;
  setWeather: (weather: WeatherType) => void;
  setTimeOfDay: (timeOfDay: TimeOfDay) => void;
  availableThemes: Record<ThemeKey, ThemeConfig>;
}

// 자동 테마 설정 옵션
export interface AutoThemeOptions {
  useRealTime?: boolean;
  useGeolocation?: boolean;
  weatherAPI?: string;
}
