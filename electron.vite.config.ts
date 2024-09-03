import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import native from 'rollup-plugin-native'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), native()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {}
})
