import { join } from 'pathe'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import parts from './parts'
import type { PWAOptions, PWAContext } from './types'

export default defineNuxtModule<PWAOptions>({
  meta: {
    name: 'pwa'
  },
  defaults: nuxt => ({
    icon: {
      source: null,
      sizes: [],
      maskablePadding: 20,
      fileName: 'icon.png',
      targetDir: 'icons',
      splash: {
        backgroundColor: undefined,
        devices: [],
        targetDir: 'splash'
      }
    },
    manifest: {
      name: process.env.npm_package_name!,
      short_name: process.env.npm_package_name!,
      description: process.env.npm_package_description!,
      lang: 'en',
      start_url: nuxt.options.app.baseURL + '?standalone=true',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: []
    },
    meta: {
      name: process.env.npm_package_name!,
      author: process.env.npm_package_author_name!,
      description: process.env.npm_package_description!,
      favicon: true,
      mobileApp: true,
      mobileAppIOS: false,
      appleStatusBarStyle: false,
      theme_color: undefined,
      lang: 'en',
      ogType: 'website',
      ogSiteName: true,
      ogTitle: true,
      ogDescription: true,
      ogImage: true,
      ogHost: undefined,
      ogUrl: true,
      twitterCard: undefined,
      twitterSite: undefined,
      twitterCreator: undefined
    },
    workbox: {
      enabled: !nuxt.options.dev,
      workboxVersion: '6.5.3',
      workboxUrl: null
      // TODO: More Workbox options
    }
  }),
  async setup (options, nuxt) {
    const ctx: PWAContext = {
      ...options,
      // Nitro serve assets from .nuxt/dist/client by default
      _rootDir: join(nuxt.options.buildDir, 'pwa'),
      _assetsDir: join(nuxt.options.buildDir, 'pwa/assets'),
      _resolver: createResolver(import.meta.url)
    }

    for (const part of parts) {
      await part(ctx)
    }

    // Use nitro public assets to serve `sw.js`, `manifest.json` and assets (icons / splash screens)
    const { nitro, app: { buildAssetsDir } } = nuxt.options
    nitro.publicAssets = nitro.publicAssets || []
    nitro.publicAssets.push({ dir: ctx._rootDir, baseURL: '/' })
    nitro.publicAssets.push({ dir: ctx._assetsDir, baseURL: buildAssetsDir })
  }
})
