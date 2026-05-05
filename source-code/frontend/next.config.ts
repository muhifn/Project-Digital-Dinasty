import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "i.pravatar.cc",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},

	// Proxy public API and upload paths to the Go backend.
	// Local default is localhost:8080; production should set GO_API_URL to Railway.
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: `${process.env.GO_API_URL || "http://localhost:8080"}/api/:path*`,
			},
			{
				source: "/uploads/:path*",
				destination: `${process.env.GO_API_URL || "http://localhost:8080"}/uploads/:path*`,
			},
		];
	},
};

export default nextConfig;
