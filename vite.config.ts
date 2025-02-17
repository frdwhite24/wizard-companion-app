import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    // Allow all hosts in development - you can be more restrictive if needed
    host: true,
  },
})
