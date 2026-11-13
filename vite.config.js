import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Vite entry lives in src/index.html (root: 'src') so that the built
// output can be copied to the repo root for GitHub Pages without
// overwriting the source entry. base './' makes asset URLs relative, so
// they load under the GitHub Pages subpath /ai-webdev-studio/.
export default defineConfig({
  root: "src",
  base: "./",
  plugins: [react()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
