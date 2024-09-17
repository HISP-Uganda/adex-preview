import fs, { readFileSync } from "fs";
import { fileURLToPath } from "url";

const file = fileURLToPath(new URL("package.json", import.meta.url));
const json = readFileSync(file, "utf8");
const pkg = JSON.parse(json);

const webapp = {
    appType: "APP",
    short_name: pkg.name,
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    launch_path: "index.html",
    default_locale: "en",
    activities: {
        dhis: {
            href: "*",
        },
    },
    icons: {
        48: "dhis2-app-icon.svg",
    },
    manifest_generated_at: new Date().toISOString(),
    display: "standalone",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    scope: ".",
};

fs.writeFileSync("./public/manifest.webapp", JSON.stringify(webapp, null, 2));
