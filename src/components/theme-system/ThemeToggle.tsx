// theme-system/ThemeToggle.tsx

import React from "react";
import { useThemeContext } from "./ThemeProvider";
import type { ThemeMode } from "./types";

/**
 * 테마 토글 컴포넌트의 Props
 */
interface ThemeToggleProps {
  /** 추가 CSS 클래스 */
  className?: string;
  /** 버튼 크기 */
  size?: "sm" | "md" | "lg";
  /** 세로 배치 여부 */
  vertical?: boolean;
  /** 간단한 순환 버튼으로 표시 */
  simple?: boolean;
  /** 로딩/에러 상태 표시 여부 */
  showStatus?: boolean;
}

/**
 * 테마 토글 컴포넌트
 * 라이트/다크/싱크 모드를 전환할 수 있는 버튼들을 제공합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * <ThemeToggle />
 *
 * // 크기와 배치 옵션
 * <ThemeToggle size="lg" vertical />
 *
 * // 간단한 순환 버튼
 * <ThemeToggle simple />
 * ```
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  size = "md",
  vertical = false,
  simple = false,
  showStatus = true,
}) => {
  const { mode, setMode, isLoading, error } = useThemeContext();

  // 크기별 스타일
  const sizeStyles = {
    sm: {
      button: "px-2 py-1 text-xs",
      icon: "text-sm",
      gap: "gap-1",
    },
    md: {
      button: "px-3 py-2 text-sm",
      icon: "text-base",
      gap: "gap-2",
    },
    lg: {
      button: "px-4 py-3 text-base",
      icon: "text-lg",
      gap: "gap-3",
    },
  };

  const currentSize = sizeStyles[size];

  // 테마 옵션 정의
  const themeOptions: Array<{
    mode: ThemeMode;
    icon: string;
    label: string;
    description: string;
    color: string;
  }> = [
    {
      mode: "light",
      icon: "☀️",
      label: "라이트",
      description: "밝은 테마",
      color: "from-yellow-400 to-orange-400",
    },
    {
      mode: "dark",
      icon: "🌙",
      label: "다크",
      description: "어두운 테마",
      color: "from-purple-500 to-indigo-600",
    },
    {
      mode: "sync",
      icon: "🌍",
      label: "싱크",
      description: "실시간 날씨 & 시간 반영",
      color: "from-blue-500 to-green-500",
    },
  ];

  /**
   * 테마 변경 핸들러
   */
  const handleThemeChange = (newMode: ThemeMode) => {
    if (isLoading) return; // 로딩 중에는 변경 불가
    setMode(newMode);
  };

  /**
   * 순환 테마 변경 (단순 모드용)
   */
  const cycleTheme = () => {
    if (isLoading) return;

    const currentIndex = themeOptions.findIndex(
      (option) => option.mode === mode
    );
    const nextIndex = (currentIndex + 1) % themeOptions.length;
    handleThemeChange(themeOptions[nextIndex].mode);
  };

  // 기본 버튼 스타일
  const baseButtonClass = `
    ${currentSize.button}
    font-medium rounded-lg transition-all duration-300 
    border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
    transform hover:scale-[1.02] active:scale-[0.98]
    shadow-sm hover:shadow-md
  `;

  // 간단한 순환 버튼 모드
  if (simple) {
    const currentOption = themeOptions.find((option) => option.mode === mode)!;

    return (
      <div className={className}>
        <button
          onClick={cycleTheme}
          disabled={isLoading}
          title={`현재: ${currentOption.description}. 클릭하여 변경`}
          className={`
            ${baseButtonClass}
            bg-gradient-to-r ${currentOption.color}
            text-white border-transparent
            hover:brightness-110
          `}
        >
          <span className={`mr-2 ${currentSize.icon}`}>
            {isLoading ? "⏳" : currentOption.icon}
          </span>
          <span>{currentOption.label}</span>
        </button>

        {/* 에러 표시 */}
        {showStatus && error && (
          <div className="mt-1 text-xs text-red-500 max-w-xs">{error}</div>
        )}
      </div>
    );
  }

  // 기본 모드 (개별 버튼들)
  return (
    <div className={className}>
      {/* 에러 메시지 */}
      {showStatus && error && (
        <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="text-xs text-red-700 dark:text-red-400 font-medium">
            오류 발생
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
            {error}
          </div>
        </div>
      )}

      {/* 버튼 그룹 */}
      <div
        className={`
        flex ${vertical ? "flex-col" : "flex-row"} ${currentSize.gap}
      `}
      >
        {themeOptions.map((option) => {
          const isActive = mode === option.mode;
          const isDisabled = isLoading;

          return (
            <button
              key={option.mode}
              onClick={() => handleThemeChange(option.mode)}
              disabled={isDisabled}
              title={option.description}
              className={`
                ${baseButtonClass}
                relative overflow-hidden group
                ${
                  isActive
                    ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg scale-105`
                    : `bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                     border-gray-300 dark:border-gray-600 
                     hover:bg-gray-50 dark:hover:bg-gray-700
                     hover:border-gray-400 dark:hover:border-gray-500`
                }
              `}
            >
              {/* 활성 상태 배경 효과 */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
              )}

              {/* 아이콘 */}
              <span
                className={`
                ${currentSize.icon} mr-2 relative z-10
                ${isLoading && isActive ? "animate-pulse" : ""}
              `}
              >
                {isLoading && isActive ? "⏳" : option.icon}
              </span>

              {/* 라벨 */}
              <span className="relative z-10 font-medium">{option.label}</span>

              {/* 호버 효과 */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* 상태 정보 표시 */}
      {showStatus && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>현재 모드:</span>
            <span className="font-medium">
              {themeOptions.find((opt) => opt.mode === mode)?.label}
            </span>
          </div>

          {mode === "sync" && (
            <div className="flex items-center justify-between">
              <span>상태:</span>
              <span className="flex items-center gap-1">
                {isLoading ? (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span>업데이트 중</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>연결됨</span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 컴팩트한 아이콘 전용 토글 버튼
 * 공간이 제한된 헤더나 사이드바에서 사용하기 적합합니다.
 */
export const CompactThemeToggle: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  const { mode, setMode, isLoading } = useThemeContext();

  const themeMap: Record<
    ThemeMode,
    { next: ThemeMode; icon: string; color: string }
  > = {
    light: { next: "dark", icon: "☀️", color: "text-yellow-500" },
    dark: { next: "sync", icon: "🌙", color: "text-purple-400" },
    sync: { next: "light", icon: "🌍", color: "text-blue-500" },
  };

  const current = themeMap[mode];

  return (
    <button
      onClick={() => setMode(current.next)}
      disabled={isLoading}
      title={`현재: ${mode} 모드. 클릭하여 변경`}
      className={`
        p-2 rounded-full transition-all duration-300
        bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
        border border-gray-300 dark:border-gray-600
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-110 active:scale-95
        ${className}
      `}
    >
      <span
        className={`
        text-lg ${current.color}
        ${isLoading ? "animate-spin" : ""}
      `}
      >
        {isLoading ? "⏳" : current.icon}
      </span>
    </button>
  );
};

/**
 * 드롭다운 스타일의 테마 선택기
 */
export const DropdownThemeToggle: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  const { mode, setMode, isLoading } = useThemeContext();

  const themeOptions = [
    { mode: "light" as ThemeMode, icon: "☀️", label: "라이트 모드" },
    { mode: "dark" as ThemeMode, icon: "🌙", label: "다크 모드" },
    { mode: "sync" as ThemeMode, icon: "🌍", label: "싱크 모드" },
  ];

  return (
    <select
      value={mode}
      onChange={(e) => setMode(e.target.value as ThemeMode)}
      disabled={isLoading}
      className={`
        px-3 py-2 pr-8 rounded-lg border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        appearance-none cursor-pointer
        ${className}
      `}
    >
      {themeOptions.map((option) => (
        <option key={option.mode} value={option.mode}>
          {option.icon} {option.label}
        </option>
      ))}
    </select>
  );
};
