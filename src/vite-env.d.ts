/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENWEATHER_API_KEY: string;
  readonly VITE_APP_ENV: string;
  // 필요한 다른 환경변수들도 여기에 추가
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "three" {
  export * from "three/src/Three";
}
