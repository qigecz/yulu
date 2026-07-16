/** @type {import('next').NextConfig} */
const nextConfig = {
  // The marketing landing page is fully static — export it so nginx can serve
  // the prerendered HTML directly (no Node server needed in production).
  output: 'export',
  images: { unoptimized: true },
};
module.exports = nextConfig;
