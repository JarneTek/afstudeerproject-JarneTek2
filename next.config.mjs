/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tvwzbrqriefodmshwfil.supabase.co',
      },
    ],
  },
};

export default nextConfig;
