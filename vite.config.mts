import {defineConfig, optimizeDeps} from 'vite'
import solidPlugin from 'vite-plugin-solid'
import {crx, defineManifest} from '@crxjs/vite-plugin'
import manifest from './manifest.json'

const manifestGen = defineManifest(env => ({
  ...manifest,
  name: env.mode == "development" ? "DEV-" + Date() : "Redirect to..."
}))

export default defineConfig({
  plugins: [
    solidPlugin(),
    crx({manifest: manifestGen}),
  ],
})