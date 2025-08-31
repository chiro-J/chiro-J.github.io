import React from "react";
import { ThemeProvider } from "./components/SyncTheme/ThemeProvider";
import { ThemeToggle } from "./components/SyncTheme/ThemeToggle";
import { WebGLBackground } from "./components/SyncTheme/WebGLBackground";
import { LocationPermissionDialog } from "./components/SyncTheme/LocationPermissionDialog";
import { useTheme, useSmartMode } from "./components/SyncTheme/useTheme";
import type {
  WeatherType,
  TimeOfDay,
} from "./components/SyncTheme/theme.types";

// 메인 컨텐츠 컴포넌트 (테마 컨텍스트 내부에서 사용)
const MainContent: React.FC = () => {
  const { currentTheme } = useTheme();
  const {
    showLocationDialog,
    retryGPSLocation,
    dismissLocationDialog,
    locationInfo,
  } = useSmartMode();

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Enhanced WebGL Background */}
      <WebGLBackground />

      {/* 위치 권한 대화상자 */}
      <LocationPermissionDialog
        show={showLocationDialog}
        onRetry={retryGPSLocation}
        onDismiss={dismissLocationDialog}
        locationMethod={locationInfo.method}
        cityInfo={
          locationInfo.city && locationInfo.country
            ? `${locationInfo.city}, ${locationInfo.country}`
            : undefined
        }
      />

      {/* 메인 헤더 */}
      <header style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            margin: "0 0 16px 0",
            backgroundImage: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary}, ${currentTheme.colors.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent", // 백업 색상
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            fontWeight: "700",
            letterSpacing: "-0.02em",
          }}
        >
          ✨ Next-Gen Weather Studio
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: currentTheme.colors.text.secondary,
            maxWidth: "600px",
            lineHeight: 1.6,
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            fontWeight: "300",
          }}
        >
          Experience photorealistic weather effects with smart automation. Watch
          celestial bodies move in real-time with your location's weather!
        </p>
      </header>

      {/* 현재 테마 정보 카드 */}
      <div
        style={{
          backgroundColor: `rgba(0, 0, 0, 0.15)`,
          backdropFilter: "blur(20px)",
          border: `1px solid rgba(255, 255, 255, 0.2)`,
          borderRadius: "24px",
          padding: "32px",
          marginBottom: "40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          maxWidth: "500px",
          width: "100%",
          transition: "all 0.3s ease",
        }}
      >
        <h2
          style={{
            margin: "0 0 24px 0",
            color: currentTheme.colors.text.primary,
            fontSize: "1.8rem",
            fontWeight: "600",
          }}
        >
          Current Experience: {currentTheme.name}
        </h2>

        {/* 위치 정보 표시 (스마트 모드 시) */}
        {locationInfo.city && (
          <div
            style={{
              background:
                locationInfo.method === "gps"
                  ? "rgba(16, 185, 129, 0.2)"
                  : "rgba(59, 130, 246, 0.2)",
              border:
                locationInfo.method === "gps"
                  ? "1px solid rgba(16, 185, 129, 0.4)"
                  : "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>{locationInfo.method === "gps" ? "🎯" : "📍"}</span>
            <span>
              {locationInfo.method === "gps"
                ? "GPS 정확한 위치"
                : "IP 기반 추정 위치"}
              : {locationInfo.city}, {locationInfo.country}
            </span>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: `rgba(255, 255, 255, 0.08)`,
              padding: "20px",
              borderRadius: "16px",
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              transition: "transform 0.2s ease",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: "1rem",
                opacity: 0.8,
                fontWeight: "500",
              }}
            >
              Weather Atmosphere
            </h3>
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
              {getWeatherEmoji(currentTheme.weather)}
            </div>
            <p
              style={{
                margin: "0",
                textTransform: "capitalize",
                fontSize: "1.1rem",
                fontWeight: "500",
              }}
            >
              {currentTheme.weather}
            </p>
          </div>

          <div
            style={{
              backgroundColor: `rgba(255, 255, 255, 0.08)`,
              padding: "20px",
              borderRadius: "16px",
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              transition: "transform 0.2s ease",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: "1rem",
                opacity: 0.8,
                fontWeight: "500",
              }}
            >
              Celestial Time
            </h3>
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
              {getTimeEmoji(currentTheme.timeOfDay)}
            </div>
            <p
              style={{
                margin: "0",
                textTransform: "capitalize",
                fontSize: "1.1rem",
                fontWeight: "500",
              }}
            >
              {currentTheme.timeOfDay}
            </p>
          </div>
        </div>

        {/* Enhanced WebGL 효과 정보 */}
        <div style={{ marginTop: "20px" }}>
          <h3
            style={{
              margin: "0 0 16px 0",
              fontSize: "1rem",
              opacity: 0.8,
              fontWeight: "500",
            }}
          >
            Active Visual Effects
          </h3>
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: "12px",
            }}
          >
            <EffectBadge
              icon={
                currentTheme.timeOfDay === "night" ||
                currentTheme.timeOfDay === "dawn"
                  ? "🌙⭐"
                  : "☀️"
              }
              text={
                currentTheme.timeOfDay === "night" ||
                currentTheme.timeOfDay === "dawn"
                  ? "Moon & Twinkling Stars"
                  : "Radiant Sun"
              }
            />
            <EffectBadge icon="☁️" text="Volumetric Clouds" />
            {currentTheme.effects?.particles && (
              <EffectBadge
                icon={getParticleIcon(currentTheme.weather)}
                text={getParticleText(currentTheme.weather)}
              />
            )}
            <EffectBadge icon="🌈" text="Dynamic Sky Gradient" />
          </div>
        </div>
      </div>

      {/* Enhanced 기능 소개 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "50px",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        <FeatureCard
          emoji="🤖"
          title="Smart Automation"
          content="AI-powered system that automatically syncs with your real-time location, weather conditions, and local time for perfect atmospheric matching."
          gradient={["#10B981", "#059669"]}
        />
        <FeatureCard
          emoji="🎬"
          title="Cinematic Effects"
          content="Hollywood-grade WebGL rendering with realistic sun/moon movement, twinkling stars, volumetric clouds, and physics-based weather particles."
          gradient={["#8B5CF6", "#7C3AED"]}
        />
        <FeatureCard
          emoji="⚡"
          title="Performance Optimized"
          content="60FPS smooth animations with intelligent LOD system, memory management, and cross-device compatibility for seamless experience."
          gradient={["#F59E0B", "#D97706"]}
        />
      </div>

      {/* Premium 테스트 섹션 */}
      <div
        style={{
          backgroundColor: `rgba(0, 0, 0, 0.1)`,
          backdropFilter: "blur(15px)",
          border: `1px solid rgba(255, 255, 255, 0.15)`,
          borderRadius: "20px",
          padding: "36px",
          maxWidth: "700px",
          width: "100%",
          marginBottom: "50px",
        }}
      >
        <h2
          style={{
            margin: "0 0 16px 0",
            textAlign: "center",
            fontSize: "1.8rem",
            fontWeight: "600",
          }}
        >
          🧪 Experience Gallery
        </h2>
        <p
          style={{
            textAlign: "center",
            marginBottom: "24px",
            color: currentTheme.colors.text.secondary,
            fontSize: "1.1rem",
            fontWeight: "300",
          }}
        >
          Discover stunning combinations of weather and celestial positioning.
          Each preset showcases different visual effects.
        </p>

        <QuickTestButtons />
      </div>

      {/* 정보 푸터 */}
      <footer
        style={{
          marginTop: "60px",
          padding: "24px",
          textAlign: "center",
          color: currentTheme.colors.text.secondary,
          borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <p
          style={{ fontSize: "1.1rem", fontWeight: "500", marginBottom: "8px" }}
        >
          Powered by React + TypeScript + Three.js WebGL + OpenWeather API
        </p>
        <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
          🌍 Real-time location sync • ⚡ 60fps performance • 🎨 30+ dynamic
          themes
        </p>
      </footer>

      {/* Floating Theme Control */}
      <ThemeToggle variant="floating" />
    </div>
  );
};

// 개선된 효과 뱃지 컴포넌트
const EffectBadge: React.FC<{ icon: string; text: string }> = ({
  icon,
  text,
}) => (
  <div
    style={{
      backgroundColor: `rgba(255, 255, 255, 0.15)`,
      padding: "8px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    }}
  >
    <span>{icon}</span>
    <span>{text}</span>
  </div>
);

// Premium 기능 카드
const FeatureCard: React.FC<{
  emoji: string;
  title: string;
  content: string;
  gradient: [string, string];
}> = ({ emoji, title, content, gradient }) => {
  const { currentTheme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: `rgba(0, 0, 0, 0.2)`,
        backdropFilter: "blur(20px)",
        border: `1px solid rgba(255, 255, 255, 0.15)`,
        borderRadius: "20px",
        padding: "28px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(0, 0, 0, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)";
      }}
    >
      {/* 그라디언트 오버레이 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          backgroundImage: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
          borderRadius: "20px 20px 0 0",
        }}
      />

      <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>{emoji}</div>
      <h3
        style={{
          margin: "0 0 16px 0",
          color: currentTheme.colors.text.primary,
          fontSize: "1.3rem",
          fontWeight: "600",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          color: currentTheme.colors.text.secondary,
          lineHeight: 1.6,
          fontSize: "1rem",
        }}
      >
        {content}
      </p>
    </div>
  );
};

// Premium 테스트 버튼들
const QuickTestButtons: React.FC = () => {
  const { setTheme } = useTheme();

  const quickTests: Array<{
    weather: WeatherType;
    time: TimeOfDay;
    emoji: string;
    label: string;
    desc: string;
    gradient: [string, string];
  }> = [
    {
      weather: "sunny",
      time: "dawn",
      emoji: "🌅☀️",
      label: "Golden Dawn",
      desc: "Radiant sunrise with warm rays",
      gradient: ["#FF8C42", "#FFD700"],
    },
    {
      weather: "sunny",
      time: "afternoon",
      emoji: "☀️🏙️",
      label: "Blazing Noon",
      desc: "Brilliant midday sun overhead",
      gradient: ["#FFD700", "#FFA500"],
    },
    {
      weather: "rainy",
      time: "night",
      emoji: "🌧️🌙",
      label: "Moonlit Storm",
      desc: "Ethereal moonbeams through rain",
      gradient: ["#4A90E2", "#87CEEB"],
    },
    {
      weather: "snowy",
      time: "evening",
      emoji: "❄️🌇",
      label: "Winter Sunset",
      desc: "Crystalline snowfall at dusk",
      gradient: ["#E6E6FA", "#FFB6C1"],
    },
    {
      weather: "stormy",
      time: "night",
      emoji: "⛈️🌙",
      label: "Electric Night",
      desc: "Dramatic storm under moonlight",
      gradient: ["#6A5ACD", "#483D8B"],
    },
    {
      weather: "foggy",
      time: "morning",
      emoji: "🌫️🌄",
      label: "Mystic Dawn",
      desc: "Mysterious fog at sunrise",
      gradient: ["#E6E6FA", "#D3D3D3"],
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
      }}
    >
      {quickTests.map((test, index) => (
        <button
          key={index}
          onClick={() => setTheme(test.weather, test.time)}
          style={{
            padding: "20px 16px",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
            borderRadius: "16px",
            backgroundImage: `linear-gradient(135deg, ${test.gradient[0]}20, ${test.gradient[1]}20)`,
            backdropFilter: "blur(10px)",
            color: "inherit",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "all 0.3s ease",
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            fontWeight: "500",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
            e.currentTarget.style.backgroundImage = `linear-gradient(135deg, ${test.gradient[0]}30, ${test.gradient[1]}30)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
            e.currentTarget.style.backgroundImage = `linear-gradient(135deg, ${test.gradient[0]}20, ${test.gradient[1]}20)`;
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
            {test.emoji}
          </div>
          <div
            style={{ fontWeight: "600", marginBottom: "4px", fontSize: "1rem" }}
          >
            {test.label}
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.8, lineHeight: 1.3 }}>
            {test.desc}
          </div>
        </button>
      ))}
    </div>
  );
};

// 유틸리티 함수들
const getWeatherEmoji = (weather: string): string => {
  const emojis: Record<string, string> = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    snowy: "❄️",
    stormy: "⛈️",
    foggy: "🌫️",
  };
  return emojis[weather] || "🌤️";
};

const getTimeEmoji = (time: string): string => {
  const emojis: Record<string, string> = {
    dawn: "🌅",
    morning: "🌄",
    afternoon: "☀️",
    evening: "🌇",
    night: "🌙",
  };
  return emojis[time] || "🕐";
};

const getParticleIcon = (weather: WeatherType): string => {
  const icons: Record<WeatherType, string> = {
    sunny: "✨",
    cloudy: "☁️",
    rainy: "🌧️",
    snowy: "❄️",
    stormy: "⚡",
    foggy: "🌫️",
  };
  return icons[weather];
};

const getParticleText = (weather: WeatherType): string => {
  const texts: Record<WeatherType, string> = {
    sunny: "Light Rays",
    cloudy: "Soft Clouds",
    rainy: "Rain Drops",
    snowy: "Snow Flakes",
    stormy: "Storm Particles",
    foggy: "Fog Particles",
  };
  return texts[weather];
};

// 메인 App 컴포넌트
const App: React.FC = () => {
  return (
    <ThemeProvider
      defaultWeather="sunny"
      defaultTimeOfDay="morning"
      persistTheme={true}
      autoInitialize={true}
    >
      <MainContent />
    </ThemeProvider>
  );
};

export default App;
