import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  ...(process.env.NEXT_PUBLIC_BUILD_ENV === 'production' && {
    output: 'standalone',
  })
};

export default nextConfig;
