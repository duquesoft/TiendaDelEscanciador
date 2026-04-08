/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
			{
				source: "/:path*",
				has: [
					{
						type: "header",
						key: "host",
						value: "tiendadelescanciador.com",
					},
				],
				permanent: true,
				destination: "https://www.tiendadelescanciador.com/:path*",
			},
		];
	},
};

module.exports = nextConfig;