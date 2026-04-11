/** @type {import('next').NextConfig} */
const nextConfig = {
	// Orígenes de desarrollo permitidos para peticiones a /_next/* desde otros dispositivos
	// Añade aquí los orígenes que uses en tu red local (incluye protocolo y puerto)
	allowedDevOrigins: [
		'http://192.168.191.210',
		'http://192.168.191.210:3000',
		'http://192.168.191.210:3001',
		'http://localhost:3000',
		'http://127.0.0.1:3000'
	],
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