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

  // 📱 모바일 감지 및 성능 설정
  const isMobile = useMemo(() => {
    return (
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768
    );
  }, []);

  const performanceConfig = useMemo(
    () => ({
      targetFPS: isMobile ? 30 : 60,
      starCount: isMobile ? 30 : 50,
      cloudCount: isMobile ? 3 : 4,
      particleCount: {
        rainy: isMobile ? 50 : 80,
        snowy: isMobile ? 30 : 50,
        stormy: isMobile ? 80 : 120,
        foggy: isMobile ? 15 : 25,
      },
    }),
    [isMobile]
  );

  const [starPositions, setStarPositions] = useState<Star[]>([]);
  const [cloudPositions, setCloudPositions] = useState<Cloud[]>([]);
  const [particlePositions, setParticlePositions] = useState<Particle[]>([]);

  // 🌅 천체 가시성
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

  // 🌞 위치 계산
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

  // 🌞 세련된 해 (광선 차분하게)
  const drawSun = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    timeOfDay: TimeOfDay
  ) => {
    const isGoldenHour = timeOfDay === "dawn" || timeOfDay === "evening";
    const sunColor = isGoldenHour ? "#FF8C42" : "#FFD700";

    ctx.save();

    // ☀️ 차분한 광선 (8개, 천천히 회전)
    const rayRotation = clockRef.current * 0.001; // 매우 천천히
    for (let i = 0; i < 8; i++) {
      const angle = ((i * 45 + rayRotation * 10) * Math.PI) / 180; // 느린 회전
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

    // 🌟 부드러운 외부 글로우
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
    glowGradient.addColorStop(0, `rgba(255, 212, 0, 0.2)`);
    glowGradient.addColorStop(1, "rgba(255, 212, 0, 0)");

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fill();

    // 🌞 메인 해
    const sunGradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, 18);
    sunGradient.addColorStop(0, "#FFFF99");
    sunGradient.addColorStop(0.8, sunColor);
    sunGradient.addColorStop(1, isGoldenHour ? "#CC5500" : "#E6AC00");

    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    // ✨ 하이라이트
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(x - 5, y - 5, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // 🌙 달
  const drawMoon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();

    // 🌟 달빛 글로우
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
    glowGradient.addColorStop(0, "rgba(230, 230, 250, 0.3)");
    glowGradient.addColorStop(1, "rgba(230, 230, 250, 0)");

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    // 🌙 메인 달
    const moonGradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 15);
    moonGradient.addColorStop(0, "#FFFFFF");
    moonGradient.addColorStop(0.8, "#E6E6FA");
    moonGradient.addColorStop(1, "#CCCCCC");

    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    // 🌒 크레이터
    ctx.fillStyle = "rgba(180, 180, 180, 0.3)";
    ctx.beginPath();
    ctx.arc(x + 3, y - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 1, y + 5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // ⭐ 별들 (반짝임 최적화)
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

  // ☁️ 구름 (최적화)
  const drawClouds = (
    ctx: CanvasRenderingContext2D,
    clouds: Cloud[],
    width: number,
    height: number
  ) => {
    const getCloudColor = () => {
      switch (currentTheme.weather) {
        case "stormy":
          return "rgba(80, 80, 80, 0.8)";
        case "foggy":
          return "rgba(200, 200, 200, 0.88)";
        case "rainy":
          return "rgba(160, 160, 160, 0.8)";
        default:
          return currentTheme.timeOfDay === "night"
            ? "rgba(200, 200, 220, 0.6)"
            : "rgba(255, 255, 255, 0.8)";
      }
    };

    ctx.save();
    ctx.fillStyle = getCloudColor();

    clouds.forEach((cloud, index) => {
      cloud.x += cloud.speed;
      if (cloud.x > width + 80) cloud.x = -120;

      const cloudX = cloud.x;
      const cloudY = cloud.y + Math.sin(clockRef.current * 0.0005 + index) * 2;
      const scale = cloud.scale;

      // 🌫️ 간단한 구름 (성능 최적화)
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 25 * scale, 0, Math.PI * 2);
      ctx.arc(cloudX + 20 * scale, cloudY, 30 * scale, 0, Math.PI * 2);
      ctx.arc(cloudX + 40 * scale, cloudY, 22 * scale, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  // 🌧️❄️🌫️ 개선된 날씨 파티클
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
        // 🌫️ 안개는 가로로 움직임
        particle.x += particle.vx;
        if (particle.x > width + 50) particle.x = -50;

        ctx.fillStyle = "rgba(220, 220, 220, 0.66)";
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
          // ❄️ 눈은 원으로
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (weather === "rainy" || weather === "stormy") {
          // 🌧️ 비는 / 모양으로
          ctx.strokeStyle =
            weather === "stormy"
              ? "rgba(120, 120, 180, 0.8)"
              : "rgba(100, 150, 200, 0.7)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - 3, particle.y - 8); // / 모양
          ctx.stroke();
        }
      }
    });

    ctx.restore();
  };

  // 🌈 하늘 그라데이션
  const drawSkyGradient = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const getSkyColors = (): [string, string] => {
      const weather = currentTheme.weather;
      const time = currentTheme.timeOfDay;

      if (weather === "stormy") {
        return ["#34495E", "#2C3E50"];
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

  // 🎬 초기화
  useEffect(() => {
    if (starPositions.length === 0) {
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
    }

    if (cloudPositions.length === 0) {
      const newClouds: Cloud[] = [];
      for (let i = 0; i < performanceConfig.cloudCount; i++) {
        newClouds.push({
          x: Math.random() * window.innerWidth,
          y:
            window.innerHeight * 0.15 +
            Math.random() * window.innerHeight * 0.25,
          scale: Math.random() * 0.3 + 0.7,
          speed: Math.random() * 0.15 + 0.05,
        });
      }
      setCloudPositions(newClouds);
    }
  }, [starPositions.length, cloudPositions.length, performanceConfig]);

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
          vx: Math.random() * 0.3 + 0.1, // 가로로만 움직임
          vy: 0,
          size: Math.random() * 80 + 4,
        });
      } else {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: Math.random() * 0.5 - 0.25, // 약간의 좌우 흔들림
          vy:
            currentTheme.weather === "snowy"
              ? Math.random() * 0.8 + 0.3 // 눈은 천천히
              : Math.random() * 2 + 1.5, // 비는 빠르게
          size: Math.random() * 2 + 1,
        });
      }
    }

    setParticlePositions(newParticles);
  }, [currentTheme.weather, performanceConfig]);

  // 🎥 최적화된 렌더링
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
      // 📱 FPS 제한으로 성능 최적화
      if (currentTime - lastFrameTimeRef.current < frameInterval) {
        animationIdRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTimeRef.current = currentTime;
      clockRef.current += 1;

      const { width, height } = canvas;

      // 🎨 렌더링
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
