/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    publicRuntimeConfig: {
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
        {
          hostname: "ipfs.io"
        },
        {
          hostname: "res.cloudinary.com"
        }
      ],
    },
};

export default nextConfig;
