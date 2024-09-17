import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import zipPack from "vite-plugin-zip-pack";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

const file = fileURLToPath(new URL("package.json", import.meta.url));
const json = readFileSync(file, "utf8");
const pkg = JSON.parse(json);
// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    return {
        define: {
            "process.env": env,
        },
        plugins: [
            react(),
            TanStackRouterVite(),
            zipPack({
                outDir: "build/bundle/",
                outFileName: `${pkg.name}-${pkg.version}.zip`,
                inDir: "build/app/",
            }),
        ],
        base: "./",
        build: {
            outDir: "./build/app",
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
});
