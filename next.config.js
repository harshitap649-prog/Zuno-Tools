/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Optimize for Netlify
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        canvas: false,
      }
    }

    // Mark tesseract.js as external for server-side rendering only
    // This prevents Next.js from trying to bundle it on the server
    // Client-side will use dynamic import with eval to prevent build-time analysis
    if (isServer) {
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        if (!config.externals.includes('tesseract.js')) {
          config.externals.push('tesseract.js')
        }
      } else {
        config.externals = [config.externals, 'tesseract.js']
      }
    }

    // Add pdfjs-dist to resolve alias (only if not server-side)
    if (!isServer) {
      try {
        const pdfjsPath = require.resolve('pdfjs-dist')
        config.resolve.alias = {
          ...config.resolve.alias,
          
          'pdfjs-dist': pdfjsPath,
        }
      } catch (e) {
        // pdfjs-dist might not be installed, continue without alias
        console.warn('pdfjs-dist not found in node_modules, please run: npm install pdfjs-dist')
      }
    }

    // Add pdf-lib to resolve alias (only if not server-side)
    if (!isServer) {
      try {
        const pdfLibPath = require.resolve('pdf-lib')
        config.resolve.alias = {
          ...config.resolve.alias,
          'pdf-lib': pdfLibPath,
        }
      } catch (e) {
        // pdf-lib might not be installed, continue without alias
        console.warn('pdf-lib not found in node_modules, please run: npm install pdf-lib')
      }
    }

    // Add tesseract.js configuration (only if not server-side)
    // Don't mark as external for client-side - we want it bundled
    if (!isServer) {
      // Try to resolve tesseract.js if available (optional - won't fail if not found)
      try {
        const tesseractPath = require.resolve('tesseract.js')
        config.resolve.alias = {
          ...config.resolve.alias,
          'tesseract.js': tesseractPath,
        }
      } catch (e) {
        // tesseract.js might not be installed, continue without alias
        // This is okay - the dynamic import will handle it at runtime
      }
    }

    // Handle tesseract.js worker files
    config.module.rules.push({
      test: /tesseract\.worker\.(min\.)?js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]',
      },
    })

    // Handle .mjs files as external modules (don't bundle them)
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    })

    // Handle pdfjs-dist worker files
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]',
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

