/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/nexus/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/:path*"
            : "/nexus/index.py", // Vercel serverless function
      },
      {
        source: "/nexus",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/"
            : "/nexus/index.py",
      },
    ];
  },
};

export default nextConfig;
