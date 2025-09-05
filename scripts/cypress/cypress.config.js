import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    video: !!process.env.CI, // Enable video only in CI
    screenshotOnRunFailure: true,
    specPattern: 'scripts/cypress/integration/**/*.spec.{js,jsx,ts,tsx}',
    supportFile: 'scripts/cypress/support/index.js',
    baseUrl: 'http://localhost:4000',
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null
        }
      })
    },
  },
}) 