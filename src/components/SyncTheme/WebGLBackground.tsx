import React, { useRef, useEffect, useState, useMemo } from "react";
import { useTheme, useSmartMode } from "./useTheme";
import type { WeatherType, TimeOfDay } from "./theme.types";

interface CanvasBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
}

interface Star {
  x: number;
  y: number;
  size: number;
  twinkle: number;
}

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface CelestialPosition {
  x: number;
  y: number;
  visible: boolean;
  phase: number; // 0-1, 해/달의 궤도상 진행률
}

export const WebGLBackground: React.FC<CanvasBackgroundProps> = ({
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTheme } = useTheme();
  const { locationInfo, isSmartMode } = useSmartMode();
  const animationIdRef = useRef<number>();
  const clockRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const celestialUpdateRef = useRef<number>(0);

  // 실제 일출/일몰 데이터를 위한 상태
  const [sunriseData, setSunriseData] = useState<{
    sunrise: Date;
    sunset: Date;
    date: string;
  } | null>(null);

  // 실시간 해/달 위치를 ref로 관리 (리렌더링 방지)
  const realtimeSunPositionRef = useRef<CelestialPosition>({
    x: 0,
    y: 0,
    visible: false,
    phase: 0,
  });
  const realtimeMoonPositionRef = useRef<CelestialPosition>({
    x: 0,
    y: 0,
    visible: false,
    phase: 0,
  });

  // 모바일 감지 및 성능 설정
  const isMobile = useMemo(() => {
    return (
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768
    );
  }, []);

  // 날씨별 구름 설정
  const getCloudConfig = (weather: WeatherType) => {
    const baseCount = isMobile ? 3 : 4;

    switch (weather) {
      case "sunny":
        return { count: Math.floor(baseCount * 1), opacity: 0.6, speed: 0.05 };
      case "cloudy":
        return { count: Math.floor(baseCount * 10), opacity: 0.9, speed: 0.08 };
      case "rainy":
        return {
          count: Math.floor(baseCount * 15),
          opacity: 0.85,
          speed: 0.12,
        };
      case "stormy":
        return {
          count: Math.floor(baseCount * 30),
          opacity: 0.95,
          speed: 0.15,
        };
      case "snowy":
        return {
          count: Math.floor(baseCount * 15),
          opacity: 0.85,
          speed: 0.07,
        };
      case "foggy":
        return {
          count: Math.floor(baseCount * 0.5),
          opacity: 0.7,
          speed: 0.04,
        };
      default:
        return { count: baseCount, opacity: 0.8, speed: 0.08 };
    }
  };

  const performanceConfig = useMemo(() => {
    const cloudConfig = getCloudConfig(currentTheme.weather);

    return {
      targetFPS: isMobile ? 30 : 60,
      starCount: isMobile ? 30 : 50,
      cloudCount: cloudConfig.count,
      cloudOpacity: cloudConfig.opacity,
      cloudSpeed: cloudConfig.speed,
      particleCount: {
        rainy: isMobile ? 50 : 80,
        snowy: isMobile ? 30 : 50,
        stormy: isMobile ? 80 : 120,
        foggy: isMobile ? 15 : 25,
      },
    };
  }, [isMobile, currentTheme.weather]);

  const [starPositions, setStarPositions] = useState<Star[]>([]);
  const [cloudPositions, setCloudPositions] = useState<Cloud[]>([]);
  const [particlePositions, setParticlePositions] = useState<Particle[]>([]);

  // 실제 일출/일몰 데이터 가져오기
  const fetchSunriseData = async (lat: number, lon: number) => {
    const today = new Date().toISOString().split("T")[0];

    // 오늘 데이터가 이미 있으면 재사용
    if (sunriseData && sunriseData.date === today) {
      return sunriseData;
    }

    try {
      const response = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0&date=${today}`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const newSunriseData = {
          sunrise: new Date(data.results.sunrise),
          sunset: new Date(data.results.sunset),
          date: today,
        };

        setSunriseData(newSunriseData);
        console.log("🌅 Real sunrise data loaded:", {
          sunrise: newSunriseData.sunrise.toLocaleTimeString("ko-KR"),
          sunset: newSunriseData.sunset.toLocaleTimeString("ko-KR"),
        });

        return newSunriseData;
      }
      throw new Error("Sunrise API failed");
    } catch (error) {
      console.log("⚠️ Sunrise API error, using fallback times:", error);
      return null;
    }
  };

  // 천체 위치 계산 함수 (스마트 모드/테스트 모드 구분 + 모바일 대응)
  const calculateCelestialPositions = (canvas: HTMLCanvasElement) => {
    const { width, height } = canvas;

    // 모바일에서 안전한 영역 계산
    const safeAreaTop = isMobile ? height * 0.15 : height * 0.1; // 모바일에서 더 아래쪽
    const safeAreaBottom = isMobile ? height * 0.6 : height * 0.5; // 모바일에서 더 위쪽
    const safeAreaLeft = width * 0.15; // 좌우 15% 여백
    const safeAreaRight = width * 0.85;

    if (isSmartMode) {
      // 스마트 모드: 실시간 계산
      const now = new Date();
      const currentMinutes =
        now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

      // 실제 일출/일몰 시간 사용 (데이터가 있으면)
      let sunriseMinutes = 6 * 60; // 기본값: 6:00 AM
      let sunsetMinutes = 18 * 60; // 기본값: 6:00 PM

      if (sunriseData) {
        sunriseMinutes =
          sunriseData.sunrise.getHours() * 60 +
          sunriseData.sunrise.getMinutes();
        sunsetMinutes =
          sunriseData.sunset.getHours() * 60 + sunriseData.sunset.getMinutes();
      }

      const isDayTime =
        currentMinutes >= sunriseMinutes && currentMinutes <= sunsetMinutes;

      // 태양 위치 계산 (모바일 안전 영역 적용)
      let sunPosition: CelestialPosition;
      if (isDayTime) {
        const dayProgress =
          (currentMinutes - sunriseMinutes) / (sunsetMinutes - sunriseMinutes);
        const sunAngle = Math.PI * dayProgress;

        sunPosition = {
          x: safeAreaLeft + (safeAreaRight - safeAreaLeft) * dayProgress,
          y:
            safeAreaBottom -
            (safeAreaBottom - safeAreaTop) * Math.sin(sunAngle),
          visible: true,
          phase: dayProgress,
        };
      } else {
        sunPosition = { x: 0, y: 0, visible: false, phase: 0 };
      }

      // 달 위치 계산 (모바일 안전 영역 적용)
      let moonPosition: CelestialPosition;
      if (!isDayTime) {
        let nightProgress;
        const totalNightDuration = 24 * 60 - (sunsetMinutes - sunriseMinutes);

        if (currentMinutes < sunriseMinutes) {
          nightProgress =
            (currentMinutes + (24 * 60 - sunsetMinutes)) / totalNightDuration;
        } else {
          nightProgress = (currentMinutes - sunsetMinutes) / totalNightDuration;
        }

        const moonAngle = Math.PI * nightProgress;

        moonPosition = {
          x: safeAreaLeft + (safeAreaRight - safeAreaLeft) * nightProgress,
          y:
            safeAreaBottom -
            (safeAreaBottom - safeAreaTop) * 0.8 * Math.sin(moonAngle),
          visible: true,
          phase: nightProgress,
        };
      } else {
        const isDawnOrDusk =
          currentMinutes < sunriseMinutes + 60 ||
          currentMinutes > sunsetMinutes - 60;

        if (isDawnOrDusk) {
          moonPosition = {
            x: safeAreaRight * 0.9,
            y: safeAreaTop + (safeAreaBottom - safeAreaTop) * 0.3,
            visible: true,
            phase: 0.8,
          };
        } else {
          moonPosition = { x: 0, y: 0, visible: false, phase: 0 };
        }
      }

      return { sunPosition, moonPosition };
    } else {
      // 테스트 모드: 선택된 timeOfDay에 따른 고정 위치 (모바일 안전 영역 적용)
      const timeOfDay = currentTheme.timeOfDay;

      let sunPosition: CelestialPosition;
      let moonPosition: CelestialPosition;

      switch (timeOfDay) {
        case "dawn":
          sunPosition = {
            x: safeAreaLeft + (safeAreaRight - safeAreaLeft) * 0.1, // 동쪽 낮은 위치
            y: safeAreaBottom - (safeAreaBottom - safeAreaTop) * 0.2,
            visible: true,
            phase: 0.1,
          };
          moonPosition = {
            x: safeAreaLeft + (safeAreaRight - safeAreaLeft) * 0.9, // 서쪽에 희미하게
            y: safeAreaTop + (safeAreaBottom - safeAreaTop) * 0.3,
            visible: true,
            phase: 0.9,
          };
          break;

        case "morning":
          sunPosition = {
            x: safeAreaLeft + (safeAreaRight - safeAreaLeft) * 0.25, // 동쪽에서 올라온 상태
            y: safeAreaTop + (safeAreaBottom - safeAreaTop) * 0.4,
            visible: true,
            phase: 0.3,
          };
          moonPosition = { x: 0, y: 0, visible: false, phase: 0 };
          break;

        case "afternoon":
          sunPosition = {
            x: safeAreaLeft + (safeAreaRight - safeAreaLeft) * 0.5, // 정중앙 최고점
            y: safeAreaTop,
            visible: true,
            phase: 0.5,
          };
          moonPosition = { x: 0, y: 0, visible: false, phase: 0 };
          break;

        case "evening":
          sunPosition = {
            x: safeAreaLeft + (safeAreaRight - safeAreaLeft) * 0.75, // 서쪽으로 기울어짐
            y: safeAreaTop + (safeAreaBottom - safeAreaTop) * 0.6,
            visible: true,
            phase: 0.8,
          };
          moonPosition = {
            x: safeAreaLeft + (safeAreaRight - safeAreaLeft) * 0.2, // 동쪽에 희미하게 나타남
            y: safeAreaTop + (safeAreaBottom - safeAreaTop) * 0.5,
            visible: true,
            phase: 0.2,
          };
          break;

        case "night":
          sunPosition = { x: 0, y: 0, visible: false, phase: 0 };
          moonPosition = {
            x: safeAreaLeft + (safeAreaRight - safeAreaLeft) * 0.6, // 하늘 중앙에
            y: safeAreaTop + (safeAreaBottom - safeAreaTop) * 0.3,
            visible: true,
            phase: 0.5,
          };
          break;

        default:
          sunPosition = { x: 0, y: 0, visible: false, phase: 0 };
          moonPosition = { x: 0, y: 0, visible: false, phase: 0 };
      }

      return { sunPosition, moonPosition };
    }
  };

  // 초기 천체 위치 설정 (스마트 모드/테스트 모드 구분)
  useEffect(() => {
    if (canvasRef.current) {
      const positions = calculateCelestialPositions(canvasRef.current);
      realtimeSunPositionRef.current = positions.sunPosition;
      realtimeMoonPositionRef.current = positions.moonPosition;
    }
  }, [sunriseData, currentTheme.timeOfDay]); // timeOfDay 변경시에도 초기화

  // 천체 가시성 (스마트 모드/테스트 모드 구분)
  const getCelestialVisibility = () => {
    if (isSmartMode) {
      // 스마트 모드: 실제 시간 기반
      const now = new Date();
      const hour = now.getHours();
      const starsVisible = hour < 7 || hour > 18;

      return {
        sun: realtimeSunPositionRef.current.visible,
        moon: realtimeMoonPositionRef.current.visible,
        stars: starsVisible,
      };
    } else {
      // 테스트 모드: 선택된 timeOfDay 기반
      const timeOfDay = currentTheme.timeOfDay;

      switch (timeOfDay) {
        case "dawn":
          return { sun: true, moon: true, stars: true };
        case "morning":
          return { sun: true, moon: false, stars: false };
        case "afternoon":
          return { sun: true, moon: false, stars: false };
        case "evening":
          return { sun: true, moon: true, stars: false };
        case "night":
          return { sun: false, moon: true, stars: true };
        default:
          return { sun: false, moon: false, stars: false };
      }
    }
  };

  // 향상된 해 그리기 (실시간 위치와 단계 반영)
  const drawRealtimeSun = (
    ctx: CanvasRenderingContext2D,
    position: CelestialPosition
  ) => {
    if (!position.visible) return;

    const { x, y, phase } = position;

    // 시간에 따른 색상 변화
    const isEarlyOrLate = phase < 0.2 || phase > 0.8;
    const sunColor = isEarlyOrLate ? "#FF8C42" : "#FFD700";
    const intensity = Math.sin(Math.PI * phase); // 정오에 가장 밝음

    ctx.save();

    // 동적 광선 (시간에 따라 각도와 강도 변화)
    const rayRotation = clockRef.current * 0.001 + phase * Math.PI;
    const rayCount = Math.floor(8 + intensity * 4); // 강도에 따라 광선 수 변화

    for (let i = 0; i < rayCount; i++) {
      const angle = ((i * (360 / rayCount) + rayRotation * 10) * Math.PI) / 180;
      const rayLength = 30 + intensity * 20; // 강도에 따라 광선 길이 변화

      const gradient = ctx.createLinearGradient(
        x,
        y,
        x + Math.cos(angle) * rayLength,
        y + Math.sin(angle) * rayLength
      );
      gradient.addColorStop(0, `rgba(255, 212, 0, ${intensity * 0.6})`);
      gradient.addColorStop(1, `rgba(255, 212, 0, 0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5 + intensity;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * rayLength,
        y + Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }

    // 외부 글로우 (강도에 따라 크기 변화)
    const glowSize = 40 + intensity * 20;
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
    glowGradient.addColorStop(0, `rgba(255, 212, 0, ${intensity * 0.3})`);
    glowGradient.addColorStop(1, "rgba(255, 212, 0, 0)");

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // 메인 해 (크기도 시간에 따라 약간 변화)
    const sunSize = 16 + intensity * 4;
    const sunGradient = ctx.createRadialGradient(
      x - 3,
      y - 3,
      0,
      x,
      y,
      sunSize
    );
    sunGradient.addColorStop(0, "#FFFF99");
    sunGradient.addColorStop(0.8, sunColor);
    sunGradient.addColorStop(1, isEarlyOrLate ? "#CC5500" : "#E6AC00");

    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(x, y, sunSize, 0, Math.PI * 2);
    ctx.fill();

    // 하이라이트
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.5})`;
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // 향상된 달 그리기 (실시간 위치와 위상 반영)
  const drawRealtimeMoon = (
    ctx: CanvasRenderingContext2D,
    position: CelestialPosition
  ) => {
    if (!position.visible) return;

    const { x, y, phase } = position;

    ctx.save();

    // 달빛 글로우 (위상에 따라 강도 변화)
    const glowIntensity = 0.2 + Math.sin(Math.PI * phase) * 0.2;
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
    glowGradient.addColorStop(0, `rgba(230, 230, 250, ${glowIntensity})`);
    glowGradient.addColorStop(1, "rgba(230, 230, 250, 0)");

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    // 메인 달 (크기 약간 변화)
    const moonSize = 13 + Math.sin(Math.PI * phase) * 3;
    const moonGradient = ctx.createRadialGradient(
      x - 2,
      y - 2,
      0,
      x,
      y,
      moonSize
    );
    moonGradient.addColorStop(0, "#FFFFFF");
    moonGradient.addColorStop(0.8, "#E6E6FA");
    moonGradient.addColorStop(1, "#CCCCCC");

    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(x, y, moonSize, 0, Math.PI * 2);
    ctx.fill();

    // 달의 위상 표현 (간단한 그림자)
    if (phase < 0.5) {
      ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
      ctx.beginPath();
      ctx.arc(x + 2, y, moonSize * (1 - phase * 2), 0, Math.PI * 2);
      ctx.fill();
    }

    // 크레이터
    ctx.fillStyle = `rgba(180, 180, 180, ${0.2 + glowIntensity})`;
    ctx.beginPath();
    ctx.arc(x + 2, y - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 1, y + 3, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // 별 그리기
  const drawStars = (ctx: CanvasRenderingContext2D, stars: Star[]) => {
    ctx.save();

    stars.forEach((star) => {
      const twinkle =
        Math.sin(clockRef.current * 0.003 + star.twinkle) * 0.3 + 0.7;

      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  // 구름 그리기
  const drawClouds = (
    ctx: CanvasRenderingContext2D,
    clouds: Cloud[],
    width: number,
    height: number
  ) => {
    const getCloudColor = () => {
      switch (currentTheme.weather) {
        case "stormy":
          return "rgba(60, 60, 60, 0.95)";
        case "rainy":
          return "rgba(120, 120, 120, 0.85)";
        case "cloudy":
          return "rgba(180, 180, 180, 0.8)";
        case "foggy":
          return "rgba(200, 200, 200, 0.6)";
        default:
          return currentTheme.timeOfDay === "night"
            ? "rgba(200, 200, 220, 0.6)"
            : "rgba(255, 255, 255, 0.7)";
      }
    };

    ctx.save();

    clouds.forEach((cloud, index) => {
      cloud.x += cloud.speed * performanceConfig.cloudSpeed;

      // 구름이 화면 전체를 순환하도록 (영역 제한 없음)
      if (cloud.x > width + 120) {
        cloud.x = -150;
      }

      const cloudX = cloud.x;
      const cloudY = cloud.y + Math.sin(clockRef.current * 0.0005 + index) * 3;
      const scale = cloud.scale;

      ctx.fillStyle = getCloudColor();
      ctx.globalAlpha = cloud.opacity * performanceConfig.cloudOpacity;

      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 28 * scale, 0, Math.PI * 2);
      ctx.arc(cloudX + 45 * scale, cloudY - 5, 35 * scale, 0, Math.PI * 2);
      ctx.arc(cloudX + 85 * scale, cloudY, 25 * scale, 0, Math.PI * 2);

      if (currentTheme.weather === "stormy") {
        ctx.arc(cloudX + 25 * scale, cloudY + 15, 20 * scale, 0, Math.PI * 2);
      }

      ctx.fill();

      if (currentTheme.weather === "stormy") {
        ctx.fillStyle = "rgba(40, 40, 40, 0.3)";
        ctx.beginPath();
        ctx.arc(cloudX + 10, cloudY + 10, 25 * scale, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, cloudY + 5, 30 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  };

  // 날씨 파티클
  const drawWeatherParticles = (
    ctx: CanvasRenderingContext2D,
    particles: Particle[],
    width: number,
    height: number
  ) => {
    if (currentTheme.weather === "sunny" || currentTheme.weather === "cloudy")
      return;

    const weather = currentTheme.weather;
    ctx.save();

    particles.forEach((particle) => {
      if (weather === "foggy") {
        particle.x += particle.vx;
        if (particle.x > width + 50) particle.x = -50;

        ctx.fillStyle = "rgba(220, 220, 220, 0.15)";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.y > height) {
          particle.y = -10;
          particle.x = Math.random() * width;
        }

        if (weather === "snowy") {
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (weather === "rainy" || weather === "stormy") {
          let rainColor;

          if (weather === "stormy") {
            rainColor = "rgba(120, 120, 180, 0.8)";
          } else {
            switch (currentTheme.timeOfDay) {
              case "morning":
              case "afternoon":
                rainColor = "rgba(140, 140, 140, 0.75)";
                break;
              case "evening":
              case "dawn":
                rainColor = "rgba(220, 220, 240, 0.9)";
                break;
              case "night":
                rainColor = "rgba(220, 220, 240, 0.9)";
                break;
              default:
                rainColor = "rgba(180, 180, 200, 0.8)";
            }
          }

          ctx.strokeStyle = rainColor;
          ctx.lineWidth = weather === "stormy" ? 1.5 : 1.2;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - 15, particle.y - 75); // 내리는 빗줄기
          ctx.stroke();
        }
      }
    });

    ctx.restore();
  };

  // 하늘 그라데이션
  const drawSkyGradient = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const getSkyColors = (): [string, string] => {
      const weather = currentTheme.weather;
      const time = currentTheme.timeOfDay;

      if (weather === "stormy") {
        return ["#2C3E50", "#34495E"];
      }

      switch (time) {
        case "dawn":
          return ["#FF6B6B", "#FFE66D"];
        case "morning":
          return ["#74C0FC", "#E0F6FF"];
        case "afternoon":
          return ["#87CEEB", "#F0F8FF"];
        case "evening":
          return ["#FF7F50", "#DDA0DD"];
        case "night":
          return ["#1B2951", "#2C3E50"];
        default:
          return ["#87CEEB", "#F0F8FF"];
      }
    };

    const [topColor, bottomColor] = getSkyColors();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  // 위치 정보가 있을 때 실제 일출/일몰 데이터 가져오기
  useEffect(() => {
    if (locationInfo.coordinates && isSmartMode) {
      const { lat, lon } = locationInfo.coordinates;
      fetchSunriseData(lat, lon);
      console.log(
        `🌍 Location available: ${lat.toFixed(2)}, ${lon.toFixed(
          2
        )} - Fetching sunrise data`
      );
    }
  }, [locationInfo.coordinates, isSmartMode]);

  // 초기화 및 화면 크기 변경 감지
  useEffect(() => {
    const initializeElements = () => {
      const newStars: Star[] = [];
      const starCount = performanceConfig.starCount;

      // 모바일에서 안전한 영역에 별 생성
      const safeWidth = isMobile ? window.innerWidth * 0.9 : window.innerWidth;
      const safeHeight = isMobile
        ? window.innerHeight * 0.7
        : window.innerHeight * 0.6;
      const offsetX = isMobile ? window.innerWidth * 0.05 : 0;
      const offsetY = isMobile ? window.innerHeight * 0.1 : 0;

      for (let i = 0; i < starCount; i++) {
        newStars.push({
          x: offsetX + Math.random() * safeWidth,
          y: offsetY + Math.random() * safeHeight,
          size: Math.random() * 1.5 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
      setStarPositions(newStars);

      const newClouds: Cloud[] = [];
      const cloudCount = performanceConfig.cloudCount;

      // 구름을 화면 전체에 분포시키되, 천체 영역 중심으로 밀도 높게 배치
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // 천체들이 있는 중심 영역 계산 (현재 화면 크기 기준)
      const celestialCenterX = screenWidth * 0.5;
      const celestialCenterY = screenHeight * 0.35;
      const celestialRadius = Math.min(screenWidth, screenHeight) * 0.3;

      for (let i = 0; i < cloudCount; i++) {
        let cloudX, cloudY;

        // 70%는 천체 중심 영역에, 30%는 화면 전체에 랜덤 배치
        if (Math.random() < 0.7) {
          // 천체 중심 영역에 집중 배치 (가우시안 분포 근사)
          const angle = Math.random() * Math.PI * 2;
          const distance =
            (Math.random() + Math.random()) * 0.5 * celestialRadius; // 중심에 더 많이
          cloudX = celestialCenterX + Math.cos(angle) * distance - 100;
          cloudY = celestialCenterY + Math.sin(angle) * distance * 0.6; // 세로는 좀 더 평평하게
        } else {
          // 화면 전체에 랜덤 배치
          cloudX = Math.random() * screenWidth - 100;
          cloudY = screenHeight * 0.1 + Math.random() * screenHeight * 0.6;
        }

        newClouds.push({
          x: cloudX,
          y: cloudY,
          scale: Math.random() * 0.4 + (isMobile ? 0.5 : 0.6),
          speed: Math.random() * 0.1 + performanceConfig.cloudSpeed,
          opacity: Math.random() * 0.3 + 0.7,
        });
      }
      setCloudPositions(newClouds);
    };

    // 초기 실행
    initializeElements();

    // 화면 크기 변경 감지하여 구름 재배치
    const handleResize = () => {
      setTimeout(initializeElements, 100); // 약간 지연으로 렌더링 안정화
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentTheme.weather, performanceConfig, isMobile]);

  // 날씨별 파티클 생성
  useEffect(() => {
    if (currentTheme.weather === "sunny" || currentTheme.weather === "cloudy") {
      setParticlePositions([]);
      return;
    }

    const count =
      performanceConfig.particleCount[
        currentTheme.weather as keyof typeof performanceConfig.particleCount
      ] || 50;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      if (currentTheme.weather === "foggy") {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y:
            window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.4,
          vx: Math.random() * 0.3 + 0.1,
          vy: 0,
          size: Math.random() * 333 + 100,
        });
      } else {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: Math.random() * 0.25 - 0.0001,
          vy:
            currentTheme.weather === "snowy"
              ? Math.random() * 2.5 + 1
              : Math.random() * 30 + 70,
          size: Math.random() * 5 + 3,
        });
      }
    }

    setParticlePositions(newParticles);
  }, [currentTheme.weather, performanceConfig]);

  // 최적화된 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const frameInterval = 1000 / performanceConfig.targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastFrameTimeRef.current < frameInterval) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTimeRef.current = currentTime;
      clockRef.current += 1;

      const { width, height } = canvas;

      // 매 프레임마다 천체 위치 업데이트
      let currentSunPosition = realtimeSunPositionRef.current;
      let currentMoonPosition = realtimeMoonPositionRef.current;

      if (clockRef.current % 120 === 0 || !isSmartMode) {
        // 스마트 모드: 2초마다 위치 재계산 (60fps 기준)
        // 테스트 모드: 매 프레임마다 선택된 시간대 기반으로 계산
        const positions = calculateCelestialPositions(canvas);

        if (isSmartMode) {
          // 스마트 모드에서만 ref 업데이트
          realtimeSunPositionRef.current = positions.sunPosition;
          realtimeMoonPositionRef.current = positions.moonPosition;
        }

        // 현재 프레임에서 사용할 위치 설정
        currentSunPosition = positions.sunPosition;
        currentMoonPosition = positions.moonPosition;
      }

      // 렌더링
      drawSkyGradient(ctx, width, height);
      drawClouds(ctx, cloudPositions, width, height);

      const visibility = getCelestialVisibility();

      if (visibility.stars && starPositions.length > 0) {
        drawStars(ctx, starPositions);
      }

      // 실시간 해/달 그리기
      if (visibility.moon) {
        drawRealtimeMoon(ctx, currentMoonPosition);
      }

      if (visibility.sun) {
        drawRealtimeSun(ctx, currentSunPosition);
      }

      if (particlePositions.length > 0) {
        drawWeatherParticles(ctx, particlePositions, width, height);
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [
    currentTheme,
    starPositions,
    cloudPositions,
    particlePositions,
    performanceConfig,
    isSmartMode, // 스마트 모드 상태 변화도 감지
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -20,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
};
