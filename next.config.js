const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
//   typescript: {
//     // Fail the build on TS errors in CI/Vercel, but allow local dev to start.
//     ignoreBuildErrors: false,
//   },
//   webpack: (config) => {
//     // Optional: ensure TS path aliases work at runtime if needed by some tooling
//     // Next.js already respects tsconfig paths in imports at build time.
//     return config;
//   },
// };

// module.exports = nextConfig;
