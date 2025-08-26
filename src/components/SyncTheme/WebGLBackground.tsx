import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useTheme } from "./useTheme";
import type { WeatherType, TimeOfDay } from "./theme.types";

interface WebGLBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  enableParticles?: boolean;
  enableCelestialBodies?: boolean;
  enableClouds?: boolean;
}

export const WebGLBackground: React.FC<WebGLBackgroundProps> = ({
  className,
  style,
  enableParticles = true,
  enableCelestialBodies = true,
  enableClouds = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTheme } = useTheme();

  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationIdRef = useRef<number>();

  // 3D 객체들
  const sunRef = useRef<THREE.Mesh>();
  const moonRef = useRef<THREE.Mesh>();
  const cloudsRef = useRef<THREE.Group>();
  const particlesRef = useRef<THREE.Points>();
  const starsRef = useRef<THREE.Points>();

  // 🕐 시간 진행도 계산 (실제 시간 or 테마 시간)
  const getRealTimeProgress = (): number => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * 60 + minutes) / (24 * 60);
  };

  // 🎭 테마 시간에 따른 진행도 계산
  const getThemeTimeProgress = (timeOfDay: TimeOfDay): number => {
    switch (timeOfDay) {
      case "dawn":
        return 0.25; // 6시 (동쪽, 일출)
      case "morning":
        return 0.4; // 9시 30분 (동쪽~정점 중간)
      case "afternoon":
        return 0.6; // 14시 30분 (정점~서쪽 중간)
      case "evening":
        return 0.75; // 18시 (서쪽, 일몰)
      case "night":
        return 0.0; // 0시 (달이 정점)
      default:
        return getRealTimeProgress(); // 기본값은 실제 시간
    }
  };

  // 🌅 현재 사용할 시간 진행도 (테마 우선, 실제 시간은 참고용)
  const getCurrentTimeProgress = (): number => {
    return getThemeTimeProgress(currentTheme.timeOfDay);
  };

  // 🌞🌙 천체 위치 계산 (실제 시간 기반)
  const getCelestialPosition = (
    timeProgress: number,
    isSun: boolean
  ): [number, number, number] => {
    let angle: number;

    if (isSun) {
      // 태양: 6시(동쪽) → 12시(정점) → 18시(서쪽)
      if (timeProgress >= 0.25 && timeProgress <= 0.75) {
        // 6시-18시
        angle = (timeProgress - 0.25) * Math.PI; // 0 to π
      } else {
        angle = Math.PI; // 밤에는 지평선 아래
      }
    } else {
      // 달: 18시(동쪽) → 0시(정점) → 6시(서쪽)
      if (timeProgress >= 0.75 || timeProgress <= 0.25) {
        // 18시-6시
        const adjustedTime =
          timeProgress >= 0.75 ? timeProgress - 0.75 : timeProgress + 0.25;
        angle = adjustedTime * Math.PI;
      } else {
        angle = Math.PI; // 낮에는 지평선 아래
      }
    }

    const radius = 40; // 반지름 줄임
    const x = Math.cos(angle - Math.PI / 2) * radius;
    const y = Math.sin(angle - Math.PI / 2) * radius + 5; // 수평선 조금만 올림
    const z = -10; // 더 가까이

    return [x, y, z];
  };

  // 천체 가시성 체크
  const isCelestialVisible = (
    timeProgress: number,
    isSun: boolean
  ): boolean => {
    if (isSun) {
      return timeProgress >= 0.25 && timeProgress <= 0.75; // 6시-18시
    } else {
      return timeProgress >= 0.75 || timeProgress <= 0.25; // 18시-6시
    }
  };

  // 파티클 시스템 생성 (날씨별)
  const createParticleSystem = (weather: WeatherType): THREE.Points | null => {
    if (weather === "sunny" || weather === "cloudy") {
      return null; // 맑음/흐림은 파티클 없음
    }

    let particleCount = 1000;
    let particleSize = 1;
    let particleColor = 0xffffff;
    let fallSpeed = -1;

    switch (weather) {
      case "rainy":
        particleCount = 1500;
        particleSize = 0.5;
        particleColor = 0x4a90e2;
        fallSpeed = -2.0;
        break;
      case "snowy":
        particleCount = 800;
        particleSize = 2.0;
        particleColor = 0xffffff;
        fallSpeed = -0.3;
        break;
      case "stormy":
        particleCount = 2000;
        particleSize = 0.8;
        particleColor = 0x6a5acd;
        fallSpeed = -3.0;
        break;
      case "foggy":
        particleCount = 400;
        particleSize = 4.0;
        particleColor = 0xcccccc;
        fallSpeed = -0.1;
        break;
      default:
        return null;
    }

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 100; // 범위 줄임
      positions[i3 + 1] = Math.random() * 50 + 25;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;

      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = fallSpeed + Math.random() * 0.5;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      size: particleSize,
      color: particleColor,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
  };

  // 구름 생성
  const createClouds = (): THREE.Group => {
    const cloudGroup = new THREE.Group();

    for (let i = 0; i < 6; i++) {
      const cloudGeometry = new THREE.SphereGeometry(4, 16, 16);
      const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
      });

      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.position.set(
        (Math.random() - 0.5) * 80,
        Math.random() * 15 + 15,
        (Math.random() - 0.5) * 40
      );

      const scale = Math.random() * 0.5 + 0.5;
      cloud.scale.set(scale, scale * 0.6, scale);

      cloudGroup.add(cloud);
    }

    return cloudGroup;
  };

  // 별 생성
  const createStars = (): THREE.Points => {
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(500 * 3);

    for (let i = 0; i < 500; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = Math.random() * 50 + 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 200;
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.8,
    });

    return new THREE.Points(starGeometry, starMaterial);
  };

  // 초기화
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      console.log("🌟 Initializing full WebGL background...");

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 30); // 적당한 거리
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0); // 투명 배경
      rendererRef.current = renderer;

      // 조명
      const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
      scene.add(ambientLight);

      // 🌞 태양 생성 (더 크게, 항상 보이게 시작)
      if (enableCelestialBodies) {
        const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);

        // 초기 위치 설정 (테마 시간 기준)
        const currentTime = getCurrentTimeProgress();
        const sunPos = getCelestialPosition(currentTime, true);
        sun.position.set(...sunPos);
        sun.visible = isCelestialVisible(currentTime, true);

        scene.add(sun);
        sunRef.current = sun;
        console.log(
          "☀️ Sun created at:",
          sunPos,
          "Visible:",
          sun.visible,
          "Time:",
          currentTheme.timeOfDay
        );

        // 🌙 달 생성
        const moonGeometry = new THREE.SphereGeometry(2.5, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xe6e6fa });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);

        // 초기 위치 설정 (테마 시간 기준)
        const moonPos = getCelestialPosition(currentTime, false);
        moon.position.set(...moonPos);
        moon.visible = isCelestialVisible(currentTime, false);

        scene.add(moon);
        moonRef.current = moon;
        console.log(
          "🌙 Moon created at:",
          moonPos,
          "Visible:",
          moon.visible,
          "Time:",
          currentTheme.timeOfDay
        );
      }

      // 별 생성
      if (enableCelestialBodies) {
        const stars = createStars();
        scene.add(stars);
        starsRef.current = stars;
        console.log("⭐ Stars created");
      }

      // 구름 생성
      if (enableClouds) {
        const clouds = createClouds();
        scene.add(clouds);
        cloudsRef.current = clouds;
        console.log("☁️ Clouds created");
      }

      // 파티클 생성
      if (enableParticles) {
        const particles = createParticleSystem(currentTheme.weather);
        if (particles) {
          scene.add(particles);
          particlesRef.current = particles;
          console.log("🌧️ Particles created for:", currentTheme.weather);
        }
      }

      // 리사이즈 핸들러
      const handleResize = () => {
        if (camera && renderer) {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
      };
    } catch (error) {
      console.error("❌ WebGL initialization failed:", error);
    }
  }, [enableParticles, enableCelestialBodies, enableClouds]);

  // 테마 시간 변경 시 천체 위치 즉시 업데이트
  useEffect(() => {
    if (!enableCelestialBodies || !sunRef.current || !moonRef.current) return;

    const timeProgress = getCurrentTimeProgress();

    // 태양 위치 및 가시성 업데이트
    const sunPos = getCelestialPosition(timeProgress, true);
    const sunVisible = isCelestialVisible(timeProgress, true);

    sunRef.current.position.set(...sunPos);
    sunRef.current.visible = sunVisible;

    // 일출/일몰 색상 즉시 적용
    if (sunVisible) {
      const material = sunRef.current.material as THREE.MeshBasicMaterial;
      const isGoldenHour =
        currentTheme.timeOfDay === "dawn" ||
        currentTheme.timeOfDay === "evening";
      material.color.setHex(isGoldenHour ? 0xff6b47 : 0xffd700);
    }

    // 달 위치 및 가시성 업데이트
    const moonPos = getCelestialPosition(timeProgress, false);
    const moonVisible = isCelestialVisible(timeProgress, false);

    moonRef.current.position.set(...moonPos);
    moonRef.current.visible = moonVisible;

    // 별 가시성 업데이트
    if (starsRef.current) {
      const isNightTime =
        currentTheme.timeOfDay === "night" || currentTheme.timeOfDay === "dawn";
      starsRef.current.visible = isNightTime;
    }

    console.log(`🔄 Theme changed to ${currentTheme.timeOfDay}:`, {
      sun: { pos: sunPos, visible: sunVisible },
      moon: { pos: moonPos, visible: moonVisible },
      stars: starsRef.current?.visible,
    });
  }, [currentTheme.timeOfDay, enableCelestialBodies]);

  // 날씨 변경 시 파티클 업데이트
  useEffect(() => {
    if (!sceneRef.current) return;

    // 기존 파티클 제거
    if (particlesRef.current) {
      sceneRef.current.remove(particlesRef.current);
      particlesRef.current = undefined as any;
    }

    // 새 파티클 생성
    if (enableParticles) {
      const newParticles = createParticleSystem(currentTheme.weather);
      if (newParticles) {
        sceneRef.current.add(newParticles);
        particlesRef.current = newParticles;
        console.log("🔄 Particles updated for:", currentTheme.weather);
      }
    }
  }, [currentTheme.weather, enableParticles]);

  // 애니메이션 루프
  useEffect(() => {
    const animate = () => {
      if (!sceneRef.current || !rendererRef.current || !cameraRef.current)
        return;

      try {
        const timeProgress = getCurrentTimeProgress(); // 테마 시간 사용!
        console.log(
          `🕐 Theme time: ${
            currentTheme.timeOfDay
          } → Progress: ${timeProgress.toFixed(3)}`
        );

        // 🌞🌙 실시간 천체 이동
        if (enableCelestialBodies && sunRef.current && moonRef.current) {
          // 태양 업데이트
          const sunPos = getCelestialPosition(timeProgress, true);
          const sunVisible = isCelestialVisible(timeProgress, true);

          sunRef.current.position.set(...sunPos);
          sunRef.current.visible = sunVisible;

          // 🌅🌇 테마 기반 일출/일몰 색상
          if (sunVisible) {
            const material = sunRef.current.material as THREE.MeshBasicMaterial;
            const isGoldenHour =
              currentTheme.timeOfDay === "dawn" ||
              currentTheme.timeOfDay === "evening";
            material.color.setHex(isGoldenHour ? 0xff6b47 : 0xffd700);
          }

          // 달 업데이트
          const moonPos = getCelestialPosition(timeProgress, false);
          const moonVisible = isCelestialVisible(timeProgress, false);

          moonRef.current.position.set(...moonPos);
          moonRef.current.visible = moonVisible;
        }

        // ⭐ 별 가시성 (밤과 새벽에만)
        if (starsRef.current) {
          const isNightTime =
            currentTheme.timeOfDay === "night" ||
            currentTheme.timeOfDay === "dawn";
          starsRef.current.visible = isNightTime;
        }

        // ☁️ 구름 애니메이션
        if (enableClouds && cloudsRef.current) {
          cloudsRef.current.children.forEach((cloud, index) => {
            cloud.position.x += 0.01 * (index % 2 === 0 ? 1 : -1);

            if (cloud.position.x > 50) cloud.position.x = -50;
            if (cloud.position.x < -50) cloud.position.x = 50;
          });

          // 날씨별 구름 스타일
          const opacity =
            currentTheme.weather === "cloudy"
              ? 0.8
              : currentTheme.weather === "stormy"
              ? 0.9
              : 0.6;

          cloudsRef.current.children.forEach((cloud) => {
            const mesh = cloud as THREE.Mesh;
            const material = mesh.material as THREE.MeshBasicMaterial;
            material.opacity = opacity;
            material.color.setHex(
              currentTheme.weather === "stormy" ? 0x666666 : 0xffffff
            );
          });
        }

        // 🌧️❄️ 파티클 애니메이션
        if (enableParticles && particlesRef.current) {
          const positions = particlesRef.current.geometry.attributes.position;
          const velocities = particlesRef.current.geometry.attributes.velocity;

          if (positions && velocities) {
            const posArray = positions.array as Float32Array;
            const velArray = velocities.array as Float32Array;

            for (let i = 0; i < posArray.length; i += 3) {
              posArray[i] += velArray[i];
              posArray[i + 1] += velArray[i + 1];
              posArray[i + 2] += velArray[i + 2];

              // 파티클 리셋
              if (posArray[i + 1] < -5) {
                posArray[i + 1] = 30 + Math.random() * 10;
                posArray[i] = (Math.random() - 0.5) * 100;
                posArray[i + 2] = (Math.random() - 0.5) * 50;
              }
            }

            positions.needsUpdate = true;
          }
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        animationIdRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.error("❌ Animation error:", error);
      }
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [currentTheme, enableParticles, enableCelestialBodies, enableClouds]);

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
        zIndex: -2,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
};
