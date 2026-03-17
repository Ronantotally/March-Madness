/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: "/((?!api).*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=3600, stale-while-revalidate=86400",
        },
      ],
    },
    {
      source: "/api/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
  ],
  poweredByHeader: false,
};

export default nextConfig;
