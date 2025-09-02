import React, { useState, useEffect } from "react";
import { useTheme, useSmartMode } from "./useTheme";
import type { WeatherType, TimeOfDay } from "./theme.types";

interface ThemeToggleProps {
  variant?: "compact" | "full" | "floating";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "full",
}) => {
  const { currentTheme, setTheme, setWeather, setTimeOfDay } = useTheme();
  const {
    isSmartMode,
    isLoading,
    error,
    debugInfo,
    locationInfo,
    toggleSmartMode,
    updateSmartTheme,
  } = useSmartMode();

  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // 간단한 페이드 효과를 위한 상태
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 디바이스별 폰트 크기 계산
  const getResponsiveFontSize = () => {
    if (isMobile) return "16px";
    if (isTablet) return "18px";
    return "20px"; // PC
  };

  // 디바이스별 박스 크기 계산 (내용에 맞게 더 크게 조정)
  const getResponsiveBoxWidth = () => {
    const screenWidth = window.innerWidth;

    if (isMobile) {
      // 모바일에서는 화면 너비의 85% 또는 최대 280px
      return Math.min(screenWidth * 0.85, 280) + "px";
    }
    if (isTablet) {
      // 태블릿에서는 화면 너비의 65% 또는 최대 320px
      return Math.min(screenWidth * 0.65, 320) + "px";
    }
    // PC에서는 고정 크기 더 크게
    return "340px";
  };

  // 모바일/태블릿/PC 감지
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      // 모바일에서는 기본적으로 접어둠
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    checkDeviceType();
    window.addEventListener("resize", checkDeviceType);
    return () => window.removeEventListener("resize", checkDeviceType);
  }, []);

  // 부드러운 전환 함수들
  const smoothSetWeather = (weather: WeatherType) => {
    if (isTransitioning || isSmartMode) return;

    setIsTransitioning(true);

    // 0.3초 페이드 아웃
    setTimeout(() => {
      setWeather(weather);

      // 0.3초 후 페이드 인
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  const smoothSetTimeOfDay = (timeOfDay: TimeOfDay) => {
    if (isTransitioning || isSmartMode) return;

    setIsTransitioning(true);

    setTimeout(() => {
      setTimeOfDay(timeOfDay);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  const smoothSetTheme = (weather: WeatherType, timeOfDay: TimeOfDay) => {
    if (isTransitioning || isSmartMode) return;

    setIsTransitioning(true);

    setTimeout(() => {
      setTheme(weather, timeOfDay);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  // 실시간 시계 업데이트 (1초마다)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    top: variant === "floating" ? (isMobile ? "10px" : "20px") : "auto",
    right: variant === "floating" ? (isMobile ? "10px" : "20px") : "auto",
    zIndex: 1000,
    background: `rgba(0, 0, 0, 0.15)`,
    backdropFilter: "blur(20px)",
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: isMobile ? "12px" : "16px",
    padding: isCollapsed ? "6px" : isMobile ? "16px" : "20px", // 접힌 상태 패딩 최소화
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    maxWidth: isCollapsed ? "auto" : isMobile ? "280px" : "420px", // 접힌 상태 width 자동 조정
    width: isCollapsed ? "auto" : isMobile ? "auto" : "100%", // 접힌 상태 width 최소화
    color: currentTheme.colors.text.primary,
    transition: "all 0.6s ease",
    opacity: isTransitioning ? 0.5 : 1,
    transform: isCollapsed && isMobile ? "scale(0.95)" : "scale(1)",
  };

  const buttonStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${currentTheme.colors.primary}CC, ${currentTheme.colors.secondary}CC)`,
    color: "white",
    border: "none",
    borderRadius: isMobile ? "8px" : "10px",
    padding: isMobile ? "6px 10px" : "8px 14px",
    margin: "3px",
    cursor: "pointer",
    fontSize: isMobile ? "11px" : "13px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: isMobile ? "4px" : "6px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  };

  const selectStyle: React.CSSProperties = {
    background: `rgba(255, 255, 255, 0.1)`,
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: isMobile ? "6px" : "8px",
    padding: isMobile ? "6px 8px" : "8px 12px",
    margin: "4px",
    color: currentTheme.colors.text.primary,
    fontSize: isMobile ? "12px" : "14px",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    width: isMobile ? "100%" : "auto",
  };

  // 실시간 시간 표시
  const getCurrentTimeString = () => {
    return currentTime.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // 스마트 모드 토글 (단순화)
  const handleSmartModeToggle = () => {
    if (!isSmartMode) {
      toggleSmartMode();
    } else {
      toggleSmartMode();
    }
  };

  // 접기/펼치기 토글
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // 컴팩트 모드 (접혔을 때)
  if (isCollapsed) {
    return (
      <div style={containerStyle}>
        <button
          onClick={toggleCollapse}
          style={{
            background: isSmartMode
              ? `linear-gradient(135deg, #10B981, #059669)`
              : `linear-gradient(135deg, #3B82F6, #1D4ED8)`,
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 30px", // 패딩 대폭 증가 (10px 20px → 12px 30px)
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // space-between에서 center로 변경
            gap: "16px", // 고정 간격 12px → 16px로 증가
            width: getResponsiveBoxWidth(),
            minWidth: getResponsiveBoxWidth(),
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
          }}
        >
          {/* 왼쪽: 테마 이모지 */}
          <span style={{ fontSize: "16px", flex: "0 0 auto" }}>
            {weatherEmojis[currentTheme.weather]}
            {timeEmojis[currentTheme.timeOfDay]}
          </span>

          {/* 중앙: 시간 */}
          <span
            style={{
              fontSize: getResponsiveFontSize(),
              opacity: 1,
              fontWeight: "600",
              fontFamily:
                "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", // monospace 유지
              width: "85px",
              textAlign: "center",
              flex: "0 0 auto",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {getCurrentTimeString()}
          </span>

          {/* 중앙: 모드 */}
          <span
            style={{
              fontSize: getResponsiveFontSize(),
              opacity: 1,
              fontWeight: "600",
              fontFamily:
                "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", // 시간과 같은 monospace로 통일
              width: "50px",
              textAlign: "center",
              flex: "0 0 auto",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {isSmartMode ? "Sync" : "Test"}
          </span>

          {/* 오른쪽: 펼치기 아이콘 */}
          <span
            style={{
              fontSize: "12px",
              opacity: 0.7,
              flex: "0 0 auto",
            }}
          >
            📁
          </span>
        </button>
      </div>
    );
  }

  // 풀모드 (펼쳐진 상태)
  return (
    <div style={containerStyle}>
      {/* 헤더 */}
      <div
        style={{
          marginBottom: isMobile ? "12px" : "16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: currentTheme.colors.text.primary,
              fontSize: isMobile ? "0.9rem" : "1.1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🎨 Theme Studio
            {/* 디버그 패널 토글 버튼 */}
            {!isMobile && (
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                style={{
                  background: showDebugPanel
                    ? "rgba(34, 197, 94, 0.3)"
                    : "rgba(100, 100, 100, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  color: currentTheme.colors.text.primary,
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                🛠 {showDebugPanel ? "Hide" : "Debug"}
              </button>
            )}
          </h3>

          {/* 접기 버튼 */}
          <button
            onClick={toggleCollapse}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "6px",
              padding: "4px 6px",
              color: currentTheme.colors.text.primary,
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            📁
          </button>
        </div>

        {/* 실시간 시계 */}
        {!isMobile && (
          <div
            style={{
              fontSize: "12px",
              color: currentTheme.colors.text.secondary,
              marginBottom: "8px",
            }}
          >
            🕐 Local Time: {getCurrentTimeString()}
          </div>
        )}

        {/* 현재 테마 표시 */}
        <div
          style={{
            background: `rgba(255, 255, 255, 0.08)`,
            padding: isMobile ? "8px" : "12px",
            borderRadius: isMobile ? "8px" : "12px",
            marginBottom: isMobile ? "12px" : "16px",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
            transition: "all 0.6s ease",
          }}
        >
          <div
            style={{
              fontWeight: "600",
              marginBottom: "8px",
              fontSize: isMobile ? "0.9rem" : "1rem",
            }}
          >
            {currentTheme.name}
          </div>
          <div
            style={{
              fontSize: isMobile ? "20px" : "28px",
              margin: "8px 0",
            }}
          >
            {weatherEmojis[currentTheme.weather]}{" "}
            {timeEmojis[currentTheme.timeOfDay]}
          </div>

          {/* 전환 중 표시 */}
          {isTransitioning && (
            <div
              style={{
                fontSize: "11px",
                color: currentTheme.colors.accent,
                marginTop: "8px",
                padding: "4px 8px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                animation: "pulse 1s infinite",
              }}
            >
              🔄 Smooth transition in progress...
            </div>
          )}

          {/* 위치 정보 (스마트 모드 시) */}
          {isSmartMode && locationInfo.city && (
            <div
              style={{
                fontSize: isMobile ? "10px" : "11px",
                opacity: 0.7,
                color: currentTheme.colors.text.secondary,
                marginTop: "6px",
                padding: "4px 8px",
                background:
                  locationInfo.method === "gps"
                    ? "rgba(16, 185, 129, 0.2)"
                    : "rgba(59, 130, 246, 0.2)",
                borderRadius: "8px",
                border:
                  locationInfo.method === "gps"
                    ? "1px solid rgba(16, 185, 129, 0.3)"
                    : "1px solid rgba(59, 130, 246, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              {locationInfo.method === "gps" ? "🎯" : "📍"}
              {locationInfo.city}, {locationInfo.country}
            </div>
          )}
        </div>
      </div>

      {/* 디버그 패널 */}
      {!isMobile && showDebugPanel && debugInfo && (
        <div
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "16px",
            fontSize: "11px",
            fontFamily: "monospace",
            color: "#E5E7EB",
            maxHeight: "120px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              marginBottom: "8px",
              fontWeight: "600",
              color: currentTheme.colors.accent,
            }}
          >
            🔍 Debug Info:
          </div>
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              lineHeight: 1.3,
            }}
          >
            {debugInfo}
          </pre>
        </div>
      )}

      {/* 스마트 모드 토글 버튼 */}
      <div style={{ marginBottom: isMobile ? "12px" : "16px" }}>
        <button
          onClick={handleSmartModeToggle}
          disabled={isLoading}
          style={{
            ...buttonStyle,
            background: isSmartMode
              ? isLoading
                ? `linear-gradient(135deg, #059669, #047857)`
                : `linear-gradient(135deg, #10B981, #059669)`
              : isLoading
              ? `linear-gradient(135deg, #1D4ED8, #1E40AF)`
              : `linear-gradient(135deg, #3B82F6, #1D4ED8)`,
            width: "100%",
            justifyContent: "center",
            padding: isMobile ? "10px" : "14px",
            fontSize: isMobile ? "12px" : "14px",
            fontWeight: "600",
            minHeight: isMobile ? "40px" : "50px",
          }}
        >
          {isLoading ? (
            <>
              <div
                style={{
                  width: isMobile ? "12px" : "16px",
                  height: isMobile ? "12px" : "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              {isMobile ? "Syncing..." : "Syncing Weather & Time..."}
            </>
          ) : (
            <>
              {isSmartMode ? (
                <>🔄 {isMobile ? "Test Mode" : "Switch to Test Mode"}</>
              ) : (
                <>
                  ⚡ {isMobile ? "Auto Sync" : "Sync with Real Weather & Time"}
                </>
              )}
            </>
          )}
        </button>

        {/* 상태별 설명 */}
        <div
          style={{
            fontSize: isMobile ? "10px" : "11px",
            color: currentTheme.colors.text.secondary,
            textAlign: "center",
            marginTop: "8px",
            lineHeight: 1.4,
          }}
        >
          {isSmartMode ? (
            <>
              <div style={{ marginBottom: "4px" }}>
                🤖 Smart Mode Active (
                {locationInfo.method?.toUpperCase() || "LOADING"})
              </div>
              {!isMobile && (
                <div style={{ opacity: 0.7 }}>
                  Real-time sync enabled • Click to test different themes
                </div>
              )}
            </>
          ) : (
            `Test Mode • ${
              isMobile
                ? "Click to sync"
                : "Click to sync with your current weather & time"
            }`
          )}
        </div>

        {/* 에러 표시 */}
        {error && (
          <div
            style={{
              fontSize: isMobile ? "10px" : "11px",
              color: "#EF4444",
              textAlign: "center",
              marginTop: "8px",
              padding: isMobile ? "6px" : "8px",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              lineHeight: 1.3,
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
          <div style={{ marginBottom: isMobile ? "10px" : "14px" }}>
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: isMobile ? "12px" : "13px",
                opacity: 0.8,
                fontWeight: "500",
              }}
            >
              Weather {isTransitioning && "(Transitioning...)"}
            </h4>

            {isMobile ? (
              /* 모바일: 드롭다운 */
              <select
                value={currentTheme.weather}
                onChange={(e) =>
                  smoothSetWeather(e.target.value as WeatherType)
                }
                style={selectStyle}
                disabled={isTransitioning}
              >
                {weathers.map((weather) => (
                  <option key={weather} value={weather}>
                    {weatherEmojis[weather]} {weather}
                  </option>
                ))}
              </select>
            ) : (
              /* 데스크톱: 버튼들 */
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {weathers.map((weather) => (
                  <button
                    key={weather}
                    onClick={() => smoothSetWeather(weather)}
                    disabled={isTransitioning}
                    style={{
                      ...buttonStyle,
                      opacity: isTransitioning
                        ? 0.4
                        : currentTheme.weather === weather
                        ? 1
                        : 0.6,
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
                      cursor: isTransitioning ? "not-allowed" : "pointer",
                    }}
                  >
                    {weatherEmojis[weather]} {weather}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 시간대 선택 */}
          <div style={{ marginBottom: isMobile ? "10px" : "14px" }}>
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: isMobile ? "12px" : "13px",
                opacity: 0.8,
                fontWeight: "500",
              }}
            >
              Time of Day {isTransitioning && "(Transitioning...)"}
            </h4>

            {isMobile ? (
              /* 모바일: 드롭다운 */
              <select
                value={currentTheme.timeOfDay}
                onChange={(e) =>
                  smoothSetTimeOfDay(e.target.value as TimeOfDay)
                }
                style={selectStyle}
                disabled={isTransitioning}
              >
                {times.map((time) => (
                  <option key={time} value={time}>
                    {timeEmojis[time]} {time}
                  </option>
                ))}
              </select>
            ) : (
              /* 데스크톱: 버튼들 */
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {times.map((time) => (
                  <button
                    key={time}
                    onClick={() => smoothSetTimeOfDay(time)}
                    disabled={isTransitioning}
                    style={{
                      ...buttonStyle,
                      opacity: isTransitioning
                        ? 0.4
                        : currentTheme.timeOfDay === time
                        ? 1
                        : 0.6,
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
                      cursor: isTransitioning ? "not-allowed" : "pointer",
                    }}
                  >
                    {timeEmojis[time]} {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 랜덤 테마 */}
      <button
        onClick={() => {
          if (!isSmartMode && !isTransitioning) {
            const randomWeather =
              weathers[Math.floor(Math.random() * weathers.length)];
            const randomTime = times[Math.floor(Math.random() * times.length)];
            smoothSetTheme(randomWeather, randomTime);
          }
        }}
        disabled={isSmartMode || isTransitioning}
        style={{
          ...buttonStyle,
          width: "100%",
          background:
            isSmartMode || isTransitioning
              ? `rgba(107, 114, 128, 0.5)`
              : `linear-gradient(135deg, #EC4899, #BE185D)`,
          justifyContent: "center",
          fontWeight: "600",
          cursor: isSmartMode || isTransitioning ? "not-allowed" : "pointer",
          opacity: isSmartMode || isTransitioning ? 0.5 : 1,
          fontSize: isMobile ? "12px" : "14px",
          padding: isMobile ? "8px" : "12px",
        }}
      >
        🎲{" "}
        {isTransitioning
          ? "Transitioning..."
          : isMobile
          ? "Random"
          : "Random Theme"}
      </button>

      {/* CSS 애니메이션 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `,
        }}
      />
    </div>
  );
};
