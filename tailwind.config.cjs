// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // React 파일들
    "./public/index.html",
  ],

  // 다크 모드 설정 - 이 줄이 매우 중요합니다!
  darkMode: "class", // 'class' 전략 사용 (테마 시스템에서 HTML 클래스로 제어)

  theme: {
    extend: {
      // 테마 시스템에서 사용할 수 있는 추가 색상들
      colors: {
        // 싱크 모드용 동적 색상
        "theme-primary": "var(--theme-primary-color, #3b82f6)",
        "theme-secondary": "var(--theme-secondary-color, #64748b)",

        // 날씨별 색상
        "weather-clear": "#87ceeb",
        "weather-clouds": "#708090",
        "weather-rain": "#4682b4",
        "weather-snow": "#f0f8ff",
        "weather-storm": "#2f4f4f",
      },

      // 애니메이션 확장
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      // 백드롭 블러 효과
      backdropBlur: {
        xs: "2px",
      },
    },
  },

  plugins: [
    // 선택사항: 유용한 Tailwind 플러그인들
    // require('@tailwindcss/forms'), // 폼 스타일 개선
    // require('@tailwindcss/typography'), // prose 클래스 지원
  ],
};
