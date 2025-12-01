/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
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

    // Handle .mjs files as external modules (don't bundle them)
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    })

    // Exclude .mjs from optimization/minification
    if (config.optimization) {
      config.optimization.minimize = true
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'SwcMinifyPlugin') {
            // SWC minifier - exclude .mjs files
            minimizer.options = {
              ...minimizer.options,
              exclude: /\.mjs$/,
            }
          }
        })
      }
    }

    return config
  },
}

module.exports = nextConfig

