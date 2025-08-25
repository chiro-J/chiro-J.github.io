// theme-system/WebGLBackground.tsx

import React, { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useThemeContext } from "./ThemeProvider";
import {
  calculateSunPosition,
  calculateMoonPosition,
  calculateWeatherIntensity,
  isWebGLSupported,
} from "./utils";

/**
 * Three.js 씬 참조 타입
 */
interface SceneRef {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  sun: THREE.Group;
  moon: THREE.Mesh;
  stars: THREE.Points;
  clouds: THREE.Group;
  raindrops: THREE.Points;
  snowflakes: THREE.Points;
  sky: THREE.Mesh;
  animationId: number | null;
  lastUpdateTime: number;
}

/**
 * WebGL 기반 동적 배경 컴포넌트
 * 실시간 날씨와 시간을 반영한 3D 배경을 렌더링합니다.
 *
 * 특징:
 * - 실시간 태양/달 위치 계산
 * - 날씨별 파티클 효과 (비, 눈, 구름 등)
 * - 시간대별 하늘 색상 변화
 * - 성능 최적화된 렌더링
 */
export const WebGLBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneRef | null>(null);
  const { mode, weatherData, weatherCondition, timeOfDay } = useThemeContext();

  /**
   * WebGL 지원 여부 확인 및 폴백 렌더링
   */
  const renderFallback = useCallback(() => {
    const timeColors = {
      dawn: "from-orange-400 to-yellow-300",
      day: "from-blue-400 to-blue-100",
      dusk: "from-red-400 to-orange-300",
      night: "from-indigo-900 to-gray-900",
    };

    return (
      <div
        className={`fixed inset-0 bg-gradient-to-b ${timeColors[timeOfDay]} transition-all duration-1000 pointer-events-none`}
        style={{ zIndex: -1 }}
      />
    );
  }, [timeOfDay]);

  /**
   * Three.js 씬 초기화
   */
  const initScene = useCallback(() => {
    if (!canvasRef.current) return null;

    console.log("WebGL 씬 초기화 중...");

    // 기본 씬 설정
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // 카메라 위치
    camera.position.set(0, 0, 5);

    /**
     * 하늘 배경 (셰이더 기반 그라데이션)
     */
    const createSky = () => {
      const geometry = new THREE.SphereGeometry(100, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          topColor: { value: new THREE.Color(0x87ceeb) },
          bottomColor: { value: new THREE.Color(0xffffff) },
          offset: { value: 33 },
          exponent: { value: 0.6 },
          time: { value: 0.0 },
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          uniform float time;
          varying vec3 vWorldPosition;
          
          void main() {
            float h = normalize(vWorldPosition + offset).y;
            vec3 color = mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));
            
            // 구름 효과
            float clouds = sin(vWorldPosition.x * 0.01 + time * 0.1) * 
                          sin(vWorldPosition.z * 0.01 + time * 0.05) * 0.1;
            color += vec3(clouds * 0.1);
            
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.BackSide,
      });

      return new THREE.Mesh(geometry, material);
    };

    /**
     * 태양 생성 (글로우 효과 포함)
     */
    const createSun = () => {
      const group = new THREE.Group();

      // 메인 태양
      const sunGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.9,
      });
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);

      // 글로우 효과 (여러 층)
      for (let i = 1; i <= 3; i++) {
        const glowGeometry = new THREE.SphereGeometry(0.5 + i * 0.4, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.15, 1, 0.6),
          transparent: true,
          opacity: 0.2 / i,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
      }

      group.add(sun);
      return group;
    };

    /**
     * 달 생성
     */
    const createMoon = () => {
      const geometry = new THREE.SphereGeometry(0.35, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          uniform float time;
          
          void main() {
            // 달 표면 크레이터 효과
            float crater1 = smoothstep(0.7, 0.8, sin(vUv.x * 25.0) * sin(vUv.y * 25.0));
            float crater2 = smoothstep(0.8, 0.9, sin(vUv.x * 40.0 + 2.0) * sin(vUv.y * 40.0 + 2.0));
            
            vec3 moonColor = vec3(0.9, 0.9, 0.85);
            moonColor -= crater1 * 0.3;
            moonColor -= crater2 * 0.2;
            
            // 조명 효과
            float lighting = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0)));
            moonColor *= max(0.4, lighting);
            
            gl_FragColor = vec4(moonColor, 1.0);
          }
        `,
      });

      return new THREE.Mesh(geometry, material);
    };

    /**
     * 별 생성
     */
    const createStars = () => {
      const geometry = new THREE.BufferGeometry();
      const starCount = 800;
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);

      for (let i = 0; i < starCount; i++) {
        // 구 표면에 랜덤 배치
        const radius = 80;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // 별 색상 (다양한 색온도)
        const temp = 0.3 + Math.random() * 0.4;
        colors[i * 3] = 0.8 + temp * 0.2; // R
        colors[i * 3 + 1] = 0.8 + temp * 0.1; // G
        colors[i * 3 + 2] = 0.9; // B

        sizes[i] = Math.random() * 0.8 + 0.2;
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
        },
        vertexShader: `
          attribute float size;
          uniform float time;
          varying vec3 vColor;
          varying float vSize;
          
          void main() {
            vColor = color;
            vSize = size;
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z) * (0.8 + sin(time * 2.0 + position.x) * 0.2);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vSize;
          
          void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            if (dist > 0.5) discard;
            
            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            gl_FragColor = vec4(vColor, alpha * 0.8);
          }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Points(geometry, material);
    };

    /**
     * 구름 생성
     */
    const createClouds = () => {
      const group = new THREE.Group();

      for (let i = 0; i < 8; i++) {
        const geometry = new THREE.SphereGeometry(
          1.5 + Math.random() * 1.0,
          16,
          16
        );

        const material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.6,
        });

        const cloud = new THREE.Mesh(geometry, material);
        cloud.position.set(
          (Math.random() - 0.5) * 40,
          2 + Math.random() * 6,
          -8 - Math.random() * 12
        );

        cloud.scale.setScalar(0.6 + Math.random() * 0.8);
        group.add(cloud);
      }

      return group;
    };

    /**
     * 비 파티클 생성
     */
    const createRain = () => {
      const geometry = new THREE.BufferGeometry();
      const count = 1000;
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = Math.random() * 30;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        velocities[i * 3] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 1] = -0.2 - Math.random() * 0.3;
        velocities[i * 3 + 2] = 0;
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        "velocity",
        new THREE.BufferAttribute(velocities, 3)
      );

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          intensity: { value: 1.0 },
        },
        vertexShader: `
          attribute vec3 velocity;
          uniform float time;
          uniform float intensity;
          varying float vOpacity;
          
          void main() {
            vOpacity = intensity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 2.0 * intensity;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float time;
          varying float vOpacity;
          
          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float rain = 1.0 - smoothstep(0.0, 0.3, abs(center.x)) * 
                               smoothstep(0.0, 0.5, abs(center.y));
            
            if (rain < 0.1) discard;
            
            gl_FragColor = vec4(0.4, 0.6, 0.9, rain * vOpacity * 0.8);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Points(geometry, material);
    };

    /**
     * 눈 파티클 생성
     */
    const createSnow = () => {
      const geometry = new THREE.BufferGeometry();
      const count = 500;
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);
      const rotations = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = Math.random() * 25;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

        velocities[i * 3] = (Math.random() - 0.5) * 0.03;
        velocities[i * 3 + 1] = -0.04 - Math.random() * 0.06;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

        rotations[i] = Math.random() * Math.PI * 2;
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        "velocity",
        new THREE.BufferAttribute(velocities, 3)
      );
      geometry.setAttribute(
        "rotation",
        new THREE.BufferAttribute(rotations, 1)
      );

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0.0 },
          intensity: { value: 1.0 },
        },
        vertexShader: `
          attribute vec3 velocity;
          attribute float rotation;
          uniform float time;
          uniform float intensity;
          varying float vRotation;
          varying float vOpacity;
          
          void main() {
            vRotation = rotation + time * 0.3;
            vOpacity = intensity;
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 8.0 * intensity;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float time;
          varying float vRotation;
          varying float vOpacity;
          
          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            
            // 회전 적용
            float c = cos(vRotation);
            float s = sin(vRotation);
            center = vec2(c * center.x - s * center.y, s * center.x + c * center.y);
            
            // 눈송이 패턴
            float angle = atan(center.y, center.x);
            float radius = length(center);
            float snowflake = cos(angle * 6.0) * 0.3 + 0.7;
            float alpha = 1.0 - smoothstep(snowflake * 0.3, snowflake * 0.5, radius);
            
            if (alpha < 0.1) discard;
            
            gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * vOpacity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });

      return new THREE.Points(geometry, material);
    };

    // 씬 객체들 생성
    const sky = createSky();
    const sun = createSun();
    const moon = createMoon();
    const stars = createStars();
    const clouds = createClouds();
    const raindrops = createRain();
    const snowflakes = createSnow();

    // 씬에 추가
    scene.add(sky);
    scene.add(sun);
    scene.add(moon);
    scene.add(stars);
    scene.add(clouds);
    scene.add(raindrops);
    scene.add(snowflakes);

    const sceneData: SceneRef = {
      scene,
      camera,
      renderer,
      sun,
      moon,
      stars,
      clouds,
      raindrops,
      snowflakes,
      sky,
      animationId: null,
      lastUpdateTime: 0,
    };

    sceneRef.current = sceneData;
    console.log("WebGL 씬 초기화 완료");

    return sceneData;
  }, []);

  /**
   * 씬 업데이트 (애니메이션 루프)
   */
  const updateScene = useCallback(() => {
    if (!sceneRef.current || !weatherData) return;

    const {
      scene,
      camera,
      renderer,
      sun,
      moon,
      stars,
      clouds,
      raindrops,
      snowflakes,
      sky,
    } = sceneRef.current;

    const currentTime = performance.now();
    const deltaTime = currentTime - sceneRef.current.lastUpdateTime;
    sceneRef.current.lastUpdateTime = currentTime;

    const time = currentTime * 0.001;

    // 하늘 색상 업데이트
    if (sky.material instanceof THREE.ShaderMaterial) {
      const colors = {
        dawn: { top: 0xff6b6b, bottom: 0xffe66d },
        day: { top: 0x87ceeb, bottom: 0xe0f6ff },
        dusk: { top: 0xff4500, bottom: 0xffb347 },
        night: { top: 0x191970, bottom: 0x000080 },
      };

      const colorSet = colors[timeOfDay] || colors.day;
      sky.material.uniforms.topColor.value.setHex(colorSet.top);
      sky.material.uniforms.bottomColor.value.setHex(colorSet.bottom);
      sky.material.uniforms.time.value = time;
    }

    // 태양/달 위치 업데이트
    const currentTimestamp = Date.now() / 1000;
    const sunPos = calculateSunPosition(
      currentTimestamp,
      weatherData.sys.sunrise,
      weatherData.sys.sunset
    );
    const moonPos = calculateMoonPosition(sunPos);

    sun.position.set(sunPos.x * 15, sunPos.y * 10, -8);
    sun.visible = sunPos.y > -0.1;

    moon.position.set(moonPos.x * 15, moonPos.y * 10, -8);
    moon.visible = sunPos.y < 0.1;

    if (moon.material instanceof THREE.ShaderMaterial) {
      moon.material.uniforms.time.value = time;
    }

    // 별 표시 (밤/새벽에만)
    stars.visible = timeOfDay === "night" || timeOfDay === "dawn";
    if (stars.visible && stars.material instanceof THREE.ShaderMaterial) {
      stars.material.uniforms.time.value = time;
    }

    // 구름 애니메이션
    clouds.children.forEach((cloud, index) => {
      cloud.position.x += Math.sin(time * 0.1 + index) * 0.002;
      if (cloud.position.x > 25) cloud.position.x = -25;
      if (cloud.position.x < -25) cloud.position.x = 25;
    });

    // 날씨 효과 강도 계산
    const intensity = calculateWeatherIntensity(weatherCondition, weatherData);

    // 비 효과 업데이트
    const isRaining =
      weatherCondition === "rain" ||
      weatherCondition === "drizzle" ||
      weatherCondition === "thunderstorm";
    raindrops.visible = isRaining;

    if (isRaining && raindrops.material instanceof THREE.ShaderMaterial) {
      raindrops.material.uniforms.time.value = time;
      raindrops.material.uniforms.intensity.value = intensity.visual;

      const positions = raindrops.geometry.attributes.position
        .array as Float32Array;
      const velocities = raindrops.geometry.attributes.velocity
        .array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        if (positions[i + 1] < -15) {
          positions[i + 1] = 15;
          positions[i] = (Math.random() - 0.5) * 50;
        }
      }
      raindrops.geometry.attributes.position.needsUpdate = true;
    }

    // 눈 효과 업데이트
    const isSnowing = weatherCondition === "snow";
    snowflakes.visible = isSnowing;

    if (isSnowing && snowflakes.material instanceof THREE.ShaderMaterial) {
      snowflakes.material.uniforms.time.value = time;
      snowflakes.material.uniforms.intensity.value = intensity.visual;

      const positions = snowflakes.geometry.attributes.position
        .array as Float32Array;
      const velocities = snowflakes.geometry.attributes.velocity
        .array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] + Math.sin(time * 0.5 + i * 0.01) * 0.002;
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        if (positions[i + 1] < -12) {
          positions[i + 1] = 12;
          positions[i] = (Math.random() - 0.5) * 40;
        }
      }
      snowflakes.geometry.attributes.position.needsUpdate = true;
    }

    // 구름 가시성 및 투명도
    const cloudOpacity =
      weatherCondition === "clouds" ? intensity.opacity : 0.3;
    clouds.visible = cloudOpacity > 0.1;
    clouds.children.forEach((cloud) => {
      if (
        cloud instanceof THREE.Mesh &&
        cloud.material instanceof THREE.MeshBasicMaterial
      ) {
        cloud.material.opacity = cloudOpacity;
      }
    });

    // 렌더링
    renderer.render(scene, camera);
  }, [weatherData, weatherCondition, timeOfDay]);

  /**
   * 애니메이션 루프
   */
  const animate = useCallback(() => {
    if (!sceneRef.current) return;

    updateScene();
    sceneRef.current.animationId = requestAnimationFrame(animate);
  }, [updateScene]);

  /**
   * 윈도우 리사이즈 핸들러
   */
  const handleResize = useCallback(() => {
    if (!sceneRef.current) return;

    const { camera, renderer } = sceneRef.current;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, []);

  /**
   * 컴포넌트 마운트/언마운트 효과
   */
  useEffect(() => {
    if (mode !== "sync") return;

    // WebGL 지원 확인
    if (!isWebGLSupported()) {
      console.warn("WebGL이 지원되지 않아 CSS 폴백을 사용합니다");
      return;
    }

    try {
      const sceneData = initScene();
      if (sceneData) {
        animate();
        window.addEventListener("resize", handleResize);
      }
    } catch (error) {
      console.error("WebGL 초기화 실패:", error);
    }

    return () => {
      // 정리 작업
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      window.removeEventListener("resize", handleResize);

      if (sceneRef.current?.renderer) {
        sceneRef.current.renderer.dispose();
      }
      sceneRef.current = null;
    };
  }, [mode, initScene, animate, handleResize]);

  // 싱크 모드가 아니면 아무것도 렌더링하지 않음
  if (mode !== "sync") return null;

  // WebGL 미지원시 CSS 폴백
  if (!isWebGLSupported()) {
    return renderFallback();
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    />
  );
};
