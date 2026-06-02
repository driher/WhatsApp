/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},

  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.1.9",
    "https://wa.apadansiapa.com"
  ],
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
});

module.exports = nextConfig;