/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/nexus/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/:path*"
            : "/api/nexus.py?path=:path*", // Send path as query parameter
      },
      {
        source: "/nexus",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/"
            : "/api/nexus.py",
      },
    ];
  },
};

export default nextConfig;
