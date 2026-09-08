/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', '@prisma/client', 'prisma', 'bcryptjs']
  }
};

export default nextConfig;
