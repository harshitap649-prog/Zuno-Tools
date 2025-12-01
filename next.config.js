/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true, // Disable image optimization for static export compatibility
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }

    // Exclude .mjs files from Terser minification to prevent import.meta errors
    config.optimization = {
      ...config.optimization,
      minimizer: config.optimization.minimizer.map((plugin) => {
        if (plugin.constructor.name === 'TerserPlugin') {
          return {
            ...plugin,
            options: {
              ...plugin.options,
              exclude: /\.mjs$/,
            },
          }
        }
        return plugin
      }),
    }

    // Don't bundle .mjs files - let them be served as static modules
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.mjs$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/chunks/[name].[hash][ext]',
          },
        },
      ],
    }

    return config
  },
}

module.exports = nextConfig

