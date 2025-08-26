import React, { useState } from "react";
import { ThemeProvider } from "./components/SyncTheme/ThemeProvider";
import { ThemeToggle } from "./components/SyncTheme/ThemeToggle";
import { WebGLBackground } from "./components/SyncTheme/WebGLBackground";
import { useTheme } from "./components/SyncTheme/useTheme";

// 메인 컨텐츠 컴포넌트 (테마 컨텍스트 내부에서 사용)
const MainContent: React.FC = () => {
  const { currentTheme } = useTheme();
  const [weatherAPIKey, setWeatherAPIKey] = useState<string>("");
  const [showAPIKeyInput, setShowAPIKeyInput] = useState(false);

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
      {/* WebGL 배경 */}
      <WebGLBackground
        enableParticles={true}
        enableCelestialBodies={true}
        enableClouds={true}
      />

      {/* 헤더 */}
      <header style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "3rem",
            margin: "0 0 16px 0",
            background: `linear-gradient(45deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))",
          }}
        >
          🌟 Dynamic WebGL Theme System
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: currentTheme.colors.text.secondary,
            maxWidth: "600px",
            lineHeight: 1.6,
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          Experience real-time weather effects with WebGL! Watch the sun and
          moon move, clouds drift by, and weather particles fall!
        </p>
      </header>

      {/* Weather API 설정 */}
      <div
        style={{
          background: `rgba(255, 255, 255, 0.1)`,
          backdropFilter: "blur(10px)",
          border: `2px solid ${currentTheme.colors.accent}`,
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "30px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2
          style={{
            margin: "0 0 15px 0",
            color: currentTheme.colors.text.primary,
            fontSize: "1.3rem",
          }}
        >
          🌍 Real Weather Integration
        </h2>

        {!showAPIKeyInput ? (
          <button
            onClick={() => setShowAPIKeyInput(true)}
            style={{
              background: `linear-gradient(45deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            🔑 Setup Weather API
          </button>
        ) : (
          <div style={{ textAlign: "left" }}>
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: "14px",
                color: currentTheme.colors.text.secondary,
              }}
            >
              Get your free API key from{" "}
              <a
                href="https://openweathermap.org/api"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: currentTheme.colors.accent }}
              >
                OpenWeatherMap
              </a>
            </p>
            <input
              type="text"
              placeholder="Enter your OpenWeatherMap API key"
              value={weatherAPIKey}
              onChange={(e) => setWeatherAPIKey(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: `1px solid ${currentTheme.colors.accent}`,
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                color: currentTheme.colors.text.primary,
                fontSize: "14px",
                marginBottom: "10px",
              }}
            />
            <button
              onClick={() => setShowAPIKeyInput(false)}
              style={{
                background: `linear-gradient(45deg, #27AE60, #2ECC71)`,
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              ✅ Save
            </button>
          </div>
        )}
      </div>

      {/* 현재 테마 정보 카드 */}
      <div
        style={{
          background: `rgba(255, 255, 255, 0.1)`,
          backdropFilter: "blur(10px)",
          border: `2px solid ${currentTheme.colors.accent}`,
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            color: currentTheme.colors.text.primary,
            fontSize: "1.8rem",
          }}
        >
          Current Theme: {currentTheme.name}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              background: `rgba(255, 255, 255, 0.1)`,
              padding: "15px",
              borderRadius: "12px",
              border: `1px solid ${currentTheme.colors.primary}`,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1rem", opacity: 0.8 }}>
              Weather
            </h3>
            <div style={{ fontSize: "2rem" }}>
              {getWeatherEmoji(currentTheme.weather)}
            </div>
            <p style={{ margin: "8px 0 0 0", textTransform: "capitalize" }}>
              {currentTheme.weather}
            </p>
          </div>

          <div
            style={{
              background: `rgba(255, 255, 255, 0.1)`,
              padding: "15px",
              borderRadius: "12px",
              border: `1px solid ${currentTheme.colors.secondary}`,
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1rem", opacity: 0.8 }}>
              Time
            </h3>
            <div style={{ fontSize: "2rem" }}>
              {getTimeEmoji(currentTheme.timeOfDay)}
            </div>
            <p style={{ margin: "8px 0 0 0", textTransform: "capitalize" }}>
              {currentTheme.timeOfDay}
            </p>
          </div>
        </div>

        {/* WebGL 효과 정보 */}
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1rem", opacity: 0.8 }}>
            Active WebGL Effects
          </h3>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                background: `rgba(255, 255, 255, 0.1)`,
                padding: "6px 12px",
                borderRadius: "20px",
              }}
            >
              {currentTheme.timeOfDay === "night" ||
              currentTheme.timeOfDay === "dawn"
                ? "⭐ Stars"
                : "☀️ Sun"}
            </div>
            <div
              style={{
                background: `rgba(255, 255, 255, 0.1)`,
                padding: "6px 12px",
                borderRadius: "20px",
              }}
            >
              ☁️ Clouds
            </div>
            {currentTheme.effects?.particles && (
              <div
                style={{
                  background: `rgba(255, 255, 255, 0.1)`,
                  padding: "6px 12px",
                  borderRadius: "20px",
                }}
              >
                {currentTheme.weather === "rainy"
                  ? "🌧️ Rain"
                  : currentTheme.weather === "snowy"
                  ? "❄️ Snow"
                  : currentTheme.weather === "stormy"
                  ? "⛈️ Storm"
                  : "✨ Particles"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 기능 소개 카드들 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        <FeatureCard
          emoji="🌍"
          title="Real Weather API"
          content="Connect with OpenWeatherMap to get real-time weather data and automatically sync your theme with actual conditions."
        />
        <FeatureCard
          emoji="🎬"
          title="WebGL Effects"
          content="Watch the sun and moon move across the sky in real-time, with animated clouds and weather particles."
        />
        <FeatureCard
          emoji="🤖"
          title="Auto Mode"
          content="Enable auto mode to automatically update the time-of-day theme based on your current local time."
        />
      </div>

      {/* 빠른 테스트 섹션 */}
      <div
        style={{
          background: `rgba(255, 255, 255, 0.05)`,
          backdropFilter: "blur(5px)",
          border: `1px solid ${currentTheme.colors.accent}`,
          borderRadius: "16px",
          padding: "30px",
          maxWidth: "600px",
          width: "100%",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", textAlign: "center" }}>
          🧪 Quick Theme Tests
        </h2>
        <p
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: currentTheme.colors.text.secondary,
          }}
        >
          Try these dramatic combinations to see WebGL effects in action!
        </p>

        <QuickTestButtons />
      </div>

      {/* 푸터 */}
      <footer
        style={{
          marginTop: "60px",
          padding: "20px",
          textAlign: "center",
          color: currentTheme.colors.text.secondary,
          borderTop: `1px solid ${currentTheme.colors.accent}`,
        }}
      >
        <p>Built with React + TypeScript + Three.js WebGL</p>
        <p style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "8px" }}>
          Real-time celestial movement • Weather particles • Dynamic lighting
        </p>
      </footer>

      {/* 플로팅 컨트롤 패널 */}
      <ThemeToggle
        variant="floating"
        showAutoMode={true}
        showWeatherAPI={true}
        weatherAPIKey={weatherAPIKey || undefined}
      />
    </div>
  );
};

// 기능 카드 컴포넌트
const FeatureCard: React.FC<{
  emoji: string;
  title: string;
  content: string;
}> = ({ emoji, title, content }) => {
  const { currentTheme } = useTheme();

  return (
    <div
      style={{
        background: `rgba(255, 255, 255, 0.1)`,
        backdropFilter: "blur(10px)",
        border: `1px solid ${currentTheme.colors.accent}`,
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.3s ease",
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{emoji}</div>
      <h3
        style={{
          margin: "0 0 12px 0",
          color: currentTheme.colors.text.primary,
          fontSize: "1.2rem",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          color: currentTheme.colors.text.secondary,
          lineHeight: 1.5,
        }}
      >
        {content}
      </p>
    </div>
  );
};

// 빠른 테스트 버튼들
const QuickTestButtons: React.FC = () => {
  const { setTheme } = useTheme();

  const quickTests = [
    {
      weather: "stormy" as const,
      time: "night" as const,
      emoji: "⛈️🌙",
      label: "Stormy Night",
    },
    {
      weather: "snowy" as const,
      time: "evening" as const,
      emoji: "❄️🌇",
      label: "Snowy Evening",
    },
    {
      weather: "rainy" as const,
      time: "dawn" as const,
      emoji: "🌧️🌅",
      label: "Rainy Dawn",
    },
    {
      weather: "sunny" as const,
      time: "afternoon" as const,
      emoji: "☀️🏙️",
      label: "Sunny Day",
    },
    {
      weather: "foggy" as const,
      time: "morning" as const,
      emoji: "🌫️🌄",
      label: "Foggy Morning",
    },
    {
      weather: "cloudy" as const,
      time: "night" as const,
      emoji: "☁️🌙",
      label: "Cloudy Night",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "12px",
      }}
    >
      {quickTests.map((test, index) => (
        <button
          key={index}
          onClick={() => setTheme(test.weather, test.time)}
          style={{
            padding: "14px 10px",
            border: "none",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(5px)",
            color: "inherit",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "all 0.3s ease",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
          }}
        >
          <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>
            {test.emoji}
          </div>
          {test.label}
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
