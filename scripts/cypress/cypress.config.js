import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    video: !!process.env.CI, // Enable video only in CI
    screenshotOnRunFailure: true,
    // Specify the integration folder to maintain compatibility with existing tests
    specPattern: 'integration/**/*.spec.{js,jsx,ts,tsx}',
    supportFile: 'support/index.js',
    setupNodeEvents(on, config) {
      // Migrated from plugins/index.js
      on('task', {
        log(message) {
          console.log(message);
          return null
        }
      })
    },
  },
}) 