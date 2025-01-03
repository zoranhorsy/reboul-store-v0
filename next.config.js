/** @type {import('next').NextConfig} */
const nextConfig = {
    // Désactiver le linting lors du build
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Désactiver la vérification des types lors du build
    typescript: {
        ignoreBuildErrors: true,
    },
    reactStrictMode: true,
    experimental: { appDir: true },
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });
        return config;
    }
}

module.exports = nextConfig

