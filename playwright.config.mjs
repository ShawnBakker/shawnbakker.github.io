import { defineConfig } from '@playwright/test';

// Small smoke suite for a static portfolio. Serves the repo root over HTTP and
// checks that both pages render, the theme toggle works, the CTAs resolve, and
// no console errors surface. Content-level guards (retired figures, dead links,
// CNAME) live in the CI workflow as fast grep checks.
export default defineConfig({
  testDir: './tests',
  reporter: 'line',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'python3 -m http.server 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
