import React, { createContext, useState, useEffect, ReactNode } from "react";
import type {
  ThemeContextType,
  WeatherType,
  TimeOfDay,
  ThemeConfig,
  ThemeKey,
} from "./theme.types";
import {
  createAllThemes,
  createThemeKey,
  getCurrentTimeOfDay,
  applyThemeToCSS,
} from "./theme.utils";

// 컨텍스트 생성
export const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  defaultWeather?: WeatherType;
  defaultTimeOfDay?: TimeOfDay;
  persistTheme?: boolean;
  autoInitialize?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultWeather = "sunny",
  defaultTimeOfDay = "morning",
  persistTheme = true,
  autoInitialize = false,
}) => {
  // 모든 테마 설정 생성
  const availableThemes = createAllThemes();

  // 초기 테마 설정
  const getInitialTheme = (): ThemeConfig => {
    // 저장된 테마가 있는 경우
    if (persistTheme) {
      const savedTheme = localStorage.getItem("current-theme");
      if (savedTheme) {
        try {
          const { weather, timeOfDay } = JSON.parse(savedTheme);
          const themeKey = createThemeKey(weather, timeOfDay);
          if (availableThemes[themeKey]) {
            return availableThemes[themeKey];
          }
        } catch (error) {
          console.warn("Failed to load saved theme:", error);
        }
      }
    }

    // 자동 초기화가 활성화된 경우
    if (autoInitialize) {
      const currentTime = getCurrentTimeOfDay();
      const themeKey = createThemeKey(defaultWeather, currentTime);
      return availableThemes[themeKey];
    }

    // 기본 테마 사용
    const themeKey = createThemeKey(defaultWeather, defaultTimeOfDay);
    return availableThemes[themeKey];
  };

  const [currentTheme, setCurrentTheme] =
    useState<ThemeConfig>(getInitialTheme);

  // 테마 변경 함수
  const setTheme = (weather: WeatherType, timeOfDay: TimeOfDay) => {
    const themeKey = createThemeKey(weather, timeOfDay);
    const newTheme = availableThemes[themeKey];

    if (newTheme) {
      setCurrentTheme(newTheme);

      // 로컬 스토리지에 저장
      if (persistTheme) {
        localStorage.setItem(
          "current-theme",
          JSON.stringify({ weather, timeOfDay })
        );
      }
    }
  };

  // 날씨만 변경
  const setWeather = (weather: WeatherType) => {
    setTheme(weather, currentTheme.timeOfDay);
  };

  // 시간대만 변경
  const setTimeOfDay = (timeOfDay: TimeOfDay) => {
    setTheme(currentTheme.weather, timeOfDay);
  };

  // CSS 변수 적용
  useEffect(() => {
    applyThemeToCSS(currentTheme);

    // body에 테마 클래스 추가
    document.body.className = `theme-${currentTheme.weather} time-${currentTheme.timeOfDay}`;

    // 메타 테마 컬러 설정 (모바일)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", currentTheme.colors.primary);
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = currentTheme.colors.primary;
      document.head.appendChild(meta);
    }

    // 페이지 타이틀에 테마 정보 추가 (선택사항)
    const originalTitle = document.title.split(" - ")[0];
    document.title = `${originalTitle} - ${currentTheme.name}`;

    return () => {
      // 클린업
      document.body.className = "";
    };
  }, [currentTheme]);

  // 컨텍스트 값
  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    setWeather,
    setTimeOfDay,
    availableThemes,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className="theme-container"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.background.start}, ${currentTheme.colors.background.end})`,
          minHeight: "100vh",
          transition: "all 0.3s ease-in-out",
          color: currentTheme.colors.text.primary,
          position: "relative",
        }}
      >
        {/* 오버레이 효과 */}
        {currentTheme.colors.overlay && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: currentTheme.colors.overlay,
              pointerEvents: "none",
              zIndex: -1,
            }}
          />
        )}

        {/* 자식 컴포넌트들 */}
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
