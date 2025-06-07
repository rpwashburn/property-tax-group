/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      // Specific FastAPI endpoints
      {
        source: "/api/hello",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/hello"
            : "/api/",
      },
      {
        source: "/api/health",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/health"
            : "/api/",
      },
      // FastAPI docs
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
    ];
  },
};

export default nextConfig;