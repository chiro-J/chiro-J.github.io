import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config([
  // 전역 무시 파일들
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.ts"],
  },

  // 기본 JavaScript/TypeScript 설정
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // TypeScript 관련 규칙
      "no-unused-vars": "off", // TypeScript에서 처리
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off", // any 타입 허용 (필요시)
      "@typescript-eslint/no-non-null-assertion": "warn",

      // React Hooks 규칙
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "warn", // 의존성 배열 경고만

      // React Refresh 규칙
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // 일반적인 코드 품질 규칙
      "prefer-const": "warn",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],

      // 우리 프로젝트에 맞는 추가 규칙들
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-eval": "error",

      // 스타일 관련 (선택사항)
      indent: ["warn", 2, { SwitchCase: 1 }],
      quotes: ["warn", "single", { allowTemplateLiterals: true }],
      semi: ["warn", "always"],
      "comma-dangle": ["warn", "es5"],
      "object-curly-spacing": ["warn", "always"],
      "array-bracket-spacing": ["warn", "never"],
    },
  },

  // TypeScript 파일 전용 설정
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // TypeScript에서만 적용할 추가 규칙들
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
    },
  },

  // React 컴포넌트 파일 전용 설정
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      // React 컴포넌트에서만 적용할 규칙들
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // 테스트 파일 설정 (나중을 위해)
  {
    files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      // 테스트 파일에서는 좀 더 관대하게
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },

  // 설정 파일들 (config 파일들)
  {
    files: [
      "*.config.{js,ts}",
      "vite.config.{js,ts}",
      "tailwind.config.{js,ts}",
    ],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // 설정 파일에서는 관대하게
      "@typescript-eslint/no-var-requires": "off",
      "no-console": "off",
    },
  },
]);
