import type {
  WeatherType,
  TimeOfDay,
  ThemeKey,
  ThemeConfig,
  ColorPalette,
} from "./theme.types";

// 현재 시간을 기반으로 TimeOfDay 반환
export const getCurrentTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
};

// 테마 키 생성
export const createThemeKey = (
  weather: WeatherType,
  timeOfDay: TimeOfDay
): ThemeKey => {
  return `${weather}-${timeOfDay}`;
};

// 색상 팔레트 정의
const colorPalettes: Record<string, ColorPalette> = {
  // 맑음 - 시간대별
  "sunny-dawn": {
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    accent: "#FFE66D",
    background: { start: "#FF9A8B", end: "#A8E6CF" },
    text: { primary: "#2C3E50", secondary: "#34495E" },
  },
  "sunny-morning": {
    primary: "#3498DB",
    secondary: "#E74C3C",
    accent: "#F39C12",
    background: { start: "#87CEEB", end: "#98FB98" },
    text: { primary: "#2C3E50", secondary: "#34495E" },
  },
  "sunny-afternoon": {
    primary: "#E67E22",
    secondary: "#3498DB",
    accent: "#F1C40F",
    background: { start: "#FFD700", end: "#87CEFA" },
    text: { primary: "#2C3E50", secondary: "#34495E" },
  },
  "sunny-evening": {
    primary: "#E74C3C",
    secondary: "#9B59B6",
    accent: "#F39C12",
    background: { start: "#FF7F50", end: "#DDA0DD" },
    text: { primary: "#2C3E50", secondary: "#34495E" },
  },
  "sunny-night": {
    primary: "#9B59B6",
    secondary: "#34495E",
    accent: "#F1C40F",
    background: { start: "#191970", end: "#4B0082" },
    text: { primary: "#ECF0F1", secondary: "#BDC3C7" },
  },

  // 흐림 - 시간대별
  "cloudy-dawn": {
    primary: "#95A5A6",
    secondary: "#7F8C8D",
    accent: "#BDC3C7",
    background: { start: "#D3D3D3", end: "#A9A9A9" },
    text: { primary: "#2C3E50", secondary: "#34495E" },
  },
  "cloudy-morning": {
    primary: "#7F8C8D",
    secondary: "#95A5A6",
    accent: "#BDC3C7",
    background: { start: "#B0C4DE", end: "#D3D3D3" },
    text: { primary: "#2C3E50", secondary: "#34495E" },
  },
  "cloudy-afternoon": {
    primary: "#95A5A6",
    secondary: "#7F8C8D",
    accent: "#ECF0F1",
    background: { start: "#C0C0C0", end: "#A9A9A9" },
    text: { primary: "#2C3E50", secondary: "#34495E" },
  },
  "cloudy-evening": {
    primary: "#7F8C8D",
    secondary: "#95A5A6",
    accent: "#BDC3C7",
    background: { start: "#696969", end: "#2F4F4F" },
    text: { primary: "#ECF0F1", secondary: "#BDC3C7" },
  },
  "cloudy-night": {
    primary: "#34495E",
    secondary: "#2C3E50",
    accent: "#7F8C8D",
    background: { start: "#2C3E50", end: "#34495E" },
    text: { primary: "#ECF0F1", secondary: "#BDC3C7" },
  },

  // 비 - 시간대별
  "rainy-dawn": {
    primary: "#3498DB",
    secondary: "#2980B9",
    accent: "#5DADE2",
    background: { start: "#85C1E9", end: "#5499C7" },
    text: { primary: "#1B4F72", secondary: "#2E86C1" },
    overlay: "rgba(52, 152, 219, 0.1)",
  },
  "rainy-morning": {
    primary: "#2980B9",
    secondary: "#3498DB",
    accent: "#AED6F1",
    background: { start: "#5499C7", end: "#2E86C1" },
    text: { primary: "#1B4F72", secondary: "#21618C" },
    overlay: "rgba(41, 128, 185, 0.15)",
  },
  "rainy-afternoon": {
    primary: "#2E86C1",
    secondary: "#2980B9",
    accent: "#85C1E9",
    background: { start: "#3498DB", end: "#2980B9" },
    text: { primary: "#FFFFFF", secondary: "#AED6F1" },
    overlay: "rgba(46, 134, 193, 0.2)",
  },
  "rainy-evening": {
    primary: "#21618C",
    secondary: "#1B4F72",
    accent: "#5499C7",
    background: { start: "#2E86C1", end: "#1B4F72" },
    text: { primary: "#FFFFFF", secondary: "#85C1E9" },
    overlay: "rgba(33, 97, 140, 0.25)",
  },
  "rainy-night": {
    primary: "#1B4F72",
    secondary: "#154360",
    accent: "#2E86C1",
    background: { start: "#154360", end: "#0E2A44" },
    text: { primary: "#AED6F1", secondary: "#85C1E9" },
    overlay: "rgba(27, 79, 114, 0.3)",
  },

  // 눈 - 시간대별
  "snowy-dawn": {
    primary: "#ECF0F1",
    secondary: "#BDC3C7",
    accent: "#85C1E9",
    background: { start: "#F8F9FA", end: "#E9ECEF" },
    text: { primary: "#2C3E50", secondary: "#34495E" },
    overlay: "rgba(236, 240, 241, 0.1)",
  },
  "snowy-morning": {
    primary: "#BDC3C7",
    secondary: "#95A5A6",
    accent: "#AED6F1",
    background: { start: "#E9ECEF", end: "#DEE2E6" },
    text: { primary: "#2C3E50", secondary: "#34495E" },
    overlay: "rgba(189, 195, 199, 0.15)",
  },
  "snowy-afternoon": {
    primary: "#95A5A6",
    secondary: "#7F8C8D",
    accent: "#D5DBDB",
    background: { start: "#DEE2E6", end: "#CED4DA" },
    text: { primary: "#2C3E50", secondary: "#34495E" },
    overlay: "rgba(149, 165, 166, 0.2)",
  },
  "snowy-evening": {
    primary: "#7F8C8D",
    secondary: "#566573",
    accent: "#AEB6BF",
    background: { start: "#CED4DA", end: "#ADB5BD" },
    text: { primary: "#212529", secondary: "#495057" },
    overlay: "rgba(127, 140, 141, 0.25)",
  },
  "snowy-night": {
    primary: "#566573",
    secondary: "#34495E",
    accent: "#85929E",
    background: { start: "#6C757D", end: "#495057" },
    text: { primary: "#F8F9FA", secondary: "#E9ECEF" },
    overlay: "rgba(86, 101, 115, 0.3)",
  },

  // 폭풍 - 시간대별
  "stormy-dawn": {
    primary: "#8E44AD",
    secondary: "#9B59B6",
    accent: "#BB8FCE",
    background: { start: "#6C3483", end: "#4A235A" },
    text: { primary: "#F8F9FA", secondary: "#D2B4DE" },
    overlay: "rgba(142, 68, 173, 0.2)",
  },
  "stormy-morning": {
    primary: "#7D3C98",
    secondary: "#8E44AD",
    accent: "#A569BD",
    background: { start: "#5B2C87", end: "#4A235A" },
    text: { primary: "#F8F9FA", secondary: "#D2B4DE" },
    overlay: "rgba(125, 60, 152, 0.25)",
  },
  "stormy-afternoon": {
    primary: "#6C3483",
    secondary: "#7D3C98",
    accent: "#8E44AD",
    background: { start: "#5B2C87", end: "#4A235A" },
    text: { primary: "#FFFFFF", secondary: "#D2B4DE" },
    overlay: "rgba(108, 52, 131, 0.3)",
  },
  "stormy-evening": {
    primary: "#5B2C87",
    secondary: "#6C3483",
    accent: "#7D3C98",
    background: { start: "#4A235A", end: "#341739" },
    text: { primary: "#FFFFFF", secondary: "#BB8FCE" },
    overlay: "rgba(91, 44, 135, 0.35)",
  },
  "stormy-night": {
    primary: "#4A235A",
    secondary: "#341739",
    accent: "#5B2C87",
    background: { start: "#341739", end: "#1D0A23" },
    text: { primary: "#E8DAEF", secondary: "#BB8FCE" },
    overlay: "rgba(74, 35, 90, 0.4)",
  },

  // 안개 - 시간대별
  "foggy-dawn": {
    primary: "#B2BEB5",
    secondary: "#A8A8A8",
    accent: "#D3D3D3",
    background: { start: "#E6E6FA", end: "#D3D3D3" },
    text: { primary: "#2F4F4F", secondary: "#696969" },
    overlay: "rgba(178, 190, 181, 0.3)",
  },
  "foggy-morning": {
    primary: "#A8A8A8",
    secondary: "#999999",
    accent: "#C0C0C0",
    background: { start: "#D3D3D3", end: "#C0C0C0" },
    text: { primary: "#2F4F4F", secondary: "#696969" },
    overlay: "rgba(168, 168, 168, 0.35)",
  },
  "foggy-afternoon": {
    primary: "#999999",
    secondary: "#808080",
    accent: "#B8B8B8",
    background: { start: "#C0C0C0", end: "#A9A9A9" },
    text: { primary: "#2F4F4F", secondary: "#696969" },
    overlay: "rgba(153, 153, 153, 0.4)",
  },
  "foggy-evening": {
    primary: "#808080",
    secondary: "#696969",
    accent: "#A9A9A9",
    background: { start: "#A9A9A9", end: "#808080" },
    text: { primary: "#F5F5F5", secondary: "#DCDCDC" },
    overlay: "rgba(128, 128, 128, 0.45)",
  },
  "foggy-night": {
    primary: "#696969",
    secondary: "#2F4F4F",
    accent: "#808080",
    background: { start: "#696969", end: "#2F4F4F" },
    text: { primary: "#F5F5F5", secondary: "#DCDCDC" },
    overlay: "rgba(105, 105, 105, 0.5)",
  },
};

// 모든 테마 설정 생성
export const createAllThemes = (): Record<ThemeKey, ThemeConfig> => {
  const themes = {} as Record<ThemeKey, ThemeConfig>; // Proper type assertion

  const weathers: WeatherType[] = [
    "sunny",
    "cloudy",
    "rainy",
    "snowy",
    "stormy",
    "foggy",
  ];
  const times: TimeOfDay[] = [
    "dawn",
    "morning",
    "afternoon",
    "evening",
    "night",
  ];

  weathers.forEach((weather) => {
    times.forEach((timeOfDay) => {
      const key = createThemeKey(weather, timeOfDay);
      const colors = colorPalettes[key];

      if (colors) {
        // Add safety check
        themes[key] = {
          name: `${weather.charAt(0).toUpperCase() + weather.slice(1)} ${
            timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)
          }`,
          weather,
          timeOfDay,
          colors,
          effects: getEffectsForWeather(weather),
        };
      }
    });
  });

  return themes;
};

// 날씨별 효과 설정
const getEffectsForWeather = (weather: WeatherType) => {
  switch (weather) {
    case "rainy":
      return { particles: "rain" as const, intensity: "medium" as const };
    case "snowy":
      return { particles: "snow" as const, intensity: "medium" as const };
    case "stormy":
      return { particles: "rain" as const, intensity: "heavy" as const };
    case "foggy":
      return { particles: "fog" as const, intensity: "light" as const };
    case "sunny":
      return { particles: "stars" as const, intensity: "light" as const };
    default:
      return undefined;
  }
};

// CSS 변수로 테마 적용
export const applyThemeToCSS = (theme: ThemeConfig) => {
  const root = document.documentElement;

  root.style.setProperty("--color-primary", theme.colors.primary);
  root.style.setProperty("--color-secondary", theme.colors.secondary);
  root.style.setProperty("--color-accent", theme.colors.accent);
  root.style.setProperty("--color-bg-start", theme.colors.background.start);
  root.style.setProperty("--color-bg-end", theme.colors.background.end);
  root.style.setProperty("--color-text-primary", theme.colors.text.primary);
  root.style.setProperty("--color-text-secondary", theme.colors.text.secondary);

  if (theme.colors.overlay) {
    root.style.setProperty("--color-overlay", theme.colors.overlay);
  }
};
