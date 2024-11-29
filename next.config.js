/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    compiler: {
      emotion: true,
      styledComponents: true
    },
    experimental: {
      esmExternals: false,
      optimizeCss: true,
      optimizePackageImports: ['@mui/material', '@mui/icons-material', 'react-icons'],
      scrollRestoration: true,
      workerThreads: true,
      cpus: 4
    },
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'res.cloudinary.com',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: '**',
        },
        {
          hostname: 'ipfs.io'
        }
      ],
      domains: ['res.cloudinary.com'],
      unoptimized: false,
      minimumCacheTTL: 60,
      formats: ['image/webp'],
      deviceSizes: [640, 828, 1200, 1920],
      imageSizes: [16, 32, 64, 96, 128, 256],
    },
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@mui/styled-engine': '@mui/styled-engine-sc'
      };

      config.module.rules.push({
        test: /\.json$/,
        type: 'javascript/auto',
        use: ['json-loader']
      });

      config.module.rules.push({
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['next/babel']
          }
        }
      });

      return config;
    },
    transpilePackages: [
      '@mui/material',
      '@mui/system',
      '@mui/icons-material',
      '@mui/styled-engine-sc',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
      '@coral-xyz/anchor'
    ]
};

module.exports = nextConfig; 