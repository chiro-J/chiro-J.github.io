import React, { useState } from "react";
import { useTheme, useSmartMode } from "./useTheme";
import type { WeatherType, TimeOfDay } from "./theme.types";

interface ThemeToggleProps {
  variant?: "compact" | "full" | "floating";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "full",
}) => {
  const { currentTheme, setTheme, setWeather, setTimeOfDay } = useTheme();
  const { isSmartMode, isLoading, error, locationInfo, toggleSmartMode } =
    useSmartMode();

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

  const weatherEmojis: Record<WeatherType, string> = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    snowy: "❄️",
    stormy: "⛈️",
    foggy: "🌫️",
  };

  const timeEmojis: Record<TimeOfDay, string> = {
    dawn: "🌅",
    morning: "🌄",
    afternoon: "☀️",
    evening: "🌇",
    night: "🌙",
  };

  const containerStyle: React.CSSProperties = {
    position: variant === "floating" ? "fixed" : "relative",
    top: variant === "floating" ? "20px" : "auto",
    right: variant === "floating" ? "20px" : "auto",
    zIndex: 1000,
    background: `rgba(0, 0, 0, 0.15)`,
    backdropFilter: "blur(20px)",
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: "16px",
    padding: variant === "compact" ? "12px" : "20px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    maxWidth: variant === "compact" ? "240px" : "380px",
    color: currentTheme.colors.text.primary,
    transition: "all 0.3s ease",
  };

  const buttonStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${currentTheme.colors.primary}CC, ${currentTheme.colors.secondary}CC)`,
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "8px 14px",
    margin: "3px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  };

  const selectStyle: React.CSSProperties = {
    background: `rgba(255, 255, 255, 0.1)`,
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: "8px",
    padding: "8px 12px",
    margin: "4px",
    color: currentTheme.colors.text.primary,
    fontSize: "14px",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  };

  if (variant === "compact") {
    return (
      <div style={containerStyle}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            value={currentTheme.weather}
            onChange={(e) => setWeather(e.target.value as WeatherType)}
            style={selectStyle}
            disabled={isSmartMode}
          >
            {weathers.map((weather) => (
              <option key={weather} value={weather}>
                {weatherEmojis[weather]} {weather}
              </option>
            ))}
          </select>
          <select
            value={currentTheme.timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
            style={selectStyle}
            disabled={isSmartMode}
          >
            {times.map((time) => (
              <option key={time} value={time}>
                {timeEmojis[time]} {time}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* 헤더 */}
      <div style={{ marginBottom: "16px", textAlign: "center" }}>
        <h3
          style={{
            margin: "0 0 8px 0",
            color: currentTheme.colors.text.primary,
            fontSize: "1.1rem",
            fontWeight: "600",
          }}
        >
          🎨 Theme Studio
        </h3>

        {/* 현재 테마 표시 */}
        <div
          style={{
            background: `rgba(255, 255, 255, 0.08)`,
            padding: "12px",
            borderRadius: "12px",
            marginBottom: "16px",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "8px" }}>
            {currentTheme.name}
          </div>
          <div style={{ fontSize: "28px", margin: "8px 0" }}>
            {weatherEmojis[currentTheme.weather]}{" "}
            {timeEmojis[currentTheme.timeOfDay]}
          </div>

          {/* 위치 정보 (스마트 모드 시) */}
          {isSmartMode && locationInfo.city && (
            <div
              style={{
                fontSize: "11px",
                opacity: 0.7,
                color: currentTheme.colors.text.secondary,
              }}
            >
              📍 {locationInfo.city}, {locationInfo.country}
            </div>
          )}
        </div>
      </div>

      {/* 🤖 스마트 모드 (통합된 자동 기능) */}
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={toggleSmartMode}
          disabled={isLoading}
          style={{
            ...buttonStyle,
            background: isSmartMode
              ? `linear-gradient(135deg, #10B981, #059669)`
              : `linear-gradient(135deg, #6B7280, #4B5563)`,
            width: "100%",
            justifyContent: "center",
            padding: "12px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {isLoading ? (
            <>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              Updating...
            </>
          ) : (
            <>
              {isSmartMode ? "🤖" : "⚡"} Smart Mode:{" "}
              {isSmartMode ? "ON" : "OFF"}
            </>
          )}
        </button>

        {/* 스마트 모드 설명 */}
        <div
          style={{
            fontSize: "11px",
            color: currentTheme.colors.text.secondary,
            textAlign: "center",
            marginTop: "6px",
            lineHeight: 1.3,
          }}
        >
          {isSmartMode
            ? "🕐 Auto time + 🌍 Real weather sync"
            : "Enable for automatic time & weather updates"}
        </div>

        {/* 에러 표시 */}
        {error && (
          <div
            style={{
              fontSize: "11px",
              color: "#EF4444",
              textAlign: "center",
              marginTop: "6px",
              padding: "6px",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "6px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* 수동 컨트롤 (스마트 모드 비활성화 시만) */}
      {!isSmartMode && (
        <>
          {/* 날씨 선택 */}
          <div style={{ marginBottom: "14px" }}>
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: "13px",
                opacity: 0.8,
                fontWeight: "500",
              }}
            >
              Weather
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {weathers.map((weather) => (
                <button
                  key={weather}
                  onClick={() => setWeather(weather)}
                  style={{
                    ...buttonStyle,
                    opacity: currentTheme.weather === weather ? 1 : 0.6,
                    transform:
                      currentTheme.weather === weather
                        ? "scale(1.05)"
                        : "scale(1)",
                    fontSize: "12px",
                    padding: "6px 10px",
                    background:
                      currentTheme.weather === weather
                        ? `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`
                        : `rgba(255, 255, 255, 0.15)`,
                  }}
                >
                  {weatherEmojis[weather]} {weather}
                </button>
              ))}
            </div>
          </div>

          {/* 시간대 선택 */}
          <div style={{ marginBottom: "14px" }}>
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: "13px",
                opacity: 0.8,
                fontWeight: "500",
              }}
            >
              Time of Day
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {times.map((time) => (
                <button
                  key={time}
                  onClick={() => setTimeOfDay(time)}
                  style={{
                    ...buttonStyle,
                    opacity: currentTheme.timeOfDay === time ? 1 : 0.6,
                    transform:
                      currentTheme.timeOfDay === time
                        ? "scale(1.05)"
                        : "scale(1)",
                    fontSize: "12px",
                    padding: "6px 10px",
                    background:
                      currentTheme.timeOfDay === time
                        ? `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`
                        : `rgba(255, 255, 255, 0.15)`,
                  }}
                >
                  {timeEmojis[time]} {time}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 랜덤 테마 */}
      <button
        onClick={() => {
          if (!isSmartMode) {
            const randomWeather =
              weathers[Math.floor(Math.random() * weathers.length)];
            const randomTime = times[Math.floor(Math.random() * times.length)];
            setTheme(randomWeather, randomTime);
          }
        }}
        disabled={isSmartMode}
        style={{
          ...buttonStyle,
          width: "100%",
          background: isSmartMode
            ? `rgba(107, 114, 128, 0.5)`
            : `linear-gradient(135deg, #EC4899, #BE185D)`,
          justifyContent: "center",
          fontWeight: "600",
          cursor: isSmartMode ? "not-allowed" : "pointer",
          opacity: isSmartMode ? 0.5 : 1,
        }}
      >
        🎲 Random Theme
      </button>

      {/* 랜덤 버튼 설명 */}
      {isSmartMode && (
        <div
          style={{
            fontSize: "10px",
            color: currentTheme.colors.text.secondary,
            textAlign: "center",
            marginTop: "4px",
            opacity: 0.6,
          }}
        >
          Disable Smart Mode to use manual controls
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `,
        }}
      />
    </div>
  );
};
