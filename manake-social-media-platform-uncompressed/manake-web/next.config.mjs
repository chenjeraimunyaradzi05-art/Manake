/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '.next',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  assetPrefix: undefined,
  basePath: ''
}

export default nextConfig
