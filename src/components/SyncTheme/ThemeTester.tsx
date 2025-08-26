import React, { useState } from "react";
import { useTheme } from "./useTheme";
import type { WeatherType, TimeOfDay, ThemeConfig } from "./theme.types";

interface ThemeTesterProps {
  showPreview?: boolean;
  compactMode?: boolean;
}

export const ThemeTester: React.FC<ThemeTesterProps> = ({
  showPreview = true,
  compactMode = false,
}) => {
  const { currentTheme, availableThemes, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);
  const [filterWeather, setFilterWeather] = useState<WeatherType | "all">(
    "all"
  );
  const [filterTime, setFilterTime] = useState<TimeOfDay | "all">("all");

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

  // 필터링된 테마 목록
  const filteredThemes = Object.values(availableThemes).filter((theme) => {
    const weatherMatch =
      filterWeather === "all" || theme.weather === filterWeather;
    const timeMatch = filterTime === "all" || theme.timeOfDay === filterTime;
    return weatherMatch && timeMatch;
  });

  // 테마 카드 스타일
  const getCardStyle = (
    theme: ThemeConfig,
    isSelected: boolean,
    isCurrent: boolean
  ): React.CSSProperties => ({
    background: `linear-gradient(135deg, ${theme.colors.background.start}, ${theme.colors.background.end})`,
    border: isCurrent
      ? `3px solid ${currentTheme.colors.primary}`
      : isSelected
      ? `2px solid ${theme.colors.primary}`
      : `1px solid ${theme.colors.accent}`,
    borderRadius: compactMode ? "8px" : "12px",
    padding: compactMode ? "12px" : "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: isCurrent
      ? `0 8px 24px ${currentTheme.colors.primary}40`
      : isSelected
      ? `0 6px 20px ${theme.colors.primary}30`
      : "0 2px 8px rgba(0, 0, 0, 0.1)",
    transform: isCurrent
      ? "scale(1.05)"
      : isSelected
      ? "scale(1.02)"
      : "scale(1)",
    position: "relative",
    overflow: "hidden",
    color: theme.colors.text.primary,
    minHeight: compactMode ? "80px" : "120px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  });

  const containerStyle: React.CSSProperties = {
    background: `rgba(255, 255, 255, 0.05)`,
    backdropFilter: "blur(10px)",
    border: `1px solid ${currentTheme.colors.accent}`,
    borderRadius: "16px",
    padding: "24px",
    margin: "20px 0",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  };

  return (
    <div style={containerStyle}>
      <h2
        style={{
          textAlign: "center",
          margin: "0 0 24px 0",
          color: currentTheme.colors.text.primary,
          fontSize: compactMode ? "1.5rem" : "2rem",
        }}
      >
        🧪 WebGL Theme Laboratory
      </h2>

      {/* 필터 컨트롤 */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              color: currentTheme.colors.text.secondary,
              fontSize: "14px",
            }}
          >
            Weather:
          </label>
          <select
            value={filterWeather}
            onChange={(e) =>
              setFilterWeather(e.target.value as WeatherType | "all")
            }
            style={{
              background: `rgba(255, 255, 255, 0.1)`,
              border: `1px solid ${currentTheme.colors.accent}`,
              borderRadius: "6px",
              padding: "6px 12px",
              color: currentTheme.colors.text.primary,
              fontSize: "14px",
            }}
          >
            <option value="all">All Weather</option>
            {weathers.map((weather) => (
              <option key={weather} value={weather}>
                {weatherEmojis[weather]}{" "}
                {weather.charAt(0).toUpperCase() + weather.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            style={{
              color: currentTheme.colors.text.secondary,
              fontSize: "14px",
            }}
          >
            Time:
          </label>
          <select
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value as TimeOfDay | "all")}
            style={{
              background: `rgba(255, 255, 255, 0.1)`,
              border: `1px solid ${currentTheme.colors.accent}`,
              borderRadius: "6px",
              padding: "6px 12px",
              color: currentTheme.colors.text.primary,
              fontSize: "14px",
            }}
          >
            <option value="all">All Times</option>
            {times.map((time) => (
              <option key={time} value={time}>
                {timeEmojis[time]}{" "}
                {time.charAt(0).toUpperCase() + time.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            background: `rgba(255, 255, 255, 0.1)`,
            padding: "8px 12px",
            borderRadius: "20px",
            fontSize: "14px",
            color: currentTheme.colors.text.secondary,
          }}
        >
          {filteredThemes.length} themes • WebGL Ready
        </div>
      </div>

      {/* 테마 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${
            compactMode ? "120px" : "160px"
          }, 1fr))`,
          gap: compactMode ? "12px" : "16px",
          marginBottom: showPreview ? "24px" : "0",
        }}
      >
        {filteredThemes.map((theme) => {
          const isCurrent =
            theme.weather === currentTheme.weather &&
            theme.timeOfDay === currentTheme.timeOfDay;
          const isSelected = selectedTheme === theme;

          return (
            <div
              key={`${theme.weather}-${theme.timeOfDay}`}
              style={getCardStyle(theme, isSelected, isCurrent)}
              onClick={() => {
                setSelectedTheme(theme);
                setTheme(theme.weather, theme.timeOfDay);
              }}
              onMouseEnter={() => !isCurrent && setSelectedTheme(theme)}
              onMouseLeave={() => setSelectedTheme(null)}
            >
              {/* 현재 테마 표시 */}
              {isCurrent && (
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: currentTheme.colors.primary,
                    color: "white",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </div>
              )}

              {/* 테마 오버레이 */}
              {theme.colors.overlay && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: theme.colors.overlay,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* 테마 내용 */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontSize: compactMode ? "1.5rem" : "2rem",
                    marginBottom: compactMode ? "4px" : "8px",
                  }}
                >
                  {weatherEmojis[theme.weather]} {timeEmojis[theme.timeOfDay]}
                </div>
                <div
                  style={{
                    fontSize: compactMode ? "10px" : "12px",
                    fontWeight: "500",
                    opacity: 0.9,
                    lineHeight: 1.2,
                  }}
                >
                  {theme.weather.charAt(0).toUpperCase() +
                    theme.weather.slice(1)}
                  <br />
                  {theme.timeOfDay.charAt(0).toUpperCase() +
                    theme.timeOfDay.slice(1)}
                </div>

                {!compactMode && (
                  <div
                    style={{
                      fontSize: "9px",
                      opacity: 0.7,
                      marginTop: "4px",
                      background: "rgba(0,0,0,0.3)",
                      padding: "2px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    WebGL Ready
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 선택된 테마 미리보기 */}
      {showPreview && selectedTheme && (
        <div
          style={{
            background: `linear-gradient(135deg, ${selectedTheme.colors.background.start}, ${selectedTheme.colors.background.end})`,
            border: `2px solid ${selectedTheme.colors.primary}`,
            borderRadius: "12px",
            padding: "20px",
            position: "relative",
            overflow: "hidden",
            color: selectedTheme.colors.text.primary,
          }}
        >
          {/* 미리보기 오버레이 */}
          {selectedTheme.colors.overlay && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: selectedTheme.colors.overlay,
                pointerEvents: "none",
              }}
            />
          )}

          <div style={{ position: "relative", zIndex: 1 }}>
            <h3
              style={{
                margin: "0 0 16px 0",
                textAlign: "center",
                fontSize: "1.5rem",
              }}
            >
              🎬 WebGL Preview: {selectedTheme.name}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {/* WebGL 효과 정보 */}
              <div>
                <h4 style={{ margin: "0 0 8px 0", opacity: 0.8 }}>
                  Active WebGL Effects
                </h4>
                <div style={{ fontSize: "14px" }}>
                  <div>
                    ☀️ Celestial Bodies:{" "}
                    {selectedTheme.timeOfDay === "night" ||
                    selectedTheme.timeOfDay === "dawn"
                      ? "Moon + Stars"
                      : "Sun"}
                  </div>
                  <div>☁️ Animated Clouds</div>
                  <div>
                    ✨ Weather Particles:{" "}
                    {selectedTheme.effects?.particles || "None"}
                  </div>
                  <div>🌈 Dynamic Sky Colors</div>
                </div>
              </div>

              {/* 색상 정보 */}
              <div>
                <h4 style={{ margin: "0 0 8px 0", opacity: 0.8 }}>
                  Theme Colors
                </h4>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: selectedTheme.colors.primary,
                        borderRadius: "6px",
                        margin: "0 auto 4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    />
                    <span style={{ fontSize: "10px" }}>Primary</span>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: selectedTheme.colors.secondary,
                        borderRadius: "6px",
                        margin: "0 auto 4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    />
                    <span style={{ fontSize: "10px" }}>Secondary</span>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: selectedTheme.colors.accent,
                        borderRadius: "6px",
                        margin: "0 auto 4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    />
                    <span style={{ fontSize: "10px" }}>Accent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 적용 버튼 */}
            <button
              onClick={() =>
                setTheme(selectedTheme.weather, selectedTheme.timeOfDay)
              }
              style={{
                background: `linear-gradient(45deg, ${selectedTheme.colors.primary}, ${selectedTheme.colors.secondary})`,
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "14px 28px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                marginTop: "16px",
                display: "block",
                margin: "16px auto 0",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}
            >
              🚀 Apply WebGL Theme
            </button>
          </div>
        </div>
      )}

      {/* 통계 및 도움말 */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: `rgba(255, 255, 255, 0.05)`,
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "14px",
          color: currentTheme.colors.text.secondary,
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          📊 <strong>WebGL Theme System</strong>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <span>🎨 30 Themes</span>
          <span>🌦️ 6 Weather Types</span>
          <span>🕐 5 Time Periods</span>
          <span>✨ Real-time Effects</span>
        </div>
        <div style={{ fontSize: "12px", opacity: 0.8 }}>
          💡 Each theme includes animated sun/moon movement, weather particles,
          and dynamic cloud systems
        </div>
      </div>
    </div>
  );
};

export default ThemeTester;
