/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

export {};

declare global {
  interface ImportMeta {
    readonly env: import('vite').ImportMetaEnv;
  }
}
