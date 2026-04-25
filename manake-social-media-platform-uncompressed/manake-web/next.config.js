/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is a Vite project, not Next.js, but we need this file to satisfy the Next.js plugin
  // The plugin will still fail, but this might help with configuration detection
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
