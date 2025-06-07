/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      // FastAPI docs - these go first since they're not under /api
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/docs"
            : "/api/docs",
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/openapi.json"
            : "/api/openapi.json",
      },
      // Keep Next.js API routes - these are checked BEFORE the catch-all
      // The :path* syntax preserves all path segments after the base path
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*", // Keep as Next.js route
      },
      {
        source: "/api/analyze/:path*", 
        destination: "/api/analyze/:path*", // Keep as Next.js route
      },
      // Catch-all: Everything else under /api goes to FastAPI
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/:path*"
            : "/api/",
      },
    ];
  },
};

export default nextConfig;