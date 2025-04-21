import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // დავამატოთ ლოკალჰოსტიც და ngrok-ის მისამართიც
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://5d2a-2a00-23c6-731a-4d01-5367-cc94-7ee4-ed7.ngrok-free.app"
  ],
};

export default nextConfig;