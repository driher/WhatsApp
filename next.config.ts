/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},

  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.1.9",
    " https://have-cookbook-pending-alexandria.trycloudflare.com"
  ],
};

module.exports = nextConfig;