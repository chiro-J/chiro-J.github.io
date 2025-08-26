import React, { useState } from "react";
import { useTheme, useAutoTheme, useWeatherAPI } from "./useTheme";
import type { WeatherType, TimeOfDay } from "./theme.types";

interface ThemeToggleProps {
  variant?: "compact" | "full" | "floating";
  showAutoMode?: boolean;
  showWeatherAPI?: boolean;
  weatherAPIKey?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "full",
  showAutoMode = true,
  showWeatherAPI = true,
  weatherAPIKey,
}) => {
  const { currentTheme, setTheme, setWeather, setTimeOfDay } = useTheme();
  const { isAutoMode, toggleAutoMode } = useAutoTheme();
  const {
    weather: apiWeather,
    loading,
    error,
    fetchWeather,
  } = useWeatherAPI(weatherAPIKey);
  const [isOpen, setIsOpen] = useState(false);

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
    background: `rgba(255, 255, 255, ${
      variant === "floating" ? "0.1" : "0.05"
    })`,
    backdropFilter: "blur(10px)",
    border: `1px solid ${currentTheme.colors.accent}`,
    borderRadius: "12px",
    padding: variant === "compact" ? "8px" : "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    maxWidth: variant === "compact" ? "200px" : "350px",
    color: currentTheme.colors.text.primary,
  };

  const buttonStyle: React.CSSProperties = {
    background: `linear-gradient(45deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    margin: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  };

  const selectStyle: React.CSSProperties = {
    background: `rgba(255, 255, 255, 0.1)`,
    border: `1px solid ${currentTheme.colors.accent}`,
    borderRadius: "6px",
    padding: "6px 10px",
    margin: "4px",
    color: currentTheme.colors.text.primary,
    fontSize: "14px",
    cursor: "pointer",
  };

  if (variant === "compact") {
    return (
      <div style={containerStyle}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            value={currentTheme.weather}
            onChange={(e) => setWeather(e.target.value as WeatherType)}
            style={selectStyle}
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
      <div style={{ marginBottom: "12px", textAlign: "center" }}>
        <h3
          style={{
            margin: "0 0 8px 0",
            color: currentTheme.colors.text.primary,
          }}
        >
          🎨 Theme Control
        </h3>
        <div
          style={{
            background: `rgba(255, 255, 255, 0.1)`,
            padding: "8px",
            borderRadius: "6px",
            marginBottom: "12px",
          }}
        >
          <strong>{currentTheme.name}</strong>
          <div style={{ fontSize: "24px", margin: "4px 0" }}>
            {weatherEmojis[currentTheme.weather]}{" "}
            {timeEmojis[currentTheme.timeOfDay]}
          </div>
        </div>
      </div>

      {/* 실제 날씨 가져오기 */}
      {showWeatherAPI && weatherAPIKey && (
        <div style={{ marginBottom: "12px" }}>
          <button
            onClick={() => fetchWeather()}
            disabled={loading}
            style={{
              ...buttonStyle,
              width: "100%",
              background: loading
                ? `linear-gradient(45deg, #95A5A6, #7F8C8D)`
                : `linear-gradient(45deg, #27AE60, #2ECC71)`,
              justifyContent: "center",
            }}
          >
            {loading ? "🔄" : "🌍"}{" "}
            {loading ? "Loading..." : "Get Real Weather"}
          </button>
          {error && (
            <div
              style={{
                fontSize: "12px",
                color: "#E74C3C",
                marginTop: "4px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
          {apiWeather && (
            <div
              style={{
                fontSize: "12px",
                color: currentTheme.colors.text.secondary,
                textAlign: "center",
                marginTop: "4px",
              }}
            >
              Real weather: {weatherEmojis[apiWeather]} {apiWeather}
            </div>
          )}
        </div>
      )}

      {/* 날씨 선택 */}
      <div style={{ marginBottom: "12px" }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.8 }}>
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
                  currentTheme.weather === weather ? "scale(1.1)" : "scale(1)",
                fontSize: "12px",
                padding: "6px 10px",
              }}
            >
              {weatherEmojis[weather]} {weather}
            </button>
          ))}
        </div>
      </div>

      {/* 시간대 선택 */}
      <div style={{ marginBottom: "12px" }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.8 }}>
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
                  currentTheme.timeOfDay === time ? "scale(1.1)" : "scale(1)",
                fontSize: "12px",
                padding: "6px 10px",
              }}
            >
              {timeEmojis[time]} {time}
            </button>
          ))}
        </div>
      </div>

      {/* 자동 모드 (실시간 시간 추적) */}
      {showAutoMode && (
        <div style={{ marginBottom: "12px" }}>
          <button
            onClick={toggleAutoMode}
            style={{
              ...buttonStyle,
              background: isAutoMode
                ? `linear-gradient(45deg, #27AE60, #2ECC71)`
                : `linear-gradient(45deg, #7F8C8D, #95A5A6)`,
              width: "100%",
              justifyContent: "center",
            }}
          >
            {isAutoMode ? "🤖" : "⏰"} Auto Time: {isAutoMode ? "ON" : "OFF"}
          </button>
          <div
            style={{
              fontSize: "11px",
              color: currentTheme.colors.text.secondary,
              textAlign: "center",
              marginTop: "4px",
            }}
          >
            {isAutoMode ? "Time updates automatically" : "Manual time control"}
          </div>
        </div>
      )}

      {/* 랜덤 테마 */}
      <button
        onClick={() => {
          const randomWeather =
            weathers[Math.floor(Math.random() * weathers.length)];
          const randomTime = times[Math.floor(Math.random() * times.length)];
          setTheme(randomWeather, randomTime);
        }}
        style={{
          ...buttonStyle,
          width: "100%",
          background: `linear-gradient(45deg, #E91E63, #AD1457)`,
          justifyContent: "center",
        }}
      >
        🎲 Random Theme
      </button>
    </div>
  );
};
