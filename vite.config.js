/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const VITE_API_URL = env.VITE_API_URL || 'http://localhost:8080'

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      proxy: {
        '/api': {
          target: VITE_API_URL,
          changeOrigin: true,
        }
      }
    }
  }
})
