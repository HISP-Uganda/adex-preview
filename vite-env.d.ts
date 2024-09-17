/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DHIS2_API_URL: string;
    readonly VITE_DHIS2_USERNAME: string;
    readonly VITE_DHIS2_PASSWORD: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
