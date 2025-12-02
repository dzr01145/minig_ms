/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BASIC_AUTH_USER?: string
    readonly VITE_BASIC_AUTH_PASSWORD?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
