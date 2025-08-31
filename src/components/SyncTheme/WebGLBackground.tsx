import React, { useRef, useEffect, useState, useMemo } from "react";
import { useTheme } from "./useTheme";
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
  opacity: number; // 구름 투명도 추가
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export const WebGLBackground: React.FC<CanvasBackgroundProps> = ({
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTheme } = useTheme();
  const animationIdRef = useRef<number>();
  const clockRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

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
        return {
          count: Math.floor(baseCount * 0.5), // 절반으로 줄임
          opacity: 0.6,
          speed: 0.05,
        };
      case "cloudy":
        return {
          count: Math.floor(baseCount * 2.5), // 2.5배 증가
          opacity: 0.9,
          speed: 0.08,
        };
      case "rainy":
        return {
          count: Math.floor(baseCount * 2), // 2배 증가
          opacity: 0.85,
          speed: 0.12,
        };
      case "stormy":
        return {
          count: Math.floor(baseCount * 4), // 4배 증가 (엄청 많이)
          opacity: 0.95,
          speed: 0.15,
        };
      case "snowy":
        return {
          count: Math.floor(baseCount * 3), // 3배 증가 (눈구름)
          opacity: 0.85,
          speed: 0.07,
        };
      case "foggy":
        return {
          count: Math.floor(baseCount * 1.8), // 1.8배 증가
          opacity: 0.7,
          speed: 0.04,
        };
      default:
        return {
          count: baseCount,
          opacity: 0.8,
          speed: 0.08,
        };
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

  // 천체 가시성
  const getCelestialVisibility = (timeOfDay: TimeOfDay) => {
    switch (timeOfDay) {
      case "dawn":
        return { sun: true, moon: true, stars: true };
      case "morning":
      case "afternoon":
        return { sun: true, moon: false, stars: false };
      case "evening":
        return { sun: false, moon: true, stars: true };
      case "night":
        return { sun: false, moon: true, stars: true };
      default:
        return { sun: true, moon: false, stars: false };
    }
  };

  // 위치 계산
  const getSunPosition = (timeOfDay: TimeOfDay, canvas: HTMLCanvasElement) => {
    const { width, height } = canvas;
    const centerY = height * 0.25;

    switch (timeOfDay) {
      case "dawn":
        return { x: width * 0.2, y: centerY + 40 };
      case "morning":
        return { x: width * 0.35, y: centerY - 20 };
      case "afternoon":
        return { x: width * 0.65, y: centerY - 20 };
      default:
        return { x: width * 0.8, y: centerY + 40 };
    }
  };

  const getMoonPosition = (timeOfDay: TimeOfDay, canvas: HTMLCanvasElement) => {
    const { width, height } = canvas;
    const centerY = height * 0.2;

    switch (timeOfDay) {
      case "dawn":
        return { x: width * 0.75, y: centerY };
      case "evening":
        return { x: width * 0.25, y: centerY };
      case "night":
        return { x: width * 0.5, y: centerY - 30 };
      default:
        return { x: width * 0.5, y: centerY };
    }
  };

  // 해 그리기
  const drawSun = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    timeOfDay: TimeOfDay
  ) => {
    const isGoldenHour = timeOfDay === "dawn" || timeOfDay === "evening";
    const sunColor = isGoldenHour ? "#FF8C42" : "#FFD700";

    ctx.save();

    // 광선
    const rayRotation = clockRef.current * 0.001;
    for (let i = 0; i < 8; i++) {
      const angle = ((i * 45 + rayRotation * 10) * Math.PI) / 180;
      const rayLength = 45;

      const gradient = ctx.createLinearGradient(
        x,
        y,
        x + Math.cos(angle) * rayLength,
        y + Math.sin(angle) * rayLength
      );
      gradient.addColorStop(0, `rgba(255, 212, 0, 0.4)`);
      gradient.addColorStop(1, `rgba(255, 212, 0, 0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * rayLength,
        y + Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }

    // 외부 글로우
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
    glowGradient.addColorStop(0, `rgba(255, 212, 0, 0.2)`);
    glowGradient.addColorStop(1, "rgba(255, 212, 0, 0)");

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fill();

    // 메인 해
    const sunGradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, 18);
    sunGradient.addColorStop(0, "#FFFF99");
    sunGradient.addColorStop(0.8, sunColor);
    sunGradient.addColorStop(1, isGoldenHour ? "#CC5500" : "#E6AC00");

    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    // 하이라이트
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // 달 그리기
  const drawMoon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();

    // 달빛 글로우
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
    glowGradient.addColorStop(0, "rgba(230, 230, 250, 0.3)");
    glowGradient.addColorStop(1, "rgba(230, 230, 250, 0)");

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    // 메인 달
    const moonGradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 15);
    moonGradient.addColorStop(0, "#FFFFFF");
    moonGradient.addColorStop(0.8, "#E6E6FA");
    moonGradient.addColorStop(1, "#CCCCCC");

    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    // 크레이터
    ctx.fillStyle = "rgba(180, 180, 180, 0.3)";
    ctx.beginPath();
    ctx.arc(x + 3, y - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 1, y + 5, 1.5, 0, Math.PI * 2);
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

  // 날씨별 구름 그리기 (밀도 조정)
  const drawClouds = (
    ctx: CanvasRenderingContext2D,
    clouds: Cloud[],
    width: number,
    height: number
  ) => {
    const getCloudColor = () => {
      switch (currentTheme.weather) {
        case "stormy":
          return "rgba(60, 60, 60, 0.95)"; // 매우 어두운 폭풍구름
        case "rainy":
          return "rgba(120, 120, 120, 0.85)"; // 어두운 비구름
        case "cloudy":
          return "rgba(180, 180, 180, 0.8)"; // 일반 구름
        case "foggy":
          return "rgba(200, 200, 200, 0.6)"; // 연한 안개구름
        default:
          return currentTheme.timeOfDay === "night"
            ? "rgba(200, 200, 220, 0.6)"
            : "rgba(255, 255, 255, 0.7)"; // 맑은 날 구름
      }
    };

    ctx.save();

    clouds.forEach((cloud, index) => {
      // 구름 이동
      cloud.x += cloud.speed * performanceConfig.cloudSpeed;
      if (cloud.x > width + 120) cloud.x = -150;

      const cloudX = cloud.x;
      const cloudY = cloud.y + Math.sin(clockRef.current * 0.0005 + index) * 3;
      const scale = cloud.scale;

      // 날씨별 구름 색상과 투명도 적용
      ctx.fillStyle = getCloudColor();
      ctx.globalAlpha = cloud.opacity * performanceConfig.cloudOpacity;

      // 구름 모양 (더 볼륨감 있게)
      ctx.beginPath();
      // 첫 번째 구름 덩어리
      ctx.arc(cloudX, cloudY, 28 * scale, 0, Math.PI * 2);
      // 두 번째 구름 덩어리 (더 크게)
      ctx.arc(cloudX + 45 * scale, cloudY - 5, 35 * scale, 0, Math.PI * 2);
      // 세 번째 구름 덩어리
      ctx.arc(cloudX + 85 * scale, cloudY, 25 * scale, 0, Math.PI * 2);
      // 네 번째 구름 덩어리 (폭풍시 추가)
      if (currentTheme.weather === "stormy") {
        ctx.arc(cloudX + 25 * scale, cloudY + 15, 20 * scale, 0, Math.PI * 2);
      }

      ctx.fill();

      // 폭풍구름의 경우 추가 그림자 효과
      if (currentTheme.weather === "stormy") {
        ctx.fillStyle = "rgba(40, 40, 40, 0.3)";
        ctx.beginPath();
        ctx.arc(cloudX + 10, cloudY + 10, 25 * scale, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, cloudY + 5, 30 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1; // 복원
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
        // 안개는 가로로 움직임
        particle.x += particle.vx;
        if (particle.x > width + 50) particle.x = -50;

        ctx.fillStyle = "rgba(220, 220, 220, 0.15)";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 다른 날씨는 아래로 떨어짐
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.y > height) {
          particle.y = -10;
          particle.x = Math.random() * width;
        }

        if (weather === "snowy") {
          // 눈은 원으로
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (weather === "rainy" || weather === "stormy") {
          // 비는 선으로 - 시간대별 색상 조정
          let rainColor;

          if (weather === "stormy") {
            rainColor = "rgba(120, 120, 180, 0.8)";
          } else {
            // rainy 날씨의 시간대별 색상
            switch (currentTheme.timeOfDay) {
              case "morning":
              case "afternoon":
                rainColor = "rgba(140, 140, 140, 0.75)"; // 어두운 파란색 (밝은 시간대용)
                break;
              case "evening":
              case "dawn":
                rainColor = "rgba(220, 220, 240, 0.9)"; // 중간 밝기
                break;
              case "night":
                rainColor = "rgba(220, 220, 240, 0.9)"; // 밝은 색상 (어두운 시간대용)
                break;
              default:
                rainColor = "rgba(180, 180, 200, 0.8)";
            }
          }

          ctx.strokeStyle = rainColor;
          ctx.lineWidth = weather === "stormy" ? 1.5 : 1.2; // 빗방울 선 두께 약간 증가
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - 25, particle.y - 75);
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
        return ["#2C3E50", "#34495E"]; // 더 어두운 폭풍 하늘
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

  // 초기화 및 날씨별 구름 생성
  useEffect(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < performanceConfig.starCount; i++) {
      newStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.5,
        size: Math.random() * 1.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
    setStarPositions(newStars);

    // 날씨별 구름 생성
    const newClouds: Cloud[] = [];
    for (let i = 0; i < performanceConfig.cloudCount; i++) {
      newClouds.push({
        x: Math.random() * window.innerWidth - 100,
        y: window.innerHeight * 0.15 + Math.random() * window.innerHeight * 0.3,
        scale: Math.random() * 0.4 + 0.6,
        speed: Math.random() * 0.1 + performanceConfig.cloudSpeed,
        opacity: Math.random() * 0.3 + 0.7, // 구름별 투명도 차이
      });
    }
    setCloudPositions(newClouds);

    console.log(
      `구름 생성: ${currentTheme.weather} → ${performanceConfig.cloudCount}개`
    );
  }, [currentTheme.weather, performanceConfig]);

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
              ? Math.random() * 0.5 + 2.2
              : Math.random() * 2.2 + 22,
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
      // FPS 제한으로 성능 최적화
      if (currentTime - lastFrameTimeRef.current < frameInterval) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTimeRef.current = currentTime;
      clockRef.current += 1;

      const { width, height } = canvas;

      // 렌더링
      drawSkyGradient(ctx, width, height);
      drawClouds(ctx, cloudPositions, width, height);

      const visibility = getCelestialVisibility(currentTheme.timeOfDay);

      if (visibility.stars && starPositions.length > 0) {
        drawStars(ctx, starPositions);
      }

      if (visibility.moon) {
        const moonPos = getMoonPosition(currentTheme.timeOfDay, canvas);
        drawMoon(ctx, moonPos.x, moonPos.y);
      }

      if (visibility.sun) {
        const sunPos = getSunPosition(currentTheme.timeOfDay, canvas);
        drawSun(ctx, sunPos.x, sunPos.y, currentTheme.timeOfDay);
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
